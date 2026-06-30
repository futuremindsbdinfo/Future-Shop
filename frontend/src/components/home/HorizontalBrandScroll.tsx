"use client";

import { useRef } from "react";
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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 600;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!brands || brands.length === 0) return null;

  return (
    <div className="bg-white p-4 relative z-20 w-full overflow-hidden mt-6 group/scroll">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-[21px] font-bold text-[#0F1111]">Top Brands</h2>
        <Link href="/brands" className="text-[14px] font-semibold text-[#007185] hover:text-[#C7511F] hover:underline">
          See all brands
        </Link>
      </div>
      
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-[35%] -translate-y-1/2 z-10 bg-white/90 border border-gray-300 shadow-md h-12 w-10 flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-gray-50 focus:outline-none"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="flex flex-col items-center gap-2 flex-shrink-0 w-[120px] group"
            >
              <div className="relative w-full aspect-square bg-[#F7F7F7] rounded-full overflow-hidden border border-gray-200 group-hover:border-[#f47920] p-2">
                {brand.logo?.url ? (
                  <Image
                    src={brand.logo.url}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Tag className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <span className="text-[14px] text-[#0F1111] font-medium text-center line-clamp-1 group-hover:text-[#c45500]">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-[35%] -translate-y-1/2 z-10 bg-white/90 border border-gray-300 shadow-md h-12 w-10 flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-gray-50 focus:outline-none"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
