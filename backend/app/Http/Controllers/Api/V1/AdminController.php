<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Admin dashboard summary stats + recent orders.
     */
    public function dashboard(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total_orders' => Order::count(),
                'total_revenue' => round((float) Order::where('payment_status', 'paid')->sum('total'), 2),
                'active_vendors' => Vendor::where('is_active', true)->where('status', 'approved')->count(),
                'pending_orders' => Order::where('order_status', 'pending')->count(),
                'recent_orders' => Order::with('user:id,name')
                    ->latest()
                    ->limit(10)
                    ->get(['id', 'order_number', 'user_id', 'total', 'payment_status', 'order_status', 'created_at']),
            ],
        ]);
    }
}
