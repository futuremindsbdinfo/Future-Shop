"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatTaka } from "@/lib/utils";
import type { Product, ProductImage } from "@/types";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  // Reactive: re-renders when the wishlist changes. Hydration-safe without a
  // `mounted` guard — the store uses skipHydration and <WishlistHydrator/>
  // rehydrates in an effect, so the first client render matches the SSR output
  // (both empty); the heart flips to filled after the post-hydration rehydrate.
  const isWishlisted = useWishlistStore((state) => state.has(product.id));

  const {
    id,
    name,
    slug,
    price,
    sale_price,
    status,
    stock_quantity,
    images,
    brand,
  } = product;

  const effectivePrice = sale_price ? Number(sale_price) : Number(price);
  const originalPrice = Number(price);
  const hasDiscount = !!sale_price && Number(sale_price) < originalPrice;
  const discountPct = hasDiscount
    ? Math.round((1 - Number(sale_price) / originalPrice) * 100)
    : 0;
  const outOfStock = status !== "published" || stock_quantity <= 0;
  // Skip external SVGs (XSS risk); show the first renderable image.
  const isExternalSvg = (img: ProductImage) =>
    img.disk === "external" && /\.svg(\?|#|$)/i.test(img.url);
  const displayImage = (images ?? []).find((img) => img?.url && !isExternalSvg(img)) ?? null;
  const imageUrl = displayImage?.url ?? null;

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

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    // Guest-friendly: toggle the client-side wishlist (localStorage). Capture
    // the state before toggling so the toast describes what just happened.
    const wasWishlisted = isWishlisted;
    toggleWishlist({
      productId: id,
      name,
      slug,
      price: originalPrice,
      sale_price: sale_price ? Number(sale_price) : null,
      image: imageUrl ?? undefined,
      stock: stock_quantity,
      categorySlug: product.category?.slug,
    });
    toast.success(
      wasWishlisted ? "উইশলিস্ট থেকে সরানো হয়েছে" : "উইশলিস্টে যোগ হয়েছে",
    );
  };

  const subline = brand?.name;
  const productLink = product.category?.slug ? `/products/${product.category.slug}/${slug}` : `/products/${slug}`;

  return (
    <div className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#f1f5f9] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Image block */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={productLink} className="absolute inset-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={displayImage?.disk === "external"}
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

        {/* Wishlist button — toggles the client-side (guest) wishlist. Sits
            top-right, opposite the floating add-to-cart at bottom-right. */}
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/80 text-gray-600 backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500 sm:h-10 sm:w-10"
          aria-label={
            isWishlisted ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে যোগ করুন"
          }
          aria-pressed={isWishlisted}
        >
          <Heart
            className={`h-5 w-5 ${
              isWishlisted ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>

        {/* Floating add-to-cart (icon only) — sits in the image's bottom-right
            corner. Sibling of the cover Link, so it doesn't trigger navigation;
            handleAddToCart also preventDefaults. Hidden when out of stock. */}
        {!outOfStock && (
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label="কার্টে যোগ করুন"
            className="absolute bottom-2 right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[#f47920] text-white shadow-md transition-colors hover:bg-orange-600 sm:h-10 sm:w-10"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        {subline && (
          <p className="truncate text-xs text-muted-foreground">{subline}</p>
        )}
        <Link href={productLink} className="flex-1">
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
      </div>
    </div>
  );
}
