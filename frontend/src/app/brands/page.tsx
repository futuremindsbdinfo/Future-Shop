import Link from "next/link";
import Image from "next/image";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiFetchSafe } from "@/lib/server-api";
import type { Brand, PaginatedResponse } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Brands | Future Shop" };

const EMPTY_BRANDS: PaginatedResponse<Brand> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
  from: null,
  to: null,
  first_page_url: "",
  last_page_url: "",
  next_page_url: null,
  prev_page_url: null,
  path: "",
};

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const res = await apiFetchSafe<PaginatedResponse<Brand>>(
    `/brands?page=${pageNum}`,
    EMPTY_BRANDS,
    { cache: "no-store" },
  );

  const brands = res.data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Brands</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {res.total} brand{res.total !== 1 ? "s" : ""} available
        </p>
      </div>

      {brands.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-7 w-7" />}
          title="No brands yet"
          description="Check back soon — brands will appear here."
        />
      ) : (
        <>
          {/* Brand grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center rounded-xl border bg-card p-4 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Logo */}
                <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                  {brand.logo?.url ? (
                    <Image
                      src={brand.logo.url}
                      alt={brand.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Tag className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                {/* Name */}
                <h2 className="line-clamp-2 text-sm font-semibold leading-tight group-hover:text-[#f47920]">
                  {brand.name}
                </h2>
                {/* Product count */}
                {brand.products_count !== undefined && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {brand.products_count} product
                    {brand.products_count !== 1 ? "s" : ""}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {res.last_page > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                className="h-11 px-4"
                nativeButton={false}
                disabled={pageNum <= 1}
                render={
                  pageNum > 1 ? (
                    <Link href={`/brands?page=${pageNum - 1}`} />
                  ) : undefined
                }
              >
                Previous
              </Button>
              <span className="px-2 text-sm text-muted-foreground">
                Page {pageNum} of {res.last_page}
              </span>
              <Button
                variant="outline"
                className="h-11 px-4"
                nativeButton={false}
                disabled={pageNum >= res.last_page}
                render={
                  pageNum < res.last_page ? (
                    <Link href={`/brands?page=${pageNum + 1}`} />
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
