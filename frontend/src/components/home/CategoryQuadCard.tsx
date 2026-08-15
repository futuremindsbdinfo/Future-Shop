import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";

export function CategoryQuadCard({
  title,
  products,
  categorySlug,
}: {
  title: string;
  products: Product[];
  categorySlug: string;
}) {
  const displayProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col rounded-2xl bg-white p-4 md:p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-[#f47920]/30 h-full">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-base md:text-lg font-bold text-gray-900 line-clamp-1" lang="bn">
          {title}
        </h2>
      </div>

      {displayProducts.length === 1 ? (
        // Single featured product banner in quad card
        <Link
          href={`/products/${categorySlug}/${displayProducts[0].slug}`}
          className="flex-1 flex flex-col gap-2 group mb-3"
        >
          <div className="relative aspect-video w-full bg-[#F8F9FA] rounded-xl overflow-hidden">
            {displayProducts[0].images?.[0]?.url ? (
              <Image
                src={displayProducts[0].images[0].url}
                alt={displayProducts[0].name}
                fill
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingBag className="w-8 h-8" />
              </div>
            )}
          </div>
          <span className="text-xs md:text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-[#f47920] transition-colors">
            {displayProducts[0].name}
          </span>
        </Link>
      ) : (
        // 2x2 Product Grid
        <div className="grid grid-cols-2 gap-2.5 flex-1 mb-3.5">
          {displayProducts.map((product) => {
            const productLink = `/products/${categorySlug}/${product.slug}`;
            return (
              <Link key={product.id} href={productLink} className="flex flex-col gap-1 group">
                <div className="relative aspect-square w-full bg-[#F8F9FA] rounded-lg overflow-hidden border border-gray-100/80">
                  {product.images?.[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] md:text-xs text-gray-700 font-medium line-clamp-1 group-hover:text-[#f47920] transition-colors">
                  {product.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <Link
        href={`/products?category=${categorySlug}`}
        className="text-xs md:text-sm font-semibold text-[#f47920] hover:text-[#d46212] flex items-center gap-1.5 mt-auto pt-2 border-t border-gray-50"
        lang="bn"
      >
        <span>পণ্যসমূহ দেখুন</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
