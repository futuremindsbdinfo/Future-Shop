<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Vendor;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Resolve a [from, to] inclusive range from the request.
     * Defaults to the last 30 days.
     *
     * @return array{CarbonImmutable, CarbonImmutable, CarbonImmutable, CarbonImmutable}
     */
    private function range(Request $request): array
    {
        $request->validate([
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date'],
        ]);

        $tz = 'Asia/Dhaka';

        $toDhaka = $request->filled('to')
            ? CarbonImmutable::parse($request->get('to'), $tz)->endOfDay()
            : CarbonImmutable::now($tz)->endOfDay();

        $fromDhaka = $request->filled('from')
            ? CarbonImmutable::parse($request->get('from'), $tz)->startOfDay()
            : $toDhaka->subDays(29)->startOfDay();

        return [
            $fromDhaka->setTimezone('UTC'),
            $toDhaka->setTimezone('UTC'),
            $fromDhaka,
            $toDhaka,
        ];
    }

    /**
     * Sales report: summary + daily breakdown + payment + status breakdowns.
     */
    public function sales(Request $request): JsonResponse
    {
        [$from, $to, $fromDhaka, $toDhaka] = $this->range($request);

        $orders = Order::whereBetween('created_at', [$from, $to])->get();
        $paidOrderIds = $orders->where('payment_status', 'paid')->pluck('id');

        // Paid line-items + cost per item.
        $paidItems = OrderItem::whereIn('order_id', $paidOrderIds)
            ->with('product:id,cost_price')
            ->get();

        $totalRevenue = 0.0;
        $totalCost = 0.0;
        $costPerOrder = [];
        foreach ($paidItems as $item) {
            $lineRev = (float) $item->subtotal;
            $lineCost = (float) ($item->product?->cost_price ?? 0) * (int) $item->quantity;
            $totalRevenue += $lineRev;
            $totalCost += $lineCost;
            $costPerOrder[$item->order_id] = ($costPerOrder[$item->order_id] ?? 0.0) + $lineCost;
        }

        $totalOrders = $orders->count();
        $grossProfit = round($totalRevenue - $totalCost, 2);
        $profitMargin = $totalRevenue > 0 ? round(($grossProfit / $totalRevenue) * 100, 2) : 0.0;
        $avgOrderValue = $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0.0;

        // Daily buckets between fromDhaka..toDhaka (inclusive).
        $daily = [];
        for ($d = $fromDhaka; $d <= $toDhaka; $d = $d->addDay()) {
            $key = $d->toDateString();
            $daily[$key] = ['date' => $key, 'revenue' => 0.0, 'orders' => 0, 'cost' => 0.0, 'profit' => 0.0];
        }

        foreach ($orders as $o) {
            $d = CarbonImmutable::parse($o->created_at)->setTimezone('Asia/Dhaka')->toDateString();
            if (! isset($daily[$d])) {
                continue;
            }
            $daily[$d]['orders']++;
            if ($o->payment_status === 'paid') {
                $rev = (float) $o->total;
                $cost = (float) ($costPerOrder[$o->id] ?? 0);
                $daily[$d]['revenue'] += $rev;
                $daily[$d]['cost'] += $cost;
                $daily[$d]['profit'] += ($rev - $cost);
            }
        }
        $daily = array_values(array_map(function ($row) {
            $row['revenue'] = round($row['revenue'], 2);
            $row['cost'] = round($row['cost'], 2);
            $row['profit'] = round($row['profit'], 2);
            return $row;
        }, $daily));

        // Payment breakdown (sum totals of paid orders).
        $payment = ['cod' => 0.0, 'sslcommerz' => 0.0];
        foreach ($orders->where('payment_status', 'paid') as $o) {
            $bucket = $o->payment_method === 'cod' ? 'cod' : 'sslcommerz';
            $payment[$bucket] += (float) $o->total;
        }
        $payment['cod'] = round($payment['cod'], 2);
        $payment['sslcommerz'] = round($payment['sslcommerz'], 2);

        // Status breakdown.
        $status = ['pending' => 0, 'confirmed' => 0, 'processing' => 0, 'shipped' => 0, 'delivered' => 0, 'cancelled' => 0];
        foreach ($orders as $o) {
            if (isset($status[$o->order_status])) {
                $status[$o->order_status]++;
            }
        }

        return response()->json([
            'data' => [
                'from' => $fromDhaka->toDateString(),
                'to' => $toDhaka->toDateString(),
                'summary' => [
                    'total_revenue' => round($totalRevenue, 2),
                    'total_orders' => $totalOrders,
                    'total_cost' => round($totalCost, 2),
                    'gross_profit' => $grossProfit,
                    'profit_margin' => $profitMargin,
                    'avg_order_value' => $avgOrderValue,
                ],
                'daily_breakdown' => $daily,
                'payment_breakdown' => $payment,
                'status_breakdown' => $status,
            ],
        ]);
    }

    /**
     * Top selling products in range (paid orders only).
     */
    public function products(Request $request): JsonResponse
    {
        [$from, $to, $fromDhaka, $toDhaka] = $this->range($request);

        $paidItems = OrderItem::whereHas('order', fn ($q) => $q->where('payment_status', 'paid')->whereBetween('created_at', [$from, $to]))
            ->with('product:id,name,cost_price')
            ->get();

        $agg = [];
        foreach ($paidItems as $item) {
            $pid = $item->product_id;
            if (! isset($agg[$pid])) {
                $agg[$pid] = [
                    'product_name' => $item->product?->name ?? $item->product_name,
                    'units_sold' => 0,
                    'revenue' => 0.0,
                    'cost' => 0.0,
                ];
            }
            $agg[$pid]['units_sold'] += (int) $item->quantity;
            $agg[$pid]['revenue'] += (float) $item->subtotal;
            $agg[$pid]['cost'] += (float) ($item->product?->cost_price ?? 0) * (int) $item->quantity;
        }

        $rows = array_values(array_map(function ($r) {
            $profit = round($r['revenue'] - $r['cost'], 2);
            $margin = $r['revenue'] > 0 ? round(($profit / $r['revenue']) * 100, 2) : 0.0;
            return [
                'product_name' => $r['product_name'],
                'units_sold' => $r['units_sold'],
                'revenue' => round($r['revenue'], 2),
                'cost' => round($r['cost'], 2),
                'profit' => $profit,
                'margin' => $margin,
            ];
        }, $agg));

        usort($rows, fn ($a, $b) => $b['revenue'] <=> $a['revenue']);

        return response()->json([
            'data' => [
                'from' => $fromDhaka->toDateString(),
                'to' => $toDhaka->toDateString(),
                'rows' => array_slice($rows, 0, 20),
            ],
        ]);
    }

    /**
     * Per-vendor performance in range.
     */
    public function vendors(Request $request): JsonResponse
    {
        [$from, $to, $fromDhaka, $toDhaka] = $this->range($request);

        $paidItems = OrderItem::whereHas('order', fn ($q) => $q->where('payment_status', 'paid')->whereBetween('created_at', [$from, $to]))
            ->get(['id', 'order_id', 'vendor_id', 'subtotal', 'commission']);

        $vendorIds = $paidItems->pluck('vendor_id')->unique()->filter()->values();
        $vendors = Vendor::whereIn('id', $vendorIds)
            ->withCount('products')
            ->get(['id', 'shop_name'])
            ->keyBy('id');

        $agg = [];
        foreach ($paidItems as $item) {
            $vid = $item->vendor_id;
            if (! isset($agg[$vid])) {
                $agg[$vid] = [
                    'vendor_id' => $vid,
                    'vendor_name' => $vendors[$vid]->shop_name ?? '—',
                    'orders' => [],
                    'revenue' => 0.0,
                    'commission_earned' => 0.0,
                ];
            }
            $agg[$vid]['orders'][$item->order_id] = true;
            $agg[$vid]['revenue'] += (float) $item->subtotal;
            $agg[$vid]['commission_earned'] += (float) $item->commission;
        }

        $rows = array_values(array_map(function ($r) use ($vendors) {
            return [
                'vendor_name' => $r['vendor_name'],
                'orders_count' => count($r['orders']),
                'revenue' => round($r['revenue'], 2),
                'commission_earned' => round($r['commission_earned'], 2),
                'products_count' => $vendors[$r['vendor_id']]->products_count ?? 0,
            ];
        }, $agg));

        usort($rows, fn ($a, $b) => $b['revenue'] <=> $a['revenue']);

        return response()->json([
            'data' => [
                'from' => $fromDhaka->toDateString(),
                'to' => $toDhaka->toDateString(),
                'rows' => $rows,
            ],
        ]);
    }

    /**
     * Export the sales report as CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        [$from, $to, $fromDhaka, $toDhaka] = $this->range($request);
        $type = $request->get('type', 'sales');

        $filename = "report-{$type}-{$fromDhaka->toDateString()}-to-{$toDhaka->toDateString()}.csv";

        return response()->streamDownload(function () use ($type, $request) {
            $fh = fopen('php://output', 'w');
            if ($type === 'products') {
                fputcsv($fh, ['Product', 'Units Sold', 'Revenue', 'Cost', 'Profit', 'Margin %']);
                $resp = $this->products($request)->getData(true);
                foreach ($resp['data']['rows'] as $r) {
                    fputcsv($fh, [$r['product_name'], $r['units_sold'], $r['revenue'], $r['cost'], $r['profit'], $r['margin']]);
                }
            } elseif ($type === 'vendors') {
                fputcsv($fh, ['Vendor', 'Orders', 'Revenue', 'Commission Earned', 'Products']);
                $resp = $this->vendors($request)->getData(true);
                foreach ($resp['data']['rows'] as $r) {
                    fputcsv($fh, [$r['vendor_name'], $r['orders_count'], $r['revenue'], $r['commission_earned'], $r['products_count']]);
                }
            } else {
                fputcsv($fh, ['Date', 'Revenue', 'Orders', 'Cost', 'Profit']);
                $resp = $this->sales($request)->getData(true);
                foreach ($resp['data']['daily_breakdown'] as $r) {
                    fputcsv($fh, [$r['date'], $r['revenue'], $r['orders'], $r['cost'], $r['profit']]);
                }
            }
            fclose($fh);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Cache-Control' => 'no-store',
        ]);
    }

    /**
     * Delivery report for admin.
     */
    public function deliveryReport(Request $request): JsonResponse
    {
        [$from, $to, $fromDhaka, $toDhaka] = $this->range($request);

        // Fixed Dhaka-local quick windows (today / this week / this month) —
        // independent of the requested range; same boundary pattern as
        // DeliveryController@report (Dhaka wall-clock → UTC instants, because
        // delivered_at is stored in UTC).
        $nowDhaka = CarbonImmutable::now('Asia/Dhaka');
        $quickWindows = [
            'today_count' => [$nowDhaka->startOfDay()->utc(), $nowDhaka->endOfDay()->utc()],
            'week_count' => [$nowDhaka->startOfWeek()->utc(), $nowDhaka->endOfWeek()->utc()],
            'month_count' => [$nowDhaka->startOfMonth()->utc(), $nowDhaka->endOfMonth()->utc()],
        ];

        // Fetch all active delivery agents
        $deliveryUsers = \App\Models\User::where('role', 'delivery')
            ->where('is_active', true)
            ->get(['id', 'name', 'phone']);

        $rows = [];
        foreach ($deliveryUsers as $user) {
            $deliveredCount = Order::where('delivery_user_id', $user->id)
                ->where('order_status', 'delivered')
                ->whereBetween('delivered_at', [$from, $to])
                ->count();

            $collectedCash = Order::where('delivery_user_id', $user->id)
                ->where('order_status', 'delivered')
                ->where('payment_status', 'paid')
                ->where('payment_method', 'cod')
                ->whereBetween('delivered_at', [$from, $to])
                ->sum('total');

            // Cohort counts scope by created_at: orders carry no assigned_at
            // timestamp (delivery_user_id is a bare FK) and undelivered orders
            // never get a delivered_at, so created_at is the one date every
            // assigned order has.
            $assignedCount = Order::where('delivery_user_id', $user->id)
                ->whereBetween('created_at', [$from, $to])
                ->count();

            $pendingCount = Order::where('delivery_user_id', $user->id)
                ->whereIn('order_status', ['pending', 'processing', 'shipped'])
                ->whereBetween('created_at', [$from, $to])
                ->count();

            $cancelledCount = Order::where('delivery_user_id', $user->id)
                ->where('order_status', 'cancelled')
                ->whereBetween('created_at', [$from, $to])
                ->count();

            // delivered ÷ assigned, division-by-zero guarded. delivered is
            // delivery-date-scoped while assigned is order-date-scoped, so a
            // short range can legitimately read above 100%.
            $successRate = $assignedCount > 0
                ? round($deliveredCount / $assignedCount * 100, 1)
                : 0.0;

            $quickCounts = [];
            foreach ($quickWindows as $key => [$winFrom, $winTo]) {
                $quickCounts[$key] = Order::where('delivery_user_id', $user->id)
                    ->where('order_status', 'delivered')
                    ->whereBetween('delivered_at', [$winFrom, $winTo])
                    ->count();
            }

            $rows[] = [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'assigned_count' => $assignedCount,
                'delivered_count' => $deliveredCount,
                'pending_count' => $pendingCount,
                'cancelled_count' => $cancelledCount,
                'success_rate' => $successRate,
                'collected_cash' => (float) $collectedCash,
                'today_count' => $quickCounts['today_count'],
                'week_count' => $quickCounts['week_count'],
                'month_count' => $quickCounts['month_count'],
            ];
        }

        return response()->json([
            'data' => [
                'from' => $fromDhaka->toDateString(),
                'to' => $toDhaka->toDateString(),
                'rows' => $rows,
            ],
        ]);
    }
}
