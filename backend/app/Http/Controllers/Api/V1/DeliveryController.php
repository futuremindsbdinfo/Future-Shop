<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
     * Update an assigned order's status. Marking COD orders "delivered" also
     * records the cash collection (payment → paid + transaction).
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        if ($order->delivery_user_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        $data = $request->validate([
            'order_status' => ['required', Rule::in(['processing', 'shipped', 'delivered'])],
        ]);

        DB::transaction(function () use ($order, $data) {
            $order->update(['order_status' => $data['order_status']]);

            if (
                $data['order_status'] === 'delivered'
                && $order->payment_method === 'cod'
                && $order->payment_status !== 'paid'
            ) {
                $order->update(['payment_status' => 'paid']);

                Transaction::create([
                    'order_id' => $order->id,
                    'vendor_id' => null,
                    'reference' => 'CODCOLLECT-'.$order->order_number,
                    'payment_method' => 'cod',
                    'type' => 'payment',
                    'amount' => $order->total,
                    'status' => 'completed',
                    'gateway_response' => null,
                ]);
            }
        });

        return response()->json(['data' => $order->fresh(['user:id,name', 'items'])]);
    }
}
