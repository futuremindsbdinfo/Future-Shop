import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { apiFetchSafe } from "@/lib/server-api";
import type { PaginatedResponse, Product } from "@/types";

// SSR — render per request (query-param driven).
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

type SearchParams = {
  page?: string;
  category?: string;
  brand_id?: string;
  search?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const pageNum = Math.max(1, Number(sp.page) || 1);

  // Build the backend query — only include params the user passed.
  // Backend's public /products endpoint defaults to status=published.
  const query = new URLSearchParams({ page: String(pageNum) });
  if (sp.category) query.set("category", sp.category);
  if (sp.brand_id && /^\d+$/.test(sp.brand_id)) query.set("brand_id", sp.brand_id);
  if (sp.search) query.set("search", sp.search);

  const products = await apiFetchSafe<PaginatedResponse<Product>>(
    `/products?${query.toString()}`,
    EMPTY_PAGE,
    { cache: "no-store" },
  );

  // Preserve filter params across pagination links.
  const buildPageHref = (target: number) => {
    const next = new URLSearchParams(query);
    next.set("page", String(target));
    return `/products?${next.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 lang="bn" className="text-2xl font-bold">
          সকল পণ্য
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.total} {products.total === 1 ? "product" : "products"}
        </p>
      </div>

      {products.data.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="h-7 w-7" />}
          title="No products yet"
          description="Check back soon — sellers are adding products."
          action={
            <Button
              nativeButton={false}
              render={<Link href="/" />}
              className="h-11 bg-[#f47920] hover:bg-[#e56910]"
            >
              Back to Home
            </Button>
          }
        />
      ) : (
        <>
          <div className="product-grid grid gap-3 sm:gap-4">
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
                    <Link href={buildPageHref(pageNum - 1)} />
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
                    <Link href={buildPageHref(pageNum + 1)} />
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
