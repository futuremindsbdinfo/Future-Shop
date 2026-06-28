<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DeliveryController extends Controller
{
    /**
     * Orders assigned to the authenticated delivery agent (active first).
     */
    public function myOrders(Request $request): JsonResponse
    {
        $orders = Order::where('delivery_user_id', $request->user()->id)
            ->when(! $request->boolean('all'), fn ($q) => $q->whereNotIn('order_status', ['delivered', 'cancelled']))
            ->with(['user:id,name', 'items'])
            ->latest()
            ->get();

        return response()->json(['data' => $orders]);
    }

    /**
     * Show a single assigned order.
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->delivery_user_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return response()->json(['data' => $order->load(['user:id,name', 'items', 'deliveryZone:id,name'])]);
    }

    /**
     * Update an assigned order's status.
     *
     * On 'delivered': OrderObserver is the single source of truth — it marks
     * payment paid, creates the CODCOLLECT transaction, and awards
     * referral + coupon wallet credits. We deliberately only touch
     * order_status here so the observer's guards fire correctly.
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        if ($order->delivery_user_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        $data = $request->validate([
            'order_status' => ['required', Rule::in(['processing', 'shipped', 'delivered'])],
        ]);

        // Money guard: a COD order must be settled through the 6-digit
        // code-confirmation flow (DeliveryPaymentController), which is what marks
        // it delivered AND lets the OrderObserver mark payment paid. Block the
        // codeless path here so an agent cannot mark a COD order delivered (and
        // therefore paid) without collecting the customer's confirmation code.
        if (
            $data['order_status'] === 'delivered'
            && $order->payment_method === 'cod'
            && $order->payment_status !== 'paid'
        ) {
            return response()->json([
                'message' => 'COD অর্ডার কোড দিয়ে কনফার্ম করুন।',
            ], 422);
        }

        $order->update(['order_status' => $data['order_status']]);

        return response()->json(['data' => $order->fresh(['user:id,name', 'items'])]);
    }

    /**
     * Report for the logged-in delivery agent.
     */
    public function report(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $period = $request->string('period', 'today');

        $startDate = now('Asia/Dhaka');
        $endDate = now('Asia/Dhaka');

        if ($period === 'today') {
            $startDate = $startDate->startOfDay();
            $endDate = $endDate->endOfDay();
        } elseif ($period === 'week') {
            $startDate = $startDate->startOfWeek();
            $endDate = $endDate->endOfWeek();
        } elseif ($period === 'month') {
            $startDate = $startDate->startOfMonth();
            $endDate = $endDate->endOfMonth();
        } else {
            $startDate = $startDate->startOfDay();
            $endDate = $endDate->endOfDay();
        }

        // delivered_at is stored in UTC, so convert the Dhaka-local boundaries to
        // UTC before querying — otherwise the day/week/month window is skewed by
        // ~6 hours and collected cash lands in the wrong day at the boundaries.
        $startDate = $startDate->utc();
        $endDate = $endDate->utc();

        // Delivered count within period
        $deliveredCount = Order::where('delivery_user_id', $userId)
            ->where('order_status', 'delivered')
            ->whereBetween('delivered_at', [$startDate, $endDate])
            ->count();

        // Collected cash (COD only)
        $collectedCash = Order::where('delivery_user_id', $userId)
            ->where('order_status', 'delivered')
            ->where('payment_status', 'paid')
            ->where('payment_method', 'cod')
            ->whereBetween('delivered_at', [$startDate, $endDate])
            ->sum('total');

        // Order list
        $orders = Order::where('delivery_user_id', $userId)
            ->where('order_status', 'delivered')
            ->whereBetween('delivered_at', [$startDate, $endDate])
            ->with('user:id,name')
            ->orderBy('delivered_at', 'desc')
            ->get(['id', 'order_number', 'user_id', 'total', 'payment_method', 'payment_status', 'delivered_at']);

        return response()->json([
            'delivered_count' => $deliveredCount,
            'collected_cash' => (float) $collectedCash,
            'orders' => $orders
        ]);
    }
}
