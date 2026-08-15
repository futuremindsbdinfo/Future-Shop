"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import type { Brand } from "@/types";

export function HorizontalBrandScroll({
  brands,
}: {
  brands: Brand[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, [brands]);

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

  if (!brands || brands.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 relative z-20 w-full overflow-hidden mb-6 shadow-sm border border-gray-100 group/scroll">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2" lang="bn">
          <span className="h-4 w-1 bg-[#f47920] rounded-full inline-block"></span>
          জনপ্রিয় ব্র্যান্ডসমূহ
        </h2>
        <Link
          href="/brands"
          className="text-xs md:text-sm font-semibold text-[#f47920] hover:text-[#d46212] hover:underline flex items-center gap-1"
          lang="bn"
        >
          সব ব্র্যান্ড দেখুন →
        </Link>
      </div>

      <div className="relative">
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

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-2 scroll-smooth snap-x snap-mandatory"
        >
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="flex flex-col items-center gap-2.5 flex-shrink-0 w-[100px] sm:w-[120px] group snap-start"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#F8F9FA] rounded-2xl overflow-hidden border border-gray-200/80 group-hover:border-[#f47920] group-hover:shadow-md transition-all p-3 flex items-center justify-center">
                {brand.logo?.url ? (
                  <Image
                    src={brand.logo.url}
                    alt={brand.name}
                    fill
                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                    <Tag className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center line-clamp-1 group-hover:text-[#f47920] transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>

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
