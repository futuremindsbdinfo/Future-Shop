import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { BannerSlider } from "@/components/home/BannerSlider";
import { CategoryQuadCard } from "@/components/home/CategoryQuadCard";
import { HorizontalProductScroll } from "@/components/home/HorizontalProductScroll";
import { HorizontalBrandScroll } from "@/components/home/HorizontalBrandScroll";
import { CategoryCard } from "@/components/shop/CategoryCard";
import { apiFetchSafe } from "@/lib/server-api";
import type { Banner, Brand, Category, PaginatedResponse, Product } from "@/types";

export const revalidate = 60;

const EMPTY_PRODUCT_PAGE: PaginatedResponse<Product> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
  from: null,
  to: null,
  first_page_url: "",
  last_page_url: "",
  next_page_url: null,
  prev_page_url: null,
  path: "",
};

const EMPTY_BRAND_PAGE: PaginatedResponse<Brand> = {
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

export default async function HomePage() {
  // 1. Fetch core homepage resources in parallel
  const [categoriesRes, productsRes, brandsRes, bannersRes] = await Promise.all([
    apiFetchSafe<{ data: Category[] }>("/categories", { data: [] }, { next: { revalidate: 60 } }),
    apiFetchSafe<PaginatedResponse<Product>>("/products?per_page=24", EMPTY_PRODUCT_PAGE, {
      next: { revalidate: 60 },
    }),
    apiFetchSafe<PaginatedResponse<Brand>>("/brands?per_page=15", EMPTY_BRAND_PAGE, {
      next: { revalidate: 60 },
    }),
    apiFetchSafe<{ data: Banner[] }>("/banners", { data: [] }, { next: { revalidate: 60 } }),
  ]);

  const categories = categoriesRes.data ?? [];
  const featured = productsRes.data ?? [];
  const brands = brandsRes.data ?? [];
  const banners = bannersRes.data ?? [];

  // 2. Fetch products for candidate categories to ensure 4 full quad cards
  const candidateCategories = categories.slice(0, 10);
  const quadCategoryProductsRes = await Promise.all(
    candidateCategories.map((cat) =>
      apiFetchSafe<PaginatedResponse<Product>>(
        `/products?category=${cat.slug}&per_page=4`,
        EMPTY_PRODUCT_PAGE,
        { next: { revalidate: 60 } }
      )
    )
  );

  const quadCategoriesWithProducts = candidateCategories
    .map((cat, idx) => ({
      category: cat,
      products: quadCategoryProductsRes[idx].data ?? [],
    }))
    .filter((item) => item.products.length > 0)
    .slice(0, 4);

  // Best seller / Featured slice
  const bestSellers = featured.slice(0, 12);
  const newArrivals = featured.slice(12, 24);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16">
      {/* Dynamic Admin Banners or Fallback Hero */}
      {banners.length > 0 ? (
        <div className="space-y-4">
          <BannerSlider banners={banners} />
          {/* Trust badges ribbon */}
          <div className="border-y border-orange-100 bg-[#fff7ed] mt-4">
            <div className="mx-auto max-w-7xl px-4 py-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#f47920]/10 text-[#f47920]">
                    🚚
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight text-gray-800" lang="bn">দ্রুত ডেলিভারি</p>
                    <p className="text-[10px] text-muted-foreground" lang="bn">শেরপুর, বগুড়া</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#f47920]/10 text-[#f47920]">
                    💵
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight text-gray-800" lang="bn">ক্যাশ অন ডেলিভারি</p>
                    <p className="text-[10px] text-muted-foreground" lang="bn">পণ্য পেয়ে মূল্য দিন</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#f47920]/10 text-[#f47920]">
                    🛡️
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight text-gray-800" lang="bn">১০০% আসল পণ্য</p>
                    <p className="text-[10px] text-muted-foreground" lang="bn">যাচাইকৃত বিক্রেতা</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#f47920]/10 text-[#f47920]">
                    🛍️
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight text-gray-800" lang="bn">সেরা অফার ও মূল্য</p>
                    <p className="text-[10px] text-muted-foreground" lang="bn">ন্যায্য দামে কেনাকাটা</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <HeroBanner />
      )}

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 relative z-20 mt-6 md:mt-8 space-y-8">
        
        {/* Quick Category Icons Strip */}
        {categories.length > 0 && (
          <section className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2" lang="bn">
                <Sparkles className="w-4 h-4 text-[#f47920]" />
                ক্যাটাগরি ব্রাউজ করুন
              </h2>
              <Link
                href="/categories"
                className="text-xs md:text-sm font-semibold text-[#f47920] hover:text-[#d46212] flex items-center gap-1"
                lang="bn"
              >
                <span>সব ক্যাটাগরি</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory">
              {categories.slice(0, 12).map((category) => (
                <div key={category.id} className="w-24 sm:w-28 flex-shrink-0 snap-start">
                  <CategoryCard category={category} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ROW 1: Category Quad Cards */}
        {quadCategoriesWithProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {quadCategoriesWithProducts.map(({ category, products }) => (
              <CategoryQuadCard
                key={category.id}
                title={category.name}
                categorySlug={category.slug}
                products={products}
              />
            ))}
          </div>
        )}

        {/* ROW 2: Best Sellers / Featured Horizontal Scroll */}
        {bestSellers.length > 0 && (
          <HorizontalProductScroll 
            title="জনপ্রিয় ও সেরা বিক্রিত পণ্য"
            products={bestSellers}
            viewAllLink="/products"
          />
        )}

        {/* ROW 3: New Arrivals Horizontal Scroll (if enough products) */}
        {newArrivals.length > 0 && (
          <HorizontalProductScroll 
            title="নতুন কালেকশন ও স্পেশাল ডিল"
            products={newArrivals}
            viewAllLink="/products"
          />
        )}

        {/* Brands Section */}
        {brands.length > 0 && (
          <HorizontalBrandScroll brands={brands} />
        )}
      </div>
    </div>
  );
}
