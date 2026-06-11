import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Product } from "@/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 lang="bn" className="text-lg font-bold">
          জনপ্রিয় পণ্য
        </h2>
        <Link
          href="/products"
          lang="bn"
          className="text-sm text-[#f47920] hover:underline"
        >
          সব পণ্য দেখুন →
        </Link>
      </div>
      {products.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="h-7 w-7" />}
          title="No products yet"
          description="Featured products will appear here once sellers add them."
        />
      ) : (
        <div className="product-grid grid gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
