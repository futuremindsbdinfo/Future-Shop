<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPaymentController extends Controller
{
    /**
     * PATCH /admin/orders/{order}/verify-payment
     *
     * Admin manually verifies an ONLINE payment after eyeballing the
     * transaction ID (bKash / Nagad / Rocket / card). Refuses to touch:
     *  - already-paid orders (idempotency)
     *  - COD orders (those settle through the delivery agent flow)
     */
    public function verify(Request $request, Order $order): JsonResponse
    {
        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Payment already verified.'], 422);
        }

        if ($order->payment_method === 'cod') {
            return response()->json([
                'message' => 'COD orders are confirmed by the delivery agent, not manually.',
            ], 422);
        }

        $request->validate([
            'transaction_id' => ['required', 'string', 'max:100'],
        ], [
            'transaction_id.required' => 'Transaction ID আবশ্যক।',
        ]);

        $order->update([
            'payment_status'        => 'paid',
            'online_transaction_id' => $request->input('transaction_id', $order->online_transaction_id),
        ]);

        return response()->json($order->fresh());
    }
}
