import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryQuadCard } from "@/components/home/CategoryQuadCard";
import { HorizontalProductScroll } from "@/components/home/HorizontalProductScroll";
import { apiFetchSafe } from "@/lib/server-api";
import type { Brand, Category, PaginatedResponse, Product } from "@/types";

export const revalidate = 60;

const EMPTY_PRODUCT_PAGE: PaginatedResponse<Product> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 8,
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
  per_page: 8,
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
  const [categoriesRes, productsRes, brandsRes] = await Promise.all([
    apiFetchSafe<{ data: Category[] }>("/categories", { data: [] }, { next: { revalidate: 60 } }),
    apiFetchSafe<PaginatedResponse<Product>>("/products?per_page=15", EMPTY_PRODUCT_PAGE, {
      next: { revalidate: 60 },
    }),
    apiFetchSafe<PaginatedResponse<Brand>>("/brands?per_page=10", EMPTY_BRAND_PAGE, {
      cache: "no-store",
    }),
  ]);

  const categories = categoriesRes.data;
  const featured = productsRes.data;
  const brands = brandsRes.data ?? [];

  // Fetch products for a larger batch to find active categories
  const allTopCategories = categories.slice(0, 15);
  const categoryProductsRes = await Promise.all(
    allTopCategories.map((cat) =>
      apiFetchSafe<PaginatedResponse<Product>>(
        `/products?category=${cat.slug}&per_page=10`,
        EMPTY_PRODUCT_PAGE,
        { next: { revalidate: 60 } }
      )
    )
  );

  // Filter only categories that actually have products
  const validCategories: Category[] = [];
  const validProductsRes: Product[][] = [];
  
  for (let i = 0; i < allTopCategories.length; i++) {
    if (categoryProductsRes[i].data.length > 0) {
      validCategories.push(allTopCategories[i]);
      validProductsRes.push(categoryProductsRes[i].data);
    }
  }

  return (
    <div className="bg-[#e3e6e6] min-h-screen pb-10">
      <HeroBanner />
      
      {/* Main Content Area */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 relative z-20 mt-6 md:mt-8">
        
        {/* ROW 1: Quad Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {validCategories.slice(0, 4).map((cat, idx) => (
            <CategoryQuadCard
              key={cat.id}
              title={cat.name}
              categorySlug={cat.slug}
              products={validProductsRes[idx]}
            />
          ))}
        </div>

        {/* ROW 2: Horizontal Scroll */}
        {validCategories.length > 4 && validProductsRes[4] && validProductsRes[4].length > 0 && (
          <HorizontalProductScroll 
            title={`Best Sellers in ${validCategories[4].name}`}
            products={validProductsRes[4]}
            viewAllLink={`/category/${validCategories[4].slug}`}
          />
        )}

        {/* ROW 3: Quad Cards */}
        {validCategories.length > 5 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {validCategories.slice(5, 9).map((cat, idx) => (
              <CategoryQuadCard
                key={cat.id}
                title={cat.name}
                categorySlug={cat.slug}
                products={validProductsRes[idx + 5]}
              />
            ))}
          </div>
        )}

        {/* ROW 4: Featured Horizontal Scroll */}
        {featured.length > 0 && (
          <HorizontalProductScroll 
            title="Top picks for Bangladesh"
            products={featured}
            viewAllLink="/products"
          />
        )}

        {/* Brands Section */}
        {brands.length > 0 && (
          <div className="bg-white p-4 relative z-20 w-full overflow-hidden mt-6">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-[21px] font-bold text-[#0F1111]">Top Brands</h2>
              <Link href="/brands" className="text-[14px] font-semibold text-[#007185] hover:text-[#C7511F] hover:underline">
                See all brands
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="flex flex-col items-center gap-2 flex-shrink-0 w-[120px] group"
                >
                  <div className="relative w-full aspect-square bg-[#F7F7F7] rounded-full overflow-hidden border border-gray-200 group-hover:border-[#f47920] p-2">
                    {brand.logo?.url ? (
                      <Image
                        src={brand.logo.url}
                        alt={brand.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Tag className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-[14px] text-[#0F1111] font-medium text-center line-clamp-1 group-hover:text-[#c45500]">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
