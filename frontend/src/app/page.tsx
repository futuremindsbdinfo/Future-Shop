import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { BannerSlider } from "@/components/home/BannerSlider";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { apiFetchSafe } from "@/lib/server-api";
import type {
  Banner,
  Brand,
  Category,
  PaginatedResponse,
  Product,
} from "@/types";

// SSG with ISR — regenerate at most once per 60 seconds.
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
  // Resilient: if the backend is unreachable (e.g. at build time), fall back to empty.
  const [categoriesRes, productsRes, bannersRes, brandsRes] = await Promise.all([
    apiFetchSafe<{ data: Category[] }>("/categories", { data: [] }, { next: { revalidate: 60 } }),
    apiFetchSafe<PaginatedResponse<Product>>("/products?per_page=8", EMPTY_PRODUCT_PAGE, {
      next: { revalidate: 60 },
    }),
    apiFetchSafe<{ data: Banner[] }>("/banners", { data: [] }, {
      next: { revalidate: 3600, tags: ["banners"] },
    }),
    apiFetchSafe<PaginatedResponse<Brand>>("/brands?per_page=8", EMPTY_BRAND_PAGE, {
      cache: "no-store",
    }),
  ]);

  const categories = categoriesRes.data;
  // Backend currently returns a fixed page size (15); cap to 8 for the homepage.
  const featured = productsRes.data.slice(0, 8);
  const brands = brandsRes.data ?? [];

  return (
    <>
      <BannerSlider banners={bannersRes.data} />
      <HeroBanner />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured} />

      {brands.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 lang="bn" className="text-lg font-bold">
              শীর্ষ ব্র্যান্ড
            </h2>
            <Link
              href="/brands"
              lang="bn"
              className="text-sm text-[#f47920] hover:underline"
            >
              সব ব্র্যান্ড →
            </Link>
          </div>
          <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="flex w-24 flex-shrink-0 flex-col items-center gap-2 rounded-xl border border-[#f1f5f9] p-3 transition-all hover:border-[#f47920] hover:bg-orange-50"
              >
                {brand.logo?.url ? (
                  <Image
                    src={brand.logo.url}
                    alt={brand.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <span className="line-clamp-1 w-full text-center text-xs font-medium">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
