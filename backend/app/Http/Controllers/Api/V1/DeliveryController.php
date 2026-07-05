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
        // Self-scoped ONLY: the id comes from the authenticated token — a
        // client-supplied user_id is never read (IDOR prevention).
        $userId = $request->user()->id;
        // Cast to a plain string: Request::string() returns Stringable, and a
        // strict === against a string literal is always false — without the
        // cast, 'week'/'month' silently fell through to the today window.
        $period = (string) $request->string('period', 'today');

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

        // Cohort counts scope by created_at: orders carry no assigned_at
        // timestamp and undelivered orders never get a delivered_at, so
        // created_at is the one date every assigned order has. All queries
        // stay scoped to $userId (the token's own id).
        $assignedCount = Order::where('delivery_user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $pendingCount = Order::where('delivery_user_id', $userId)
            ->whereIn('order_status', ['pending', 'processing', 'shipped'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $cancelledCount = Order::where('delivery_user_id', $userId)
            ->where('order_status', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // delivered ÷ assigned, division-by-zero guarded.
        $successRate = $assignedCount > 0
            ? round($deliveredCount / $assignedCount * 100, 1)
            : 0.0;

        // Order list
        $orders = Order::where('delivery_user_id', $userId)
            ->where('order_status', 'delivered')
            ->whereBetween('delivered_at', [$startDate, $endDate])
            ->with('user:id,name')
            ->orderBy('delivered_at', 'desc')
            ->get(['id', 'order_number', 'user_id', 'total', 'payment_method', 'payment_status', 'delivered_at']);

        // Per-day breakdown in Dhaka-local dates. Groups the already-fetched
        // list in PHP — no raw SQL date functions, so the UTC→Dhaka conversion
        // stays exact and no extra query runs. copy() before setTimezone so the
        // Carbon instances inside $orders (also returned below) stay in UTC.
        $daily = [];
        foreach ($orders as $order) {
            $day = $order->delivered_at?->copy()->setTimezone('Asia/Dhaka')->toDateString();
            if ($day === null) {
                continue;
            }
            if (! isset($daily[$day])) {
                $daily[$day] = ['date' => $day, 'delivered_count' => 0, 'collected_cash' => 0.0];
            }
            $daily[$day]['delivered_count']++;
            if ($order->payment_method === 'cod' && $order->payment_status === 'paid') {
                $daily[$day]['collected_cash'] += (float) $order->total;
            }
        }
        krsort($daily); // newest day first, matching the order list sort
        $daily = array_values(array_map(function (array $row) {
            $row['collected_cash'] = round($row['collected_cash'], 2);
            return $row;
        }, $daily));

        return response()->json([
            'assigned_count' => $assignedCount,
            'delivered_count' => $deliveredCount,
            'pending_count' => $pendingCount,
            'cancelled_count' => $cancelledCount,
            'success_rate' => $successRate,
            'collected_cash' => (float) $collectedCash,
            'daily' => $daily,
            'orders' => $orders
        ]);
    }
}
