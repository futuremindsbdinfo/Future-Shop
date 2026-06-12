"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatTaka } from "@/lib/utils";
import api from "@/lib/api";
import type { Product } from "@/types";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    id,
    name,
    slug,
    price,
    sale_price,
    status,
    stock_quantity,
    images,
    vendor,
    brand,
  } = product;

  const effectivePrice = sale_price ? Number(sale_price) : Number(price);
  const originalPrice = Number(price);
  const hasDiscount = !!sale_price && Number(sale_price) < originalPrice;
  const discountPct = hasDiscount
    ? Math.round((1 - Number(sale_price) / originalPrice) * 100)
    : 0;
  const outOfStock = status !== "published" || stock_quantity <= 0;
  const imageUrl = images && images.length > 0 ? images[0].url : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      productId: id,
      name,
      slug,
      price: effectivePrice,
      quantity: 1,
      image: imageUrl ?? undefined,
      stock: stock_quantity,
    });
    toast.success("কার্টে যোগ হয়েছে");
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("উইশলিস্টে যোগ করতে লগইন করুন");
      return;
    }
    try {
      await api.post("/account/wishlists", { product_id: id });
      toast.success("উইশলিস্টে যোগ হয়েছে");
    } catch {
      toast.error("উইশলিস্টে যোগ করা যায়নি");
    }
  };

  const subline = [brand?.name, vendor?.shop_name].filter(Boolean).join(" · ");

  return (
    <div className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#f1f5f9] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Image block */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/products/${slug}`} className="absolute inset-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
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

        {/* Discount badge */}
        {hasDiscount && !outOfStock && (
          <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            -{discountPct}%
          </span>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/80 backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500"
          aria-label="উইশলিস্টে যোগ করুন"
        >
          <Heart className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        {subline && (
          <p className="truncate text-xs text-muted-foreground">{subline}</p>
        )}
        <Link href={`/products/${slug}`} className="flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors hover:text-[#f47920]">
            {name}
          </h3>
        </Link>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-[#f47920]">
            {formatTaka(effectivePrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatTaka(originalPrice)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          lang="bn"
          className="mt-1 h-9 w-full rounded-lg bg-[#f47920] text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {outOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
        </button>
      </div>
    </div>
  );
}
