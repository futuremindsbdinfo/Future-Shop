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
            ->with('product:id,name,cost_price')
            ->get();

        $totalRevenue = 0.0;
        $totalCost = 0.0;

        // Aggregate per-product for the "top profitable" list.
        $byProduct = [];
        foreach ($paidItems as $item) {
            $lineRevenue = (float) $item->subtotal;
            $lineCost = (float) ($item->product?->cost_price ?? 0) * (int) $item->quantity;

            $totalRevenue += $lineRevenue;
            $totalCost += $lineCost;

            $pid = $item->product_id;
            if (! isset($byProduct[$pid])) {
                $byProduct[$pid] = [
                    'id' => $pid,
                    'name' => $item->product?->name ?? $item->product_name,
                    'revenue' => 0.0,
                    'cost' => 0.0,
                ];
            }
            $byProduct[$pid]['revenue'] += $lineRevenue;
            $byProduct[$pid]['cost'] += $lineCost;
        }

        // Top 5 products by profit (descending).
        $byProduct = array_values($byProduct);
        usort($byProduct, fn ($a, $b) => ($b['revenue'] - $b['cost']) <=> ($a['revenue'] - $a['cost']));
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
        }, $byProduct), 0, 5);

        $totalRevenue = round($totalRevenue, 2);
        $totalCost = round($totalCost, 2);
        $grossProfit = round($totalRevenue - $totalCost, 2);
        $profitMargin = $totalRevenue > 0 ? round(($grossProfit / $totalRevenue) * 100, 2) : 0.0;

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
            ],
        ]);
    }
}
