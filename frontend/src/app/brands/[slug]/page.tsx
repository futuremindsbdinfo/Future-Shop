import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProductCard } from "@/components/shop/ProductCard";
import { apiFetchSafe } from "@/lib/server-api";
import type { Brand, PaginatedResponse, Product } from "@/types";

export const dynamic = "force-dynamic";

type BrandShowResponse = {
  brand: Brand;
  products: PaginatedResponse<Product>;
};

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const res = await apiFetchSafe<BrandShowResponse | null>(
    `/brands/${encodeURIComponent(slug)}?page=${pageNum}`,
    null,
    { cache: "no-store" },
  );

  if (!res) notFound();

  const { brand, products } = res;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Brand header */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
          {brand.logo?.url ? (
            <Image
              src={brand.logo.url}
              alt={brand.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <Tag className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{brand.name}</h1>
          {brand.description && (
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              {brand.description}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {products.total} product{products.total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Products */}
      {products.data.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-7 w-7" />}
          title="No products yet"
          description="This brand has no published products at the moment."
          action={
            <Link
              href="/brands"
              className="text-sm text-[#f47920] hover:underline"
            >
              Browse all brands
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {products.last_page > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                className="h-11 px-4"
                nativeButton={false}
                disabled={pageNum <= 1}
                render={
                  pageNum > 1 ? (
                    <Link href={`/brands/${slug}?page=${pageNum - 1}`} />
                  ) : undefined
                }
              >
                Previous
              </Button>
              <span className="px-2 text-sm text-muted-foreground">
                Page {pageNum} of {products.last_page}
              </span>
              <Button
                variant="outline"
                className="h-11 px-4"
                nativeButton={false}
                disabled={pageNum >= products.last_page}
                render={
                  pageNum < products.last_page ? (
                    <Link href={`/brands/${slug}?page=${pageNum + 1}`} />
                  ) : undefined
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
