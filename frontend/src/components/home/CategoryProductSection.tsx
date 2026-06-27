"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Category, Product } from "@/types";

export function CategoryProductSection({
  category,
  products,
}: {
  category: Category;
  products: Product[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  // Re-check on mount and resize
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75; // Scroll by 75% of the visible container width
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      // Safety check after smooth scroll finishes
      setTimeout(checkScroll, 350);
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">{category.name}</h2>
        <Link
          href={`/products?category=${category.slug}`}
          lang="bn"
          className="text-sm text-[#f47920] hover:underline"
        >
          সব দেখুন →
        </Link>
      </div>
      
      {/* Horizontal scrollable row wrapper with relative positioning for absolute buttons */}
      <div className="group relative">
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-40 flex-shrink-0 snap-start sm:w-48 md:w-56"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Scroll Buttons (Hidden on mobile, visible on desktop md+) */}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`absolute -left-5 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-md transition-all hover:border-[#f47920] hover:text-[#f47920] disabled:opacity-0 md:flex ${
            !canScrollLeft ? "pointer-events-none" : ""
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`absolute -right-5 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-md transition-all hover:border-[#f47920] hover:text-[#f47920] disabled:opacity-0 md:flex ${
            !canScrollRight ? "pointer-events-none" : ""
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}
