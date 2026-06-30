<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\PromotionRule;
use App\Models\Transaction;
use App\Services\CartService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class OrderController extends Controller
{
    public function __construct(
        private readonly CartService $cart,
        private readonly WalletService $walletService,
    ) {
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
        $walletService = $this->walletService;

        try {
            $order = DB::transaction(function () use ($items, $data, $user, $walletService) {
                $cartProductIds = array_keys($items);

                // ── BLOCK C: load active promotion rules whose trigger is in the cart ──
                $promotionRules = PromotionRule::where('is_active', true)
                    ->whereIn('trigger_product_id', $cartProductIds)
                    ->with('freeProduct:id,name,slug,status,stock_quantity,price,sale_price,cost_price,vendor_id')
                    ->get();

                $freeProductIds = $promotionRules->pluck('free_product_id')->unique()->toArray();

                // ── BLOCK D: lock cart + free product rows together ───────────────────
                $allProductIds = array_unique(array_merge($cartProductIds, $freeProductIds));

                $locked = Product::whereIn('id', $allProductIds)
                    ->lockForUpdate()
                    ->with(['vendor:id,commission_rate', 'category:id,name,slug'])
                    ->get()
                    ->keyBy('id');

                // $locked is keyed by integer id and contains cart + free products.
                // The foreach iterates only over cart $items, so free products never
                // pass through the validation loop.
                $subtotal = 0.0;
                $lineData = [];
                $hasGrocery = false;

                foreach ($items as $productId => $qty) {
                    $product = $locked->get($productId);

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

                    if ($this->isProductGrocery($product)) {
                        $hasGrocery = true;
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
                
                if ($hasGrocery) {
                    $zoneName = strtolower($zone->name);
                    if (!str_contains($zoneName, 'sherpur') && $zone->id !== 1) {
                        throw ValidationException::withMessages([
                            'delivery_zone_id' => ['Grocery products can only be delivered to Bogura, Sherpur. Please select the correct delivery zone.'],
                        ]);
                    }
                }

                $deliveryCharge = (float) $zone->delivery_charge;
                $subtotal = round($subtotal, 2);

                // ── BLOCK E: coupon validation + discount math (all bcmath) ──────────
                $subtotalStr = number_format($subtotal, 2, '.', '');
                $deliveryStr = number_format($deliveryCharge, 2, '.', '');

                $couponDiscount = '0.00';
                $appliedCoupon = null;

                if (! empty($data['coupon_code'])) {
                    $coupon = Coupon::where('code', strtoupper(trim($data['coupon_code'])))
                        ->lockForUpdate()
                        ->first();

                    if (! $coupon || ! $coupon->isValid()) {
                        throw new InvalidArgumentException('INVALID_COUPON');
                    }

                    // One-use-per-user (DB unique index also enforces this).
                    $alreadyUsed = CouponUsage::where('coupon_id', $coupon->id)
                        ->where('user_id', $user->id)
                        ->exists();
                    if ($alreadyUsed) {
                        throw new InvalidArgumentException('COUPON_ALREADY_USED');
                    }

                    if ($coupon->is_first_purchase_only) {
                        $priorOrders = Order::where('user_id', $user->id)
                            ->whereNotIn('order_status', ['cancelled'])
                            ->exists();
                        if ($priorOrders) {
                            throw new InvalidArgumentException('COUPON_FIRST_PURCHASE_ONLY');
                        }
                    }

                    // Percentage of subtotal (delivery never discounted).
                    $couponDiscount = bcmul(
                        bcdiv((string) $coupon->discount_percentage, '100', 6),
                        $subtotalStr,
                        2
                    );
                    $appliedCoupon = $coupon;
                }

                // ── Wallet deduction ─────────────────────────────────────────────
                $walletUsed = '0.00';

                if (! empty($data['use_wallet'])) {
                    $walletBalance = $walletService->getBalance($user->id);
                    if (bccomp($walletBalance, '0.00', 2) > 0) {
                        $amountDue = bcsub(
                            bcadd($subtotalStr, $deliveryStr, 2),
                            $couponDiscount,
                            2
                        );
                        $walletUsed = bccomp($walletBalance, $amountDue, 2) >= 0
                            ? $amountDue
                            : $walletBalance;
                        if (bccomp($walletUsed, '0.00', 2) < 0) {
                            $walletUsed = '0.00';
                        }
                    }
                }

                // ── Recalculate total ────────────────────────────────────────────
                $total = bcsub(
                    bcsub(
                        bcadd($subtotalStr, $deliveryStr, 2),
                        $couponDiscount,
                        2
                    ),
                    $walletUsed,
                    2
                );
                if (bccomp($total, '0.00', 2) < 0) {
                    $total = '0.00';
                    $walletUsed = bcsub(
                        bcadd($subtotalStr, $deliveryStr, 2),
                        $couponDiscount,
                        2
                    );
                }

                // ── BLOCK F: create the order with discount / wallet_used / coupon_id ─
                $order = Order::create([
                    'order_number' => 'TMP',
                    'user_id' => $user->id,
                    'delivery_zone_id' => $zone->id,
                    'promo_code_id' => null,
                    'coupon_id' => $appliedCoupon?->id,
                    'subtotal' => $subtotalStr,
                    'delivery_charge' => $deliveryStr,
                    'discount' => $couponDiscount,
                    'wallet_used' => $walletUsed,
                    'total' => $total,
                    'payment_method' => $data['payment_method'],
                    'payment_status' => 'pending',
                    'online_transaction_id' => $data['online_transaction_id'] ?? null,
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

                // 6-digit COD verification code, server-generated only. Used by
                // the delivery agent to confirm cash collection on the doorstep.
                if ($order->payment_method === 'cod') {
                    do {
                        $code = sprintf('%06d', random_int(100000, 999999));
                    } while (Order::where('payment_code', $code)->exists());
                    $order->updateQuietly(['payment_code' => $code]);
                }

                // COD orders are auto-confirmed at placement; payment stays pending.
                if ($data['payment_method'] === 'cod') {
                    $order->update(['order_status' => 'processing']);

                    Transaction::create([
                        'order_id'         => $order->id,
                        'vendor_id'        => null,
                        'reference'        => 'COD-'.$order->order_number,
                        'payment_method'   => 'cod',
                        'type'             => 'payment',
                        'amount'           => $order->total,
                        'status'           => 'pending',
                        'gateway_response' => null,
                    ]);
                }

                // ── BLOCK G: persist coupon usage + debit wallet ─────────────────
                if ($appliedCoupon !== null) {
                    CouponUsage::create([
                        'coupon_id'       => $appliedCoupon->id,
                        'user_id'         => $user->id,
                        'order_id'        => $order->id,
                        'discount_amount' => $couponDiscount,
                        'wallet_credited' => false,
                    ]);
                    // used_count is incremented again by OrderObserver on delivery
                    // (when wallet_credit_enabled) — that's intentional double-bookkeeping
                    // for analytics: usages = attempted, used_count = applied + credited.
                    $appliedCoupon->increment('used_count');
                }

                if (bccomp($walletUsed, '0.00', 2) > 0) {
                    $walletService->debit(
                        $user->id,
                        $walletUsed,
                        'Wallet used on order #'.$order->order_number,
                        'WALLETPAY-'.$order->order_number
                    );
                }

                // ── OrderItems + stock decrement (cart products) ─────────────────
                foreach ($lineData as $line) {
                    /** @var Product $product */
                    $product = $line['product'];

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'vendor_id' => $product->vendor_id,
                        'product_name' => $product->name,
                        'price' => $line['unit'],
                        'quantity' => $line['quantity'],
                        'subtotal' => $line['line_subtotal'],
                        'commission' => $line['commission'],
                    ]);

                    $product->decrement('stock_quantity', $line['quantity']);
                }

                // ── BLOCK H: apply Buy X Get Y promotion rules ───────────────────
                foreach ($promotionRules as $rule) {
                    $cartQty = $items[$rule->trigger_product_id] ?? 0;
                    if ($cartQty < $rule->trigger_quantity) {
                        continue;
                    }

                    $freeProduct = $locked->get($rule->free_product_id);
                    if (! $freeProduct || $freeProduct->status !== 'published') {
                        continue;
                    }

                    // Refresh stock from the row we already locked.
                    $latestStock = Product::where('id', $freeProduct->id)
                        ->value('stock_quantity');
                    if ($latestStock < $rule->free_quantity) {
                        continue;
                    }

                    $order->items()->create([
                        'product_id'   => $freeProduct->id,
                        'vendor_id'    => $freeProduct->vendor_id,
                        'product_name' => $freeProduct->name.' (Free)',
                        'price'        => '0.00',
                        'quantity'     => $rule->free_quantity,
                        'subtotal'     => '0.00',
                        'commission'   => '0.00',
                    ]);

                    Product::where('id', $freeProduct->id)
                        ->decrement('stock_quantity', $rule->free_quantity);
                }

                return $order;
            });
        } catch (InvalidArgumentException $e) {
            $messages = [
                'INVALID_COUPON'             => 'Coupon code is invalid or has expired.',
                'COUPON_ALREADY_USED'        => 'You have already used this coupon.',
                'COUPON_FIRST_PURCHASE_ONLY' => 'This coupon is for first-time buyers only.',
            ];

            return response()->json([
                'message' => $messages[$e->getMessage()] ?? 'Invalid request.',
            ], 422);
        }

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

        return response()->json(['data' => $order->load('items.product:id,name,images', 'deliveryZone:id,name')]);
    }

    /**
     * Admin: update an order's status (order_status and delivery_user_id).
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'order_status' => ['sometimes', Rule::in(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])],
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

    /**
     * Helper to detect if a product belongs to the Grocery category.
     */
    private function isProductGrocery(Product $product): bool
    {
        $catName = strtolower($product->category->name ?? '');
        $prodName = strtolower($product->name);
        
        return str_contains($catName, 'grocery') ||
               str_contains($catName, 'food') ||
               str_contains($catName, 'cooking') ||
               str_contains($catName, 'তেল') ||
               str_contains($catName, 'চাল') ||
               str_contains($catName, 'ডাল') ||
               str_contains($catName, 'মসলা') ||
               str_contains($catName, 'কাঁচাবাজার') ||
               str_contains($catName, 'মুদি') ||
               str_contains($prodName, 'oil') ||
               str_contains($prodName, 'তেল') ||
               str_contains($prodName, 'mustard') ||
               str_contains($prodName, 'rice') ||
               str_contains($prodName, 'সরিষা') ||
               str_contains($prodName, 'চাল') ||
               str_contains($prodName, 'ডাল') ||
               str_contains($prodName, 'মসলা') ||
               str_contains($prodName, 'মুদি');
    }
}
