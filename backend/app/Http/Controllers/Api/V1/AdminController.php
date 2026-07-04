<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Admin: list all active delivery agents (for order assignment).
     */
    public function deliveryUsers(): JsonResponse
    {
        return response()->json([
            'data' => User::where('role', 'delivery')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'phone']),
        ]);
    }

    /**
     * Admin dashboard summary stats, profit metrics, recent orders.
     */
    public function dashboard(): JsonResponse
    {
        // Paid order_items + their products (used for revenue/cost/profit).
        $paidItems = OrderItem::whereHas('order', fn ($q) => $q->where('payment_status', 'paid'))
            ->with('product:id,name,cost_price,images')
            ->get();

        $totalRevenue = 0.0;
        $totalCost = 0.0;

        // Aggregate per-product for the "top profitable" list and "sold" list.
        $byProduct = [];
        foreach ($paidItems as $item) {
            $lineRevenue = (float) $item->subtotal;
            $lineCost = (float) ($item->product?->cost_price ?? 0) * (int) $item->quantity;

            $totalRevenue += $lineRevenue;
            $totalCost += $lineCost;

            $pid = $item->product_id;
            if (! isset($byProduct[$pid])) {
                $images = $item->product?->images ?? [];
                $primaryImage = null;
                foreach ($images as $img) {
                    if (!empty($img['is_primary'])) {
                        $primaryImage = $img['url'] ?? null;
                        break;
                    }
                }
                if (!$primaryImage && count($images) > 0) {
                    $primaryImage = $images[0]['url'] ?? null;
                }

                $byProduct[$pid] = [
                    'id' => $pid,
                    'name' => $item->product?->name ?? $item->product_name,
                    'revenue' => 0.0,
                    'cost' => 0.0,
                    'sold' => 0,
                    'image' => $primaryImage,
                ];
            }
            $byProduct[$pid]['revenue'] += $lineRevenue;
            $byProduct[$pid]['cost'] += $lineCost;
            $byProduct[$pid]['sold'] += (int) $item->quantity;
        }

        // Top 5 products by profit (descending).
        $byProductArr = array_values($byProduct);
        usort($byProductArr, fn ($a, $b) => ($b['revenue'] - $b['cost']) <=> ($a['revenue'] - $a['cost']));
        $productProfits = array_slice(array_map(function ($p) {
            $profit = round($p['revenue'] - $p['cost'], 2);
            $margin = $p['revenue'] > 0 ? round(($profit / $p['revenue']) * 100, 2) : 0.0;
            return [
                'id' => $p['id'],
                'name' => $p['name'],
                'revenue' => round($p['revenue'], 2),
                'cost' => round($p['cost'], 2),
                'profit' => $profit,
                'margin' => $margin,
            ];
        }, $byProductArr), 0, 5);

        // Top 5 Products by Sold Quantity
        $byProductSold = $byProductArr;
        usort($byProductSold, fn ($a, $b) => $b['sold'] <=> $a['sold']);
        $topProductsSold = array_slice(array_map(function ($p) {
            return [
                'id' => $p['id'],
                'name' => $p['name'],
                'sold' => $p['sold'],
                'image' => $p['image'],
            ];
        }, $byProductSold), 0, 5);

        $totalRevenue = round($totalRevenue, 2);
        $totalCost = round($totalCost, 2);
        $grossProfit = round($totalRevenue - $totalCost, 2);
        $profitMargin = $totalRevenue > 0 ? round(($grossProfit / $totalRevenue) * 100, 2) : 0.0;

        // Sales Overview (This week vs Last week)
        $thisWeek = array_fill(1, 7, 0);
        $lastWeek = array_fill(1, 7, 0);
        $weekDays = [1 => 'Mon', 2 => 'Tue', 3 => 'Wed', 4 => 'Thu', 5 => 'Fri', 6 => 'Sat', 7 => 'Sun'];
        
        $today = now();
        $startOfThisWeek = $today->copy()->startOfWeek();
        $startOfLastWeek = $startOfThisWeek->copy()->subWeek();

        $ordersLast14Days = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $startOfLastWeek)
            ->get(['total', 'created_at']);

        foreach ($ordersLast14Days as $order) {
            $date = $order->created_at;
            $dayOfWeek = clone clone $date;
            $isoDay = $dayOfWeek->dayOfWeekIso; // 1 (Monday) - 7 (Sunday)
            if ($date >= $startOfThisWeek) {
                $thisWeek[$isoDay] += $order->total;
            } else {
                $lastWeek[$isoDay] += $order->total;
            }
        }

        $salesOverview = [];
        for ($i = 1; $i <= 7; $i++) {
            $salesOverview[] = [
                'day' => $weekDays[$i],
                'thisWeek' => round($thisWeek[$i], 2),
                'lastWeek' => round($lastWeek[$i], 2),
            ];
        }

        // Customer Growth
        $newCustomers = User::where('role', 'customer')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
        $returningCustomers = Order::select('user_id')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('user_id')
            ->havingRaw('COUNT(id) > 1')
            ->get()->count();
        $inactiveCustomers = User::where('role', 'customer')
            ->where('is_active', false)
            ->count();
            
        $customerGrowth = [
            ['name' => 'New Customers', 'value' => $newCustomers, 'color' => '#3b82f6'],
            ['name' => 'Returning Customers', 'value' => $returningCustomers, 'color' => '#22c55e'],
            ['name' => 'Inactive', 'value' => $inactiveCustomers, 'color' => '#f47920'],
        ];

        // Traffic Sources (Mock data passed from backend since no tracking exists)
        $trafficSources = [
            ['name' => 'Google', 'icon' => 'G', 'iconBg' => 'bg-blue-500', 'pct' => 45.2],
            ['name' => 'Direct', 'icon' => 'faLink', 'iconBg' => 'bg-purple-500', 'pct' => 24.6],
            ['name' => 'Referral', 'icon' => 'faShareNodes', 'iconBg' => 'bg-orange-500', 'pct' => 15.8],
            ['name' => 'Social Media', 'icon' => 'faHeart', 'iconBg' => 'bg-pink-500', 'pct' => 9.7],
            ['name' => 'Email', 'icon' => 'faEnvelope', 'iconBg' => 'bg-cyan-500', 'pct' => 4.7],
        ];

        // Low stock products (≤ 5).
        $lowStock = Product::where('stock_quantity', '<=', 5)
            ->with('category:id,name,slug')
            ->orderBy('stock_quantity')
            ->limit(20)
            ->get(['id', 'name', 'slug', 'stock_quantity', 'category_id']);

        // Today's orders.
        $todayOrders = Order::whereDate('created_at', now()->toDateString())
            ->with('user:id,name')
            ->orderByDesc('id')
            ->get(['id', 'order_number', 'user_id', 'total', 'payment_status', 'order_status', 'created_at']);

        return response()->json([
            'data' => [
                'total_orders' => Order::count(),
                // Backward-compatible: legacy field = revenue.
                'total_revenue' => $totalRevenue,
                'total_cost' => $totalCost,
                'gross_profit' => $grossProfit,
                'profit_margin' => $profitMargin,
                'total_customers' => User::where('role', 'customer')->count(),
                'total_products' => Product::where('status', 'published')->count(),
                'active_vendors' => Vendor::where('is_active', true)->where('status', 'approved')->count(),
                'pending_orders' => Order::where('order_status', 'pending')->count(),
                'recent_orders' => Order::with('user:id,name')
                    ->latest()
                    ->limit(10)
                    ->get(['id', 'order_number', 'user_id', 'total', 'payment_status', 'order_status', 'created_at']),
                'product_profits' => $productProfits,
                'low_stock_products' => $lowStock,
                'today_orders' => [
                    'count' => $todayOrders->count(),
                    'total' => round((float) $todayOrders->sum('total'), 2),
                    'list' => $todayOrders->take(5)->values(),
                ],
                'sales_overview' => $salesOverview,
                'top_products_sold' => $topProductsSold,
                'customer_growth' => $customerGrowth,
                'traffic_sources' => $trafficSources,
            ],
        ]);
    }
}
