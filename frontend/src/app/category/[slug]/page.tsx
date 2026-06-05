import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageOpen } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { apiFetchSafe } from "@/lib/server-api";
import type { Category, PaginatedResponse, Product } from "@/types";

// SSR — render per request.
export const dynamic = "force-dynamic";

const EMPTY_PAGE: PaginatedResponse<Product> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: null,
  to: null,
  first_page_url: "",
  last_page_url: "",
  next_page_url: null,
  prev_page_url: null,
  path: "",
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const categoryRes = await apiFetchSafe<{ data: Category } | null>(
    `/categories/${slug}`,
    null,
    { cache: "no-store" },
  );
  if (!categoryRes) notFound();
  const category = categoryRes.data;

  const products = await apiFetchSafe<PaginatedResponse<Product>>(
    `/products?category=${encodeURIComponent(slug)}&page=${pageNum}`,
    EMPTY_PAGE,
    { cache: "no-store" },
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{category.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.total} {products.total === 1 ? "product" : "products"}
        </p>
      </div>

      {products.data.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="h-7 w-7" />}
          title="No products in this category"
          description="Check back soon — sellers are adding products."
          action={
            <Button nativeButton={false} render={<Link href="/" />} className="h-11 bg-[#f47920] hover:bg-[#e56910]">
              Back to Home
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.last_page > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                className="h-11"
                nativeButton={false}
                disabled={pageNum <= 1}
                render={
                  pageNum > 1 ? (
                    <Link href={`/category/${slug}?page=${pageNum - 1}`} />
                  ) : undefined
                }
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {products.current_page} of {products.last_page}
              </span>
              <Button
                variant="outline"
                className="h-11"
                nativeButton={false}
                disabled={pageNum >= products.last_page}
                render={
                  pageNum < products.last_page ? (
                    <Link href={`/category/${slug}?page=${pageNum + 1}`} />
                  ) : undefined
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
