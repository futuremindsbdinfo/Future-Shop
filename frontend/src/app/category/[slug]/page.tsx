import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageOpen, Sparkles, Layers } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { InfiniteProductGrid } from "@/components/shop/InfiniteProductGrid";
import { ProductSortSelect } from "@/components/shop/ProductSortSelect";
import { ProductFilterSidebar } from "@/components/shop/ProductFilterSidebar";
import { ActiveFilterChips } from "@/components/shop/ActiveFilterChips";
import { resolveCategoryIcon } from "@/components/shop/CategoryCard";
import { apiFetchSafe } from "@/lib/server-api";
import type { Category, Brand, PaginatedResponse, Product } from "@/types";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; brand_id?: string; sort?: string; search?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categoryRes = await apiFetchSafe<{ data: Category } | null>(`/categories/${slug}`, null, {
    cache: "no-store",
  });

  if (!categoryRes) {
    return {
      title: "ক্যাটাগরি পাওয়া যায়নি | Future Shop",
      description: "অনুরোধকৃত ক্যাটাগরিটি খুঁজে পাওয়া যায়নি।",
    };
  }

  const category = categoryRes.data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shop.fuminds.com";
  const canonicalUrl = `${siteUrl}/category/${slug}`;

  return {
    title: `${category.name} | Future Shop — শেরপুর, বগুড়া`,
    description: `${category.name} ক্যাটাগরির সেরা পণ্যসমূহ আকর্ষণীয় মূল্যে কিনুন Future Shop-এ। ক্যাশ অন ডেলিভারি এবং দ্রুততম হোম ডেলিভারি শেরপুর, বগুড়া।`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${category.name} | Future Shop`,
      description: `${category.name} ক্যাটাগরির সব আসল পণ্য কিনুন সেরা মূল্যে।`,
      url: canonicalUrl,
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

const EMPTY_BRANDS_PAGE: PaginatedResponse<Brand> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 50,
  total: 0,
  from: null,
  to: null,
  first_page_url: "",
  last_page_url: "",
  next_page_url: null,
  prev_page_url: null,
  path: "",
};

export default async function CategoryPage({ params, searchParams }: RouteParams) {
  const { slug } = await params;
  const sp = await searchParams;
  const pageNum = Math.max(1, Number(sp.page) || 1);

  // 1. Fetch current category details
  const categoryRes = await apiFetchSafe<{ data: Category } | null>(
    `/categories/${slug}`,
    null,
    { cache: "no-store" }
  );

  if (!categoryRes) notFound();
  const category = categoryRes.data;

  // 2. Build product query
  const query = new URLSearchParams({
    category: slug,
    page: String(pageNum),
  });
  if (sp.brand_id && /^\d+$/.test(sp.brand_id)) query.set("brand_id", sp.brand_id);
  if (sp.sort) query.set("sort", sp.sort);
  if (sp.search) query.set("search", sp.search);

  // 3. Fetch products, all categories, and brands in parallel
  const [productsRes, allCategoriesRes, brandsRes] = await Promise.all([
    apiFetchSafe<PaginatedResponse<Product>>(
      `/products?${query.toString()}`,
      EMPTY_PAGE,
      { cache: "no-store" }
    ),
    apiFetchSafe<{ data: Category[] }>("/categories", { data: [] }, { next: { revalidate: 60 } }),
    apiFetchSafe<PaginatedResponse<Brand>>("/brands?per_page=50", EMPTY_BRANDS_PAGE, {
      next: { revalidate: 60 },
    }),
  ]);

  const products = productsRes;
  const allCategories = allCategoriesRes.data ?? [];
  const brands = brandsRes.data ?? [];

  // Active query parameters passed to client infinite grid
  const queryParams: Record<string, string> = { category: slug };
  if (sp.brand_id) queryParams.brand_id = sp.brand_id;
  if (sp.sort) queryParams.sort = sp.sort;
  if (sp.search) queryParams.search = sp.search;

  const icon = resolveCategoryIcon(category);
  const subcategories = category.children ?? [];

  return (
    <main className="min-h-screen bg-[#f8fafc] py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "সকল ক্যাটাগরি", url: "/categories" },
            { label: category.name },
          ]}
        />

        {/* Category Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-orange-50/40 to-white border border-gray-100 p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f47920] to-[#d46212] text-white shadow-md">
                <FontAwesomeIcon icon={icon} className="text-2xl md:text-3xl" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#f47920]/10 text-[#f47920] text-xs font-bold">
                  <Sparkles className="h-3 w-3" />
                  <span>ক্যাটাগরি শপ</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight" lang="bn">
                  {category.name}
                </h1>
                <p className="text-xs md:text-sm font-medium text-muted-foreground" lang="bn">
                  এই ক্যাটাগরিতে মোট <span className="text-gray-900 font-bold">{products.total}</span>টি পণ্য পাওয়া গেছে
                </p>
              </div>
            </div>

            {/* Sort selector */}
            <div className="self-start md:self-center">
              <ProductSortSelect />
            </div>
          </div>

          {/* Subcategories Strip (if any children exist) */}
          {subcategories.length > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-100/80">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-700" lang="bn">
                <Layers className="w-3.5 h-3.5 text-[#f47920]" />
                <span>সাব-ক্যাটাগরি সমূহ:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/category/${sub.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#f47920] hover:text-[#f47920] hover:bg-orange-50/50 shadow-2xs transition-all"
                  >
                    <span>{sub.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Badges */}
        <ActiveFilterChips categories={allCategories} brands={brands} />

        {/* Layout: Sidebar + Product Grid */}
        <div className="flex items-start gap-6 lg:gap-8">
          {/* Desktop Filter Sidebar & Mobile Drawer Trigger */}
          <ProductFilterSidebar categories={allCategories} brands={brands} />

          {/* Product Grid Area */}
          <div className="flex-1 w-full min-w-0">
            {products.data.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-sm text-center">
                <EmptyState
                  icon={<PackageOpen className="h-10 w-10 text-[#f47920]" />}
                  title="এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি"
                  description="শীঘ্রই বিক্রেতারা এই ক্যাটাগরিতে নতুন পণ্য যুক্ত করবেন। অনুগ্রহ করে অন্যান্য ক্যাটাগরি ব্রাউজ করুন।"
                  action={
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <Button
                        nativeButton={false}
                        render={<Link href="/categories" />}
                        variant="outline"
                        className="h-10"
                      >
                        অন্যান্য ক্যাটাগরি
                      </Button>
                      <Button
                        nativeButton={false}
                        render={<Link href="/products" />}
                        className="h-10 bg-[#f47920] hover:bg-[#e56910] text-white"
                      >
                        সকল পণ্য দেখুন
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
