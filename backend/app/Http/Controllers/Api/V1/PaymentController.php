<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Transaction;
use App\Services\SslCommerzService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    public function __construct(private readonly SslCommerzService $sslcommerz)
    {
    }

    /**
     * Authenticated customer: start an online payment session for their order.
     */
    public function initiate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id' => ['required', 'integer'],
        ]);

        $order = Order::where('id', $data['order_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($order->payment_status === 'paid') {
            throw ValidationException::withMessages(['order' => ['This order is already paid.']]);
        }

        if ($order->payment_method === 'cod') {
            throw ValidationException::withMessages(['order' => ['Use the COD endpoint for cash-on-delivery orders.']]);
        }

        $result = $this->sslcommerz->initiateSession($order);

        if (! $result['success']) {
            return response()->json(['message' => $result['message']], 502);
        }

        return response()->json(['gateway_url' => $result['gateway_url']]);
    }

    /**
     * SSLCommerz success IPN (server-to-server; no auth token).
     * Order of checks: signature → amount → idempotency → update.
     */
    public function webhookSuccess(Request $request): JsonResponse
    {
        $payload = $request->all();

        // 1) Verify the HMAC/hash signature FIRST. Reject anything unsigned/tampered.
        if (! $this->sslcommerz->verifyIpnSignature($payload)) {
            Log::warning('SSLCommerz IPN: invalid signature', ['tran_id' => $payload['tran_id'] ?? null]);

            return response()->json(['message' => 'Invalid signature.'], 400);
        }

        if (($payload['status'] ?? null) !== 'VALID') {
            return response()->json(['message' => 'Payment not in VALID state.'], 400);
        }

        $order = Order::where('order_number', $payload['tran_id'] ?? '')->first();
        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        // 2) Re-verify the amount against the DB order total. Never trust the IPN amount alone.
        $paidAmount = round((float) ($payload['amount'] ?? 0), 2);
        if ($paidAmount !== round((float) $order->total, 2)) {
            Log::warning('SSLCommerz IPN: amount mismatch', [
                'order' => $order->order_number, 'expected' => $order->total, 'got' => $paidAmount,
            ]);

            return response()->json(['message' => 'Amount mismatch.'], 400);
        }

        // 3) Idempotency: a stable gateway reference; reuse short-circuits processing.
        $reference = (string) ($payload['val_id'] ?? $payload['bank_tran_id'] ?? $payload['tran_id']);

        if ($order->payment_status === 'paid' || Transaction::where('reference', $reference)->exists()) {
            return response()->json(['message' => 'Already processed.'], 200);
        }

        // 4) Persist atomically.
        DB::transaction(function () use ($order, $reference, $paidAmount, $payload) {
            Transaction::create([
                'order_id' => $order->id,
                'vendor_id' => null,
                'reference' => $reference,
                'payment_method' => $order->payment_method,
                'type' => 'payment',
                'amount' => $paidAmount,
                'status' => 'completed',
                'gateway_response' => $payload,
            ]);

            $order->update([
                'payment_status' => 'paid',
                'order_status' => 'processing',
            ]);
        });

        return response()->json(['message' => 'Payment confirmed.'], 200);
    }

    /**
     * SSLCommerz fail/cancel IPN — mark the order failed (unless already paid).
     */
    public function webhookFail(Request $request): JsonResponse
    {
        $order = Order::where('order_number', $request->input('tran_id', ''))->first();

        if ($order && $order->payment_status !== 'paid') {
            $order->update(['payment_status' => 'failed']);
        }

        return response()->json(['message' => 'Recorded.'], 200);
    }

    /**
     * Cash on delivery: confirm the order directly (no gateway).
     */
    public function cod(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if ($order->payment_method !== 'cod') {
            throw ValidationException::withMessages(['order' => ['This is not a cash-on-delivery order.']]);
        }

        if ($order->order_status !== 'pending') {
            return response()->json(['message' => 'Order already confirmed.'], 200);
        }

        DB::transaction(function () use ($order) {
            Transaction::create([
                'order_id' => $order->id,
                'vendor_id' => null,
                'reference' => 'COD-'.$order->order_number,
                'payment_method' => 'cod',
                'type' => 'payment',
                'amount' => $order->total,
                'status' => 'pending', // collected on delivery
                'gateway_response' => null,
            ]);

            // Payment stays "pending" (cash on delivery); the order is confirmed.
            $order->update(['order_status' => 'processing']);
        });

        return response()->json([
            'message' => 'COD order confirmed.',
            'data' => $order->fresh(),
        ]);
    }
}
