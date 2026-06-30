import Link from "next/link";
import Image from "next/image";
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
  return (
    <div className="flex flex-col bg-white p-4 h-full relative z-20 overflow-hidden" style={{ minHeight: '400px' }}>
      <h2 className="text-[21px] font-bold leading-6 mb-3 text-[#0F1111] line-clamp-1">{title}</h2>
      
      <div className="grid grid-cols-2 gap-2 flex-1 mb-4">
        {products.slice(0, 4).map((product, index) => (
          <Link key={product.id || index} href={`/products/${product.slug}`} className="flex flex-col gap-1 group">
            <div className="relative aspect-square w-full bg-[#F7F7F7]">
              {product.images?.[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            <span className="text-[12px] text-[#0F1111] line-clamp-1 group-hover:text-[#c45500]">
              {product.name}
            </span>
          </Link>
        ))}
        {/* If less than 4 products, fill with blanks */}
        {products.length < 4 && Array.from({ length: 4 - products.length }).map((_, i) => (
          <div key={`blank-${i}`} className="flex flex-col gap-1">
             <div className="relative aspect-square w-full bg-[#F7F7F7]" />
             <span className="text-[12px] text-transparent">Placeholder</span>
          </div>
        ))}
      </div>
      
      <Link href={`/category/${categorySlug}`} className="text-[13px] font-semibold text-[#007185] hover:text-[#C7511F] hover:underline mt-auto">
        Shop now
      </Link>
    </div>
  );
}
