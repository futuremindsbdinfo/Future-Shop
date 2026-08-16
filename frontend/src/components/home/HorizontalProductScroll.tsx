"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { formatTaka } from "@/lib/utils";
import type { Product } from "@/types";

export function HorizontalProductScroll({
  title,
  products,
  viewAllLink,
}: {
  title: string;
  products: Product[];
  viewAllLink?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const effectivePrice = product.sale_price ? Number(product.sale_price) : Number(product.price);
    const imageUrl = product.images?.[0]?.url;

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      quantity: 1,
      image: imageUrl,
      stock: product.stock_quantity ?? 99,
    });
    toast.success(`${product.name} কার্টে যোগ হয়েছে`);
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 relative z-20 w-full overflow-hidden mb-6 shadow-sm border border-gray-100 group/scroll">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2" lang="bn">
          <span className="h-4 w-1 bg-[#f47920] rounded-full inline-block"></span>
          {title}
        </h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="text-xs md:text-sm font-semibold text-[#f47920] hover:text-[#d46212] hover:underline flex items-center gap-1"
            lang="bn"
          >
            সব দেখুন →
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`absolute -left-2 md:-left-4 top-[40%] -translate-y-1/2 z-30 bg-white/95 border border-gray-200 shadow-lg h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all hover:bg-orange-50 hover:border-[#f47920] hover:text-[#f47920] focus:outline-none ${
            !canScrollLeft
              ? "opacity-0 pointer-events-none"
              : "opacity-90 group-hover/scroll:opacity-100"
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700 hover:text-[#f47920]" />
        </button>

        {/* Products Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth snap-x snap-mandatory"
        >
          {products.map((product) => {
            const originalPrice = Number(product.price);
            const effectivePrice = product.sale_price ? Number(product.sale_price) : originalPrice;
            const hasDiscount = !!product.sale_price && Number(product.sale_price) < originalPrice;
            const discountPct = hasDiscount
              ? Math.round((1 - Number(product.sale_price) / originalPrice) * 100)
              : 0;
            const outOfStock = product.status !== "published" || (product.stock_quantity ?? 0) <= 0;
            const productLink = product.category?.slug
              ? `/products/${product.category.slug}/${product.slug}`
              : `/products/${product.slug}`;

            return (
              <div
                key={product.id}
                className="group flex flex-col flex-shrink-0 w-[150px] sm:w-[170px] md:w-[190px] rounded-xl border border-gray-100 bg-white p-2.5 transition-all hover:border-[#f47920]/40 hover:shadow-md snap-start relative"
              >
                {/* Image Section */}
                <Link href={productLink} className="relative w-full aspect-square bg-[#F8F9FA] rounded-lg overflow-hidden mb-2">
                  {product.images?.[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}

                  {/* Discount Badge */}
                  {hasDiscount && !outOfStock && (
                    <span className="absolute left-1.5 top-1.5 z-10 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] md:text-xs font-bold text-white shadow-sm">
                      -{discountPct}%
                    </span>
                  )}

                  {/* Out of Stock Overlay */}
                  {outOfStock && (
                    <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
                      <span className="rounded bg-black/80 px-2 py-0.5 text-[11px] font-semibold text-white">
                        স্টক নেই
                      </span>
                    </div>
                  )}
                </Link>

                {/* Product Info */}
                <div className="flex flex-col flex-1 justify-between gap-1">
                  <Link href={productLink}>
                    <h3 className="text-xs md:text-sm font-medium text-gray-800 line-clamp-2 leading-tight group-hover:text-[#f47920] transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                    {/* Active price (sale_price if on sale, otherwise regular price) */}
                    <span className="text-sm md:text-base font-bold text-[#f47920]">
                      {formatTaka(effectivePrice)}
                    </span>
                    {/* Original price (crossed out if discount exists) */}
                    {hasDiscount && (
                      <span className="text-[11px] md:text-xs text-gray-400 line-through">
                        {formatTaka(originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Quick Add To Cart Button */}
                  {!outOfStock && (
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#f47920]/10 hover:bg-[#f47920] text-[#f47920] hover:text-white py-1.5 text-xs font-semibold transition-all duration-200"
                      aria-label="কার্টে যোগ করুন"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Cart</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`absolute -right-2 md:-right-4 top-[40%] -translate-y-1/2 z-30 bg-white/95 border border-gray-200 shadow-lg h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all hover:bg-orange-50 hover:border-[#f47920] hover:text-[#f47920] focus:outline-none ${
            !canScrollRight
              ? "opacity-0 pointer-events-none"
              : "opacity-90 group-hover/scroll:opacity-100"
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700 hover:text-[#f47920]" />
        </button>
      </div>
    </div>
  );
}
