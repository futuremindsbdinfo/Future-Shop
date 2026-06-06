<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InvoiceController extends Controller
{
    /**
     * Admin: list invoices (paginated orders formatted as invoices).
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:120'],
            'status' => ['sometimes', 'nullable', Rule::in(['pending', 'paid', 'failed', 'refunded'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $perPage = max(min((int) $request->get('per_page', 15), 50), 1);

        $orders = Order::query()
            ->with(['user:id,name,phone', 'items:id,order_id'])
            ->when($request->filled('status'), fn ($q) => $q->where('payment_status', $request->string('status')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where(function ($w) use ($term) {
                    $w->where('order_number', 'ilike', $term)
                        ->orWhere('shipping_name', 'ilike', $term)
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'ilike', $term));
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $orders->getCollection()->transform(function (Order $o) {
            return [
                'id' => $o->id,
                'invoice_number' => $o->order_number,
                'customer_name' => $o->user?->name ?? $o->shipping_name,
                'customer_phone' => $o->shipping_phone,
                'date' => $o->created_at?->toIso8601String(),
                'items_count' => $o->items?->count() ?? 0,
                'subtotal' => $o->subtotal,
                'delivery_charge' => $o->delivery_charge,
                'discount' => $o->discount,
                'total' => $o->total,
                'payment_status' => $o->payment_status,
                'payment_method' => $o->payment_method,
            ];
        });

        return response()->json($orders);
    }

    /**
     * Admin: full invoice detail for a single order.
     */
    public function show(Order $order): JsonResponse
    {
        $order->load(['user:id,name,phone,email', 'items', 'deliveryZone:id,name']);

        // Company info from Settings (with sensible fallbacks).
        $company = Setting::pluck('value', 'key')->toArray();
        $company['site_name'] = $company['site_name'] ?? 'Future Shop';

        return response()->json([
            'data' => [
                'invoice_number' => $order->order_number,
                'date' => $order->created_at?->toIso8601String(),
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'order_status' => $order->order_status,
                'customer' => [
                    'name' => $order->user?->name ?? $order->shipping_name,
                    'phone' => $order->user?->phone ?? $order->shipping_phone,
                    'email' => $order->user?->email,
                ],
                'delivery_address' => [
                    'name' => $order->shipping_name,
                    'phone' => $order->shipping_phone,
                    'address' => $order->shipping_address,
                    'division' => $order->shipping_division,
                    'district' => $order->shipping_district,
                    'zone' => $order->deliveryZone?->name,
                ],
                'items' => $order->items->map(fn ($i) => [
                    'product_name' => $i->product_name,
                    'quantity' => $i->quantity,
                    'price' => $i->price,
                    'subtotal' => $i->subtotal,
                ])->all(),
                'totals' => [
                    'subtotal' => $order->subtotal,
                    'delivery_charge' => $order->delivery_charge,
                    'discount' => $order->discount,
                    'total' => $order->total,
                ],
                'company' => [
                    'name' => $company['site_name'] ?? 'Future Shop',
                    'phone' => $company['contact_phone'] ?? null,
                    'email' => $company['contact_email'] ?? null,
                    'address' => $company['contact_address'] ?? null,
                ],
            ],
        ]);
    }
}
