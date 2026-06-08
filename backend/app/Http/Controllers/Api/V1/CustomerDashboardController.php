<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Wallet;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerDashboardController extends Controller
{
    /** GET /account/dashboard — summary stats for the customer dashboard. */
    public function summary(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $ordersCount = Order::where('user_id', $userId)->count();

        $activeOrdersCount = Order::where('user_id', $userId)
            ->whereIn('order_status', ['pending', 'processing', 'shipped'])
            ->count();

        // total_spent excludes cancelled orders (they produced no revenue).
        $totalSpent = Order::where('user_id', $userId)
            ->where('order_status', '!=', 'cancelled')
            ->sum('total');

        $wishlistCount = Wishlist::where('user_id', $userId)->count();

        $wallet = Wallet::where('user_id', $userId)->first();

        return response()->json([
            'orders_count'        => $ordersCount,
            'active_orders_count' => $activeOrdersCount,
            'total_spent'         => number_format((float) $totalSpent, 2, '.', ''),
            'wishlist_count'      => $wishlistCount,
            'wallet_balance'      => $wallet
                ? number_format((float) $wallet->balance, 2, '.', '')
                : '0.00',
        ]);
    }
}
