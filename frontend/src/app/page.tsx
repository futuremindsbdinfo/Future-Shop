import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { apiFetchSafe } from "@/lib/server-api";
import type { Category, PaginatedResponse, Product } from "@/types";

// SSG with ISR — regenerate at most once per 60 seconds.
export const revalidate = 60;

const EMPTY_PAGE: PaginatedResponse<Product> = {
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
  const [categoriesRes, productsRes] = await Promise.all([
    apiFetchSafe<{ data: Category[] }>("/categories", { data: [] }, { next: { revalidate: 60 } }),
    apiFetchSafe<PaginatedResponse<Product>>("/products?per_page=8", EMPTY_PAGE, {
      next: { revalidate: 60 },
    }),
  ]);

  const categories = categoriesRes.data;
  // Backend currently returns a fixed page size (15); cap to 8 for the homepage.
  const featured = productsRes.data.slice(0, 8);

  return (
    <>
      <HeroBanner />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured} />
    </>
  );
}
