import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Tag, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { InfiniteProductGrid } from "@/components/shop/InfiniteProductGrid";
import { ProductSortSelect } from "@/components/shop/ProductSortSelect";
import { ProductFilterSidebar } from "@/components/shop/ProductFilterSidebar";
import { ActiveFilterChips } from "@/components/shop/ActiveFilterChips";
import { apiFetchSafe } from "@/lib/server-api";
import type { Brand, Category, PaginatedResponse, Product } from "@/types";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; category?: string; sort?: string; search?: string }>;
}

type BrandShowResponse = {
  brand: Brand;
  products: PaginatedResponse<Product>;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await apiFetchSafe<BrandShowResponse | null>(
    `/brands/${encodeURIComponent(slug)}`,
    null,
    { cache: "no-store" }
  );

  if (!res) {
    return {
      title: "ব্র্যান্ড পাওয়া যায়নি | Future Shop",
      description: "অনুরোধকৃত ব্র্যান্ডটি খুঁজে পাওয়া যায়নি।",
    };
  }

  const brand = res.brand;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shop.fuminds.com";
  const canonicalUrl = `${siteUrl}/brands/${slug}`;

  return {
    title: `${brand.name} পণ্যের কালেকশন | Future Shop — শেরপুর, বগুড়া`,
    description: `${brand.name}-এর সকল আসল পণ্য কিনুন সেরা মূল্যে Future Shop থেকে। দ্রুত ডেলিভারি ও ক্যাশ অন ডেলিভারি শেরপুর, বগুড়া।`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${brand.name} পণ্যের কালেকশন | Future Shop`,
      description: `${brand.name}-এর সেরা পণ্যসমূহ কিনুন আকর্ষণীয় মূল্যে।`,
      url: canonicalUrl,
      images: brand.logo?.url ? [{ url: brand.logo.url }] : [],
      type: "website",
    },
  };
}

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

export default async function SingleBrandPage({ params, searchParams }: RouteParams) {
  const { slug } = await params;
  const sp = await searchParams;
  const pageNum = Math.max(1, Number(sp.page) || 1);

  // 1. Fetch brand details
  const res = await apiFetchSafe<BrandShowResponse | null>(
    `/brands/${encodeURIComponent(slug)}`,
    null,
    { cache: "no-store" }
  );

  if (!res) notFound();
  const { brand } = res;

  // 2. Build product query with active brand ID
  const query = new URLSearchParams({
    brand_id: String(brand.id),
    page: String(pageNum),
  });
  if (sp.category) query.set("category", sp.category);
  if (sp.sort) query.set("sort", sp.sort);
  if (sp.search) query.set("search", sp.search);

  // 3. Fetch products, categories, and all brands in parallel
  const [productsRes, categoriesRes, allBrandsRes] = await Promise.all([
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
  const allBrands = allBrandsRes.data ?? [];

  const queryParams: Record<string, string> = { brand_id: String(brand.id) };
  if (sp.category) queryParams.category = sp.category;
  if (sp.sort) queryParams.sort = sp.sort;
  if (sp.search) queryParams.search = sp.search;

  return (
    <main className="min-h-screen bg-[#f8fafc] py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "সকল ব্র্যান্ড", url: "/brands" },
            { label: brand.name },
          ]}
        />

        {/* Brand Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-orange-50/40 to-white border border-gray-100 p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Brand Logo Box */}
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                {brand.logo?.url ? (
                  <Image
                    src={brand.logo.url}
                    alt={brand.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                ) : (
                  <Tag className="h-10 w-10 text-gray-400" />
                )}
              </div>

              {/* Brand Info */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#f47920]/10 text-[#f47920] text-xs font-bold">
                  <Sparkles className="h-3 w-3" />
                  <span>অফিসিয়াল ব্র্যান্ড</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {brand.name}
                </h1>
                {brand.description && (
                  <p className="text-xs sm:text-sm text-gray-600 max-w-prose">
                    {brand.description}
                  </p>
                )}
                <p className="text-xs sm:text-sm font-medium text-muted-foreground" lang="bn">
                  এই ব্র্যান্ডের মোট <span className="text-gray-900 font-bold">{products.total}</span>টি পণ্য পাওয়া গেছে
                </p>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="self-start md:self-center">
              <ProductSortSelect />
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        <ActiveFilterChips categories={categories} brands={allBrands} />

        {/* Layout: Sidebar + Product Grid */}
        <div className="flex items-start gap-6 lg:gap-8">
          {/* Desktop Filter Sidebar & Mobile Drawer Trigger */}
          <ProductFilterSidebar categories={categories} brands={allBrands} />

          {/* Product Grid Area */}
          <div className="flex-1 w-full min-w-0">
            {products.data.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-sm text-center">
                <EmptyState
                  icon={<Tag className="h-10 w-10 text-[#f47920]" />}
                  title="এই ব্র্যান্ডে কোনো পণ্য পাওয়া যায়নি"
                  description="শীঘ্রই এই ব্র্যান্ডের নতুন কালেকশন যুক্ত করা হবে। অনুগ্রহ করে অন্যান্য ব্র্যান্ড ব্রাউজ করুন।"
                  action={
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <Button
                        nativeButton={false}
                        render={<Link href="/brands" />}
                        variant="outline"
                        className="h-10"
                      >
                        সকল ব্র্যান্ড দেখুন
                      </Button>
                      <Button
                        nativeButton={false}
                        render={<Link href="/products" />}
                        className="h-10 bg-[#f47920] hover:bg-[#e56910] text-white"
                      >
                        সকল পণ্য ব্রাউজ করুন
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
