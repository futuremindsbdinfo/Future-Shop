"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import { useCartStore } from "@/store/cartStore";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { PaginatedResponse, Wishlist } from "@/types";

export default function WishlistPage() {
  const { hydrated, isAuthenticated } = useDashboardAuth();
  const addItem = useCartStore((s) => s.addItem);

  const [items, setItems] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Wishlist>>(
        `/account/wishlists?page=${page}`,
      );
      setItems(res.data.data);
      setLastPage(res.data.last_page);
    } catch {
      /* 401 handled */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (hydrated && isAuthenticated) load();
  }, [hydrated, isAuthenticated, load]);

  const remove = async (item: Wishlist) => {
    setRemovingId(item.id);
    try {
      await api.delete(`/account/wishlists/${item.id}`);
      setItems((prev) => prev.filter((w) => w.id !== item.id));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Could not remove");
    } finally {
      setRemovingId(null);
    }
  };

  const addToCart = (item: Wishlist) => {
    const p = item.product;
    if (!p) return;
    const price = p.sale_price ? Number(p.sale_price) : Number(p.price);
    const imageUrl = p.images && p.images.length > 0 ? p.images[0].url : undefined;
    addItem({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      price,
      quantity: 1,
      image: imageUrl,
      stock: p.stock_quantity,
    });
    toast.success(`${p.name} added to cart`);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold md:text-2xl">My Wishlist</h1>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-7 w-7" />}
          title="Your wishlist is empty"
          description="Save products you love to find them again easily."
          action={
            <Button
              nativeButton={false}
              render={<Link href="/" />}
              className="h-11 bg-[#f47920] hover:bg-[#e56910]"
            >
              Browse Products
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const p = item.product;
              if (!p) return null;
              const outOfStock =
                p.status === "out_of_stock" || p.stock_quantity <= 0;
              const imageUrl =
                p.images && p.images.length > 0 ? p.images[0].url : null;
              const price = Number(p.price);
              const salePrice =
                p.sale_price !== null ? Number(p.sale_price) : null;
              const hasSale = salePrice !== null && salePrice < price;
              const effectivePrice = hasSale && salePrice !== null ? salePrice : price;

              return (
                <Card
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-[#f1f5f9] shadow-sm"
                >
                  <Link
                    href={`/products/${p.slug}`}
                    className="relative block aspect-square bg-muted"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-gray-900">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </Link>
                  <CardContent className="space-y-2 p-3">
                    {p.brand && (
                      <p className="truncate text-xs text-muted-foreground">
                        {p.brand.name}
                      </p>
                    )}
                    <Link href={`/products/${p.slug}`}>
                      <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium hover:text-[#f47920]">
                        {p.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-[#f47920]">
                        {formatTaka(effectivePrice)}
                      </span>
                      {hasSale && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatTaka(price)}
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
                        {outOfStock ? "Unavailable" : "Add to Cart"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-11 w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => remove(item)}
                        disabled={removingId === item.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {removingId === item.id ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                className="h-11 px-4"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {lastPage}
              </span>
              <Button
                variant="outline"
                className="h-11 px-4"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
