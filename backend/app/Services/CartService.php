<?php

namespace App\Services;

use App\Models\DeliveryZone;
use App\Models\Product;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class CartService
{
    private Repository $cache;

    private int $ttl;

    public function __construct()
    {
        $this->cache = Cache::store(config('cart.store'));
        $this->ttl = (int) config('cart.ttl');
    }

    /**
     * Raw stored cart: [ product_id => quantity ]. Prices are NEVER stored —
     * they are always recomputed from the database at read time.
     *
     * @return array<int, int>
     */
    public function raw(string $owner): array
    {
        return $this->cache->get($this->key($owner), []);
    }

    /**
     * Add (or increment) an item after a server-side stock check.
     */
    public function add(string $owner, int $productId, int $quantity): array
    {
        $product = $this->findPurchasable($productId);

        $items = $this->raw($owner);
        $newQty = ($items[$productId] ?? 0) + $quantity;

        $this->assertStock($product, $newQty);

        $items[$productId] = $newQty;
        $this->persist($owner, $items);

        return $this->summary($owner);
    }

    /**
     * Set an absolute quantity. Quantity <= 0 removes the item.
     */
    public function updateQuantity(string $owner, int $productId, int $quantity): array
    {
        $items = $this->raw($owner);

        if ($quantity <= 0) {
            unset($items[$productId]);
            $this->persist($owner, $items);

            return $this->summary($owner);
        }

        $product = $this->findPurchasable($productId);
        $this->assertStock($product, $quantity);

        $items[$productId] = $quantity;
        $this->persist($owner, $items);

        return $this->summary($owner);
    }

    public function remove(string $owner, int $productId): array
    {
        $items = $this->raw($owner);
        unset($items[$productId]);
        $this->persist($owner, $items);

        return $this->summary($owner);
    }

    public function clear(string $owner): void
    {
        $this->cache->forget($this->key($owner));
    }

    /**
     * Merge a guest cart into a user cart (on login), summing quantities,
     * then discard the guest cart.
     */
    public function merge(string $guestOwner, string $userOwner): array
    {
        $guest = $this->raw($guestOwner);
        $user = $this->raw($userOwner);

        foreach ($guest as $productId => $qty) {
            $user[$productId] = ($user[$productId] ?? 0) + $qty;
        }

        // Re-cap each line to available stock so a merge can't exceed inventory.
        foreach ($user as $productId => $qty) {
            $product = Product::find($productId);
            if (! $product || $product->status !== 'published') {
                unset($user[$productId]);
                continue;
            }
            $user[$productId] = min($qty, $product->stock_quantity);
        }

        $this->persist($userOwner, $user);
        $this->clear($guestOwner);

        return $this->summary($userOwner);
    }

    /**
     * Priced cart summary computed from current DB prices + optional delivery zone.
     *
     * @return array{items: array<int, array<string, mixed>>, item_count: int, subtotal: float, delivery_charge: float, total: float, delivery_zone_id: int|null}
     */
    public function summary(string $owner, ?int $deliveryZoneId = null): array
    {
        $items = $this->raw($owner);
        $lines = [];
        $subtotal = 0.0;

        if ($items !== []) {
            $products = Product::whereIn('id', array_keys($items))->get()->keyBy('id');

            foreach ($items as $productId => $qty) {
                $product = $products->get($productId);
                if (! $product) {
                    continue; // product vanished; skip silently
                }

                $unit = (float) ($product->sale_price ?? $product->price);
                $lineTotal = round($unit * $qty, 2);
                $subtotal += $lineTotal;

                $lines[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'unit_price' => $unit,
                    'quantity' => $qty,
                    'line_total' => $lineTotal,
                    'in_stock' => $product->stock_quantity >= $qty,
                ];
            }
        }

        $deliveryCharge = 0.0;
        if ($deliveryZoneId) {
            $zone = DeliveryZone::where('is_active', true)->find($deliveryZoneId);
            $deliveryCharge = $zone ? (float) $zone->delivery_charge : 0.0;
        }

        return [
            'items' => $lines,
            'item_count' => array_sum($items),
            'subtotal' => round($subtotal, 2),
            'delivery_charge' => round($deliveryCharge, 2),
            'total' => round($subtotal + $deliveryCharge, 2),
            'delivery_zone_id' => $deliveryZoneId,
        ];
    }

    private function findPurchasable(int $productId): Product
    {
        $product = Product::where('id', $productId)
            ->where('status', 'published')
            ->first();

        if (! $product) {
            throw ValidationException::withMessages([
                'product_id' => ['Product is not available for purchase.'],
            ]);
        }

        return $product;
    }

    private function assertStock(Product $product, int $quantity): void
    {
        if ($product->stock_quantity < $quantity) {
            throw ValidationException::withMessages([
                'quantity' => ["Only {$product->stock_quantity} unit(s) available in stock."],
            ]);
        }
    }

    private function persist(string $owner, array $items): void
    {
        if ($items === []) {
            $this->cache->forget($this->key($owner));

            return;
        }

        $this->cache->put($this->key($owner), $items, $this->ttl);
    }

    private function key(string $owner): string
    {
        return "cart:{$owner}";
    }
}
