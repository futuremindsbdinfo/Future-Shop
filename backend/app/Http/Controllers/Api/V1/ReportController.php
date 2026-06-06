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
     * @return array{CarbonImmutable, CarbonImmutable}
     */
    private function range(Request $request): array
    {
        $request->validate([
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date'],
        ]);

        $to = $request->filled('to')
            ? CarbonImmutable::parse($request->get('to'))->endOfDay()
            : CarbonImmutable::now()->endOfDay();

        $from = $request->filled('from')
            ? CarbonImmutable::parse($request->get('from'))->startOfDay()
            : $to->subDays(29)->startOfDay();

        return [$from, $to];
    }

    /**
     * Sales report: summary + daily breakdown + payment + status breakdowns.
     */
    public function sales(Request $request): JsonResponse
    {
        [$from, $to] = $this->range($request);

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

        // Daily buckets between from..to (inclusive).
        $daily = [];
        for ($d = $from; $d <= $to; $d = $d->addDay()) {
            $key = $d->toDateString();
            $daily[$key] = ['date' => $key, 'revenue' => 0.0, 'orders' => 0, 'cost' => 0.0, 'profit' => 0.0];
        }

        foreach ($orders as $o) {
            $d = $o->created_at?->toDateString();
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
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
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
        [$from, $to] = $this->range($request);

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
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'rows' => array_slice($rows, 0, 20),
            ],
        ]);
    }

    /**
     * Per-vendor performance in range.
     */
    public function vendors(Request $request): JsonResponse
    {
        [$from, $to] = $this->range($request);

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
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'rows' => $rows,
            ],
        ]);
    }

    /**
     * Export the sales report as CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        [$from, $to] = $this->range($request);
        $type = $request->get('type', 'sales');

        $filename = "report-{$type}-{$from->toDateString()}-to-{$to->toDateString()}.csv";

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
}
