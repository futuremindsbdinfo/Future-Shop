"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 600;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white p-4 relative z-20 w-full overflow-hidden mb-6 group/scroll">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-[21px] font-bold text-[#0F1111]">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-[14px] font-semibold text-[#007185] hover:text-[#C7511F] hover:underline">
            See all
          </Link>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-[35%] -translate-y-1/2 z-10 bg-white/90 border border-gray-300 shadow-md h-12 w-10 flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-gray-50 focus:outline-none"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="flex flex-col flex-shrink-0 w-[180px] group"
            >
              <div className="relative w-full aspect-square bg-[#F7F7F7] mb-2 p-2">
                {product.images?.[0]?.url ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-contain mix-blend-multiply"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="flex flex-col gap-1 px-1">
                <span className="text-[14px] text-[#0F1111] line-clamp-2 leading-tight group-hover:text-[#c45500]">
                  {product.name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[18px] font-semibold text-[#B12704]">
                    ৳{Number(product.price).toLocaleString("en-US")}
                  </span>
                  {product.sale_price && (
                    <span className="text-[12px] text-[#565959] line-through">
                      ৳{Number(product.sale_price).toLocaleString("en-US")}
                    </span>
                  )}
                </div>
              </div>
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
