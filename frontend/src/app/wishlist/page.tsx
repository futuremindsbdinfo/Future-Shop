"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { formatTaka } from "@/lib/utils";
import type { WishlistItem } from "@/types";

/**
 * Guest wishlist page — reads entirely from the client wishlistStore
 * (localStorage), so no login is required. The separate, login-gated
 * /dashboard/wishlist (server-backed) is left untouched.
 *
 * Lint-clean hydration flag: useSyncExternalStore reports the persisted store's
 * hydration status — false on the server and the first client render, then true
 * once <WishlistHydrator/> finishes rehydrating. Keeping the SSR and first
 * client render identical avoids a hydration mismatch; gating the content on it
 * avoids the empty-state flash for guests who have saved items. (The older
 * `mounted` useEffect pattern trips the set-state-in-effect rule, so we use the
 * store's own hydration callbacks instead.)
 */
function useWishlistHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    // If it's already hydrated before the effect runs, set true immediately
    if (useWishlistStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      const unsub = useWishlistStore.persist.onFinishHydration(() => setHydrated(true));
      return unsub;
    }
  }, []);

  return hydrated;
}

export default function WishlistPage() {
  const hydrated = useWishlistHydrated();
  const items = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);

  const addToCart = (item: WishlistItem) => {
    const salePrice = item.sale_price ?? null;
    const effectivePrice =
      salePrice !== null && salePrice < item.price ? salePrice : item.price;
    addItem({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: effectivePrice,
      quantity: 1,
      image: item.image,
      stock: item.stock,
    });
    toast.success("কার্টে যোগ হয়েছে");
  };

  const remove = (item: WishlistItem) => {
    removeFromWishlist(item.productId);
    toast.success("উইশলিস্ট থেকে সরানো হয়েছে");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-xl font-bold sm:text-2xl" lang="bn">
        আপনার উইশলিস্ট
        {hydrated && items.length > 0 && (
          <span className="text-muted-foreground"> · {items.length} টি পণ্য</span>
        )}
      </h1>

      {!hydrated ? (
        // One-tick skeleton until the store rehydrates from localStorage; avoids
        // flashing the empty state to guests who actually have saved items.
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Heart className="h-7 w-7" />}
          title="আপনার উইশলিস্ট খালি"
          description="পছন্দের পণ্য সেভ করে রাখুন, পরে সহজে খুঁজে পাবেন।"
          action={
            <Link
              href="/products"
              lang="bn"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#f47920] px-5 text-sm font-medium text-white transition-colors hover:bg-[#e56910]"
            >
              কেনাকাটা শুরু করুন
            </Link>
          }
        />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const salePrice = item.sale_price ?? null;
            const hasSale = salePrice !== null && salePrice < item.price;
            const effectivePrice =
              hasSale && salePrice !== null ? salePrice : item.price;
            const outOfStock = item.stock !== undefined && item.stock <= 0;

            return (
              <Card
                key={item.productId}
                className="overflow-hidden rounded-xl border border-[#f1f5f9] shadow-sm"
              >
                <Link
                  href={item.categorySlug ? `/products/${item.categorySlug}/${item.slug}` : `/products/${item.slug}`}
                  className="relative block aspect-square bg-muted"
                >
                  {item.image ? (
                    // Plain img: wishlist thumbnails may point to external image
                    // URLs that are not in next/image remotePatterns.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                  {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span
                        lang="bn"
                        className="rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white"
                      >
                        স্টক নেই
                      </span>
                    </div>
                  )}
                </Link>
                <CardContent className="space-y-2 p-3">
                  <Link href={item.categorySlug ? `/products/${item.categorySlug}/${item.slug}` : `/products/${item.slug}`}>
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug hover:text-[#f47920]">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-[#f47920]">
                      {formatTaka(effectivePrice)}
                    </span>
                    {hasSale && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatTaka(item.price)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 pt-1">
                    <Button
                      className="h-11 w-full bg-[#f47920] hover:bg-[#e56910]"
                      onClick={() => addToCart(item)}
                      disabled={outOfStock}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span lang="bn">
                        {outOfStock ? "স্টকে নেই" : "কার্টে যোগ করুন"}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-11 w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => remove(item)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span lang="bn">সরান</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
