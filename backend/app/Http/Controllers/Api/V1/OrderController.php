<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Transaction;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function __construct(private readonly CartService $cart)
    {
    }

    /**
     * Place an order from the authenticated user's cart.
     *
     * Security-critical rules:
     *  - The total is RE-VERIFIED from the database; client prices are never trusted.
     *  - Stock is checked (with row locks) before the order is created.
     *  - Stock is deducted only after the order row is committed.
     *  - Product name/price are snapshotted into order_items.
     *  - The delivery address is snapshotted as JSON.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $owner = 'user:'.$user->id;
        $items = $this->cart->raw($owner); // [product_id => qty]

        if ($items === []) {
            throw ValidationException::withMessages(['cart' => ['Your cart is empty.']]);
        }

        $data = $request->validated();

        $order = DB::transaction(function () use ($items, $data, $user) {
            // Lock the product rows to prevent oversell under concurrency.
            $products = Product::whereIn('id', array_keys($items))
                ->lockForUpdate()
                ->with('vendor:id,commission_rate')
                ->get()
                ->keyBy('id');

            $subtotal = 0.0;
            $lineData = [];

            foreach ($items as $productId => $qty) {
                $product = $products->get($productId);

                if (! $product || $product->status !== 'published') {
                    throw ValidationException::withMessages([
                        'cart' => ["A product in your cart is no longer available (#{$productId})."],
                    ]);
                }

                if ($product->stock_quantity < $qty) {
                    throw ValidationException::withMessages([
                        'cart' => ["Insufficient stock for \"{$product->name}\" (have {$product->stock_quantity}, need {$qty})."],
                    ]);
                }

                $unit = (float) ($product->sale_price ?? $product->price);
                $lineSubtotal = round($unit * $qty, 2);
                $commissionRate = (float) ($product->vendor->commission_rate ?? 0);
                $subtotal += $lineSubtotal;

                $lineData[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'unit' => $unit,
                    'line_subtotal' => $lineSubtotal,
                    'commission' => round($lineSubtotal * $commissionRate / 100, 2),
                ];
            }

            $zone = DeliveryZone::where('is_active', true)->findOrFail($data['delivery_zone_id']);
            $deliveryCharge = (float) $zone->delivery_charge;
            $subtotal = round($subtotal, 2);
            $total = round($subtotal + $deliveryCharge, 2);

            $order = Order::create([
                'order_number' => 'TMP', // replaced with id-based number below
                'user_id' => $user->id,
                'delivery_zone_id' => $zone->id,
                'promo_code_id' => null,
                'subtotal' => $subtotal,
                'delivery_charge' => $deliveryCharge,
                'discount' => 0,
                'total' => $total,
                'payment_method' => $data['payment_method'],
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'shipping_name' => $data['shipping_name'],
                'shipping_phone' => $data['shipping_phone'],
                'shipping_address' => $data['shipping_address'],
                'shipping_division' => $data['shipping_division'] ?? null,
                'shipping_district' => $data['shipping_district'] ?? null,
                'delivery_address' => [
                    'name' => $data['shipping_name'],
                    'phone' => $data['shipping_phone'],
                    'address' => $data['shipping_address'],
                    'division' => $data['shipping_division'] ?? null,
                    'district' => $data['shipping_district'] ?? null,
                    'zone' => $zone->name,
                    'snapshot_at' => now()->toIso8601String(),
                ],
                'notes' => $data['notes'] ?? null,
            ]);

            // FS-2026-XXXXX (year + zero-padded id, guaranteed unique).
            $order->forceFill([
                'order_number' => sprintf('FS-%s-%05d', now()->year, $order->id),
            ])->save();

            // COD orders are auto-confirmed at placement; payment stays pending
            // (cash is collected on delivery). Uses 'processing' because the
            // order_status enum has no 'confirmed' value.
            if ($data['payment_method'] === 'cod') {
                $order->update(['order_status' => 'processing']);

                Transaction::create([
                    'order_id'         => $order->id,
                    'vendor_id'        => null,
                    'reference'        => 'COD-'.$order->order_number,
                    'payment_method'   => 'cod',
                    'type'             => 'payment',
                    'amount'           => $order->total,
                    'status'           => 'pending', // collected on delivery
                    'gateway_response' => null,
                ]);
            }

            foreach ($lineData as $line) {
                /** @var Product $product */
                $product = $line['product'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'vendor_id' => $product->vendor_id,
                    'product_name' => $product->name, // snapshot
                    'price' => $line['unit'],          // snapshot
                    'quantity' => $line['quantity'],
                    'subtotal' => $line['line_subtotal'],
                    'commission' => $line['commission'],
                ]);

                // Deduct stock now that the order is confirmed.
                $product->decrement('stock_quantity', $line['quantity']);
            }

            return $order;
        });

        $this->cart->clear($owner);

        return response()->json([
            'data' => $order->load('items'),
        ], 201);
    }

    /**
     * Customer: list only the authenticated user's own orders.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->when(
                $request->filled('status')
                && in_array(
                    $request->string('status')->toString(),
                    ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
                    true
                ),
                fn ($q) => $q->where('order_status', $request->string('status'))
            )
            ->with('items')
            ->latest()
            ->paginate(15);

        return response()->json($orders);
    }

    /**
     * Customer: show a single order, only if it belongs to the user.
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return response()->json(['data' => $order->load('items', 'deliveryZone:id,name')]);
    }

    /**
     * Admin: update an order's status (order_status and/or payment_status).
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'order_status' => ['sometimes', Rule::in(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])],
            'payment_status' => ['sometimes', Rule::in(['pending', 'paid', 'failed', 'refunded'])],
            'delivery_user_id' => ['sometimes', 'nullable', Rule::exists('users', 'id')->where('role', 'delivery')],
        ]);

        $order->update($data);

        return response()->json(['data' => $order->fresh(['user:id,name,email', 'deliveryUser:id,name', 'items'])]);
    }

    /**
     * Admin: list all orders with filters.
     * ?order_status= &payment_status= &user_id= &from= &to= &search=<order_number>
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with(['user:id,name,email', 'deliveryUser:id,name', 'items'])
            ->when($request->filled('order_status'), fn ($q) => $q->where('order_status', $request->string('order_status')))
            ->when($request->filled('payment_status'), fn ($q) => $q->where('payment_status', $request->string('payment_status')))
            ->when($request->filled('user_id'), fn ($q) => $q->where('user_id', $request->integer('user_id')))
            ->when($request->filled('search'), fn ($q) => $q->where('order_number', 'ilike', '%'.$request->string('search').'%'))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('created_at', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('created_at', '<=', $request->date('to')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return response()->json($orders);
    }
}
