"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Tag,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { PaginatedResponse, Wishlist } from "@/types";

export default function WishlistPage() {
  const { hydrated, isAuthenticated } = useDashboardAuth();
  const addItem = useCartStore((s) => s.addItem);
  const syncRemove = useWishlistStore((s) => s.remove);

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
      setItems(res.data.data ?? []);
      setLastPage(res.data.last_page ?? 1);
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
      if (item.product?.id) {
        syncRemove(item.product.id);
      }
      toast.success("পছন্দের তালিকা থেকে সরানো হয়েছে");
    } catch {
      toast.error("মুছে ফেলা সম্ভব হয়নি");
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
      stock: p.stock_quantity ?? 99,
      categorySlug: p.category?.slug,
    });
    toast.success(`${p.name} - Added to Cart!`);
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2" lang="bn">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <span>পছন্দের তালিকা (My Wishlist)</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5" lang="bn">
            আপনার সেভ করা পছন্দের পণ্যসমূহ এখান থেকেই সরাসরি কার্টে যোগ করুন {!loading && `(মোট ${items.length}টি)`}
          </p>
        </div>

        <Button
          nativeButton={false}
          render={<Link href="/products" />}
          className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs self-start sm:self-auto"
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
          <span>আরও পণ্য দেখুন</span>
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#f47920]" />
          <p className="text-sm text-muted-foreground font-medium" lang="bn">
            পছন্দের পণ্য লোড হচ্ছে...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-gray-100 shadow-sm text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900" lang="bn">
            আপনার পছন্দের তালিকা খালি
          </h2>
          <p className="text-xs text-muted-foreground" lang="bn">
            পণ্য ব্রাউজ করার সময় ❤️ বাটনে চাপ দিয়ে পছন্দের পণ্যগুলো এখানে সেভ করে রাখুন।
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/products" />}
            className="h-11 px-6 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-md"
          >
            কেনাকাটা শুরু করুন
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => {
              const p = item.product;
              if (!p) return null;
              const outOfStock = p.status === "out_of_stock" || (p.stock_quantity ?? 0) <= 0;
              const imageUrl = p.images && p.images.length > 0 ? p.images[0].url : null;
              const price = Number(p.price);
              const salePrice = p.sale_price !== null ? Number(p.sale_price) : null;
              const hasSale = salePrice !== null && salePrice < price;
              const effectivePrice = hasSale && salePrice !== null ? salePrice : price;
              const discountPct = hasSale ? Math.round((1 - salePrice! / price) * 100) : 0;
              const productLink = p.category?.slug ? `/products/${p.category.slug}/${p.slug}` : `/products/${p.slug}`;

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-[#f47920]/40 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Thumbnail Section */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      <Link href={productLink} className="absolute inset-0">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={p.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ShoppingBag className="h-8 w-8 text-gray-300" />
                          </div>
                        )}

                        {/* Out of Stock Overlay */}
                        {outOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="rounded-full bg-black/80 px-2.5 py-0.5 text-xs font-semibold text-white">
                              স্টক নেই
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Discount Badge */}
                      {hasSale && !outOfStock && (
                        <span className="absolute top-2 left-2 rounded-lg bg-red-600 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-xs">
                          -{discountPct}%
                        </span>
                      )}

                      {/* Delete / Remove Icon Button */}
                      <button
                        type="button"
                        onClick={() => remove(item)}
                        disabled={removingId === item.id}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-gray-400 hover:text-red-600 hover:bg-white shadow-xs transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Body Details */}
                    <div className="p-3.5 space-y-1.5">
                      {p.brand && (
                        <p className="text-[11px] font-semibold text-muted-foreground truncate">
                          {p.brand.name}
                        </p>
                      )}
                      <Link href={productLink}>
                        <h3 className="line-clamp-2 min-h-[2.5rem] text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#f47920] transition-colors leading-snug">
                          {p.name}
                        </h3>
                      </Link>
                      <div className="flex items-baseline gap-1.5 pt-0.5">
                        <span className="text-sm sm:text-base font-extrabold text-[#f47920]">
                          {formatTaka(effectivePrice)}
                        </span>
                        {hasSale && (
                          <span className="text-[11px] text-muted-foreground line-through">
                            {formatTaka(price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Action */}
                  <div className="p-3 pt-0">
                    <Button
                      className="h-10 w-full rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                      onClick={() => addToCart(item)}
                      disabled={outOfStock}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{outOfStock ? "স্টক নেই" : "Add to Cart"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl text-xs font-bold"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                আগের পৃষ্ঠা
              </Button>
              <span className="text-xs font-semibold text-muted-foreground" lang="bn">
                পৃষ্ঠা {page} / {lastPage}
              </span>
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl text-xs font-bold"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                পরের পৃষ্ঠা
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
