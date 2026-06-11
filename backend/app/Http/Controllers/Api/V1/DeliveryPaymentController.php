<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryPaymentController extends Controller
{
    /**
     * GET /delivery/payment-confirm?code=XXXXXX
     *
     * Preview the order before confirming. Three-layer IDOR/abuse guard:
     *  - 6-digit numeric format (validate)
     *  - order assigned to THIS agent (delivery_user_id)
     *  - payment still pending (no replay after confirm)
     */
    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'digits:6'],
        ]);

        $order = Order::where('payment_code', $request->input('code'))
            ->where('delivery_user_id', $request->user()->id)
            ->where('payment_status', 'pending')
            ->with([
                'user:id,name,phone',
                'items:id,order_id,product_name,quantity,price',
            ])
            ->first();

        if (! $order) {
            return response()->json([
                'message' => 'Invalid code, or payment already confirmed, or order not assigned to you.',
            ], 404);
        }

        return response()->json([
            'order_number'   => $order->order_number,
            'customer_name'  => $order->shipping_name,
            'customer_phone' => $order->shipping_phone,
            'address'        => $order->shipping_address,
            'total'          => $order->total,
            'items'          => $order->items,
        ]);
    }

    /**
     * POST /delivery/payment-confirm  body: { code }
     *
     * Flip the order to "delivered". The OrderObserver — single source of truth —
     * then handles: mark payment paid, create CODCOLLECT transaction, award
     * referral wallet credit, award coupon cashback. We deliberately do NOT
     * touch payment_status here so the observer's guard fires correctly.
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'digits:6'],
        ]);

        $order = Order::where('payment_code', $request->input('code'))
            ->where('delivery_user_id', $request->user()->id)
            ->where('payment_status', 'pending')
            ->lockForUpdate()
            ->first();

        if (! $order) {
            return response()->json([
                'message' => 'Invalid code, already confirmed, or not your order.',
            ], 404);
        }

        DB::transaction(function () use ($order) {
            $order->update(['order_status' => 'delivered']);
        });

        return response()->json([
            'message' => 'Payment confirmed. Order marked as delivered.',
            'data'    => $order->fresh(),
        ]);
    }
}
