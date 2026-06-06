<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnalyticsController extends Controller
{
    private const ALLOWED_RANGES = [7, 30, 90];

    /**
     * Admin: analytics summary for the last N days (7/30/90).
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'days' => ['sometimes', 'integer', Rule::in(self::ALLOWED_RANGES)],
        ]);

        $days = (int) $request->get('days', 30);
        $end = CarbonImmutable::now()->endOfDay();
        $start = $end->subDays($days - 1)->startOfDay();
        $prevStart = $start->subDays($days);
        $prevEnd = $start->subSecond();

        // --- Period orders (used for sales_by_day + status breakdown + totals).
        $periodOrders = Order::whereBetween('created_at', [$start, $end])->get();
        $prevOrders = Order::whereBetween('created_at', [$prevStart, $prevEnd])->get();

        // Sales-by-day bucketing.
        $sales_by_day = [];
        for ($i = 0; $i < $days; $i++) {
            $d = $start->addDays($i)->toDateString();
            $sales_by_day[$d] = ['date' => $d, 'revenue' => 0.0, 'orders' => 0];
        }
        foreach ($periodOrders as $o) {
            $d = $o->created_at?->toDateString();
            if ($d !== null && isset($sales_by_day[$d])) {
                if ($o->payment_status === 'paid') {
                    $sales_by_day[$d]['revenue'] += (float) $o->total;
                }
                $sales_by_day[$d]['orders'] += 1;
            }
        }
        $sales_by_day = array_values(array_map(function ($row) {
            $row['revenue'] = round($row['revenue'], 2);
            return $row;
        }, $sales_by_day));

        // Orders by status.
        $orders_by_status = [
            'pending' => 0, 'confirmed' => 0, 'processing' => 0,
            'shipped' => 0, 'delivered' => 0, 'cancelled' => 0,
        ];
        foreach ($periodOrders as $o) {
            $s = $o->order_status;
            if (isset($orders_by_status[$s])) {
                $orders_by_status[$s]++;
            }
        }

        // Top categories by revenue (paid orders only, in period).
        $paidItems = OrderItem::whereHas('order', fn ($q) => $q->where('payment_status', 'paid')->whereBetween('created_at', [$start, $end]))
            ->with('product:id,category_id')
            ->get();

        $catAgg = [];
        foreach ($paidItems as $item) {
            $catId = $item->product?->category_id;
            if ($catId === null) {
                continue;
            }
            if (! isset($catAgg[$catId])) {
                $catAgg[$catId] = ['sales' => 0.0, 'count' => 0];
            }
            $catAgg[$catId]['sales'] += (float) $item->subtotal;
            $catAgg[$catId]['count'] += (int) $item->quantity;
        }
        $catNames = Category::whereIn('id', array_keys($catAgg))->pluck('name', 'id');
        $top_categories = [];
        foreach ($catAgg as $catId => $agg) {
            $top_categories[] = [
                'name' => $catNames[$catId] ?? 'Unknown',
                'sales' => round($agg['sales'], 2),
                'count' => $agg['count'],
            ];
        }
        usort($top_categories, fn ($a, $b) => $b['sales'] <=> $a['sales']);
        $top_categories = array_slice($top_categories, 0, 5);

        // Period totals.
        $revenue_total = (float) $periodOrders->where('payment_status', 'paid')->sum('total');
        $orders_total = (int) $periodOrders->count();
        $avg_order_value = $orders_total > 0 ? round($revenue_total / $orders_total, 2) : 0.0;

        // Previous period revenue (for growth %).
        $prev_revenue = (float) $prevOrders->where('payment_status', 'paid')->sum('total');
        $revenue_growth = $prev_revenue > 0
            ? round((($revenue_total - $prev_revenue) / $prev_revenue) * 100, 2)
            : ($revenue_total > 0 ? 100.0 : 0.0);

        // New customers in period.
        $new_customers_count = User::where('role', 'customer')
            ->whereBetween('created_at', [$start, $end])
            ->count();

        return response()->json([
            'data' => [
                'days' => $days,
                'sales_by_day' => $sales_by_day,
                'orders_by_status' => $orders_by_status,
                'top_categories' => $top_categories,
                'revenue_total' => round($revenue_total, 2),
                'orders_total' => $orders_total,
                'avg_order_value' => $avg_order_value,
                'conversion_rate' => 3.4, // mock until visitor tracking exists
                'new_customers_count' => $new_customers_count,
                'revenue_growth' => $revenue_growth,
            ],
        ]);
    }
}
