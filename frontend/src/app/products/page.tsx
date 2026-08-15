import type { Metadata } from "next";
import Link from "next/link";
import { PackageOpen, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { apiFetchSafe } from "@/lib/server-api";
import { InfiniteProductGrid } from "@/components/shop/InfiniteProductGrid";
import { ProductFilterSidebar } from "@/components/shop/ProductFilterSidebar";
import { ProductSortSelect } from "@/components/shop/ProductSortSelect";
import { ActiveFilterChips } from "@/components/shop/ActiveFilterChips";
import type { Brand, Category, PaginatedResponse, Product } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "সকল পণ্য | Future Shop — শেরপুর, বগুড়া",
  description:
    "Future Shop-এ সেরা মূল্যে আসল পণ্য কিনুন। মুদি, নিত্যপ্রয়োজনীয় আইটেম, বেবি কেয়ার এবং আকর্ষণীয় সব ব্র্যান্ড কালেকশন। দ্রুত ডেলিভারি শেরপুর, বগুড়া।",
};

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
  sort?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const pageNum = Math.max(1, Number(sp.page) || 1);

  // Build the backend query — only include params the user passed.
  const query = new URLSearchParams({ page: String(pageNum) });
  if (sp.category) query.set("category", sp.category);
  if (sp.brand_id && /^\d+$/.test(sp.brand_id)) query.set("brand_id", sp.brand_id);
  if (sp.search) query.set("search", sp.search);
  if (sp.sort) query.set("sort", sp.sort);

  // Fetch products, categories, and brands in parallel
  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    apiFetchSafe<PaginatedResponse<Product>>(
      `/products?${query.toString()}`,
      EMPTY_PAGE,
      { cache: "no-store" }
    ),
    apiFetchSafe<{ data: Category[] }>("/categories", { data: [] }, { next: { revalidate: 60 } }),
    apiFetchSafe<PaginatedResponse<Brand>>("/brands?per_page=50", { data: [] } as any, {
      next: { revalidate: 60 },
    }),
  ]);

  const products = productsRes;
  const categories = categoriesRes.data ?? [];
  const brands = brandsRes.data ?? [];

  // Pass active filters to Client Component so infinite scroll uses the exact query params
  const queryParams: Record<string, string> = {};
  if (sp.category) queryParams.category = sp.category;
  if (sp.brand_id) queryParams.brand_id = sp.brand_id;
  if (sp.search) queryParams.search = sp.search;
  if (sp.sort) queryParams.sort = sp.sort;

  return (
    <main className="min-h-screen bg-[#f8fafc] py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Top Header & Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#f47920]/10 text-[#f47920] text-xs font-semibold mb-1.5">
              <Sparkles className="h-3 w-3" />
              <span>অনলাইন বাজার</span>
            </div>
            <h1 lang="bn" className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              সকল পণ্য (All Products)
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground" lang="bn">
              মোট <span className="text-gray-900 font-bold">{products.total}</span>টি পণ্য পাওয়া গেছে
            </p>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-3">
            <ProductSortSelect />
          </div>
        </div>

        {/* Active Filter Chips */}
        <ActiveFilterChips categories={categories} brands={brands} />

        {/* Layout: Sidebar + Product Grid */}
        <div className="flex items-start gap-6 lg:gap-8">
          {/* Desktop Filter Sidebar & Mobile Drawer Trigger */}
          <ProductFilterSidebar categories={categories} brands={brands} />

          {/* Product Grid Area */}
          <div className="flex-1 w-full min-w-0">
            {products.data.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-sm text-center">
                <EmptyState
                  icon={<PackageOpen className="h-10 w-10 text-[#f47920]" />}
                  title="কোনো পণ্য পাওয়া যায়নি"
                  description="আপনার সিলেক্ট করা ফিল্টারের সাথে মিলে এমন কোনো পণ্য নেই। অনুগ্রহ করে অন্য ফিল্টার চেষ্টা করুন।"
                  action={
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <Button
                        nativeButton={false}
                        render={<Link href="/products" />}
                        variant="outline"
                        className="h-10"
                      >
                        ফিল্টার মুছুন
                      </Button>
                      <Button
                        nativeButton={false}
                        render={<Link href="/" />}
                        className="h-10 bg-[#f47920] hover:bg-[#e56910] text-white"
                      >
                        হোমপেজে যান
                      </Button>
                    </div>
                  }
                />
              </div>
            ) : (
              <InfiniteProductGrid
                initialData={products}
                queryParams={queryParams}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
