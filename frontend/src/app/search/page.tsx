"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Category, PaginatedResponse, Product } from "@/types";

function SearchContent() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Category[] }>("/categories").then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const sp = new URLSearchParams({ per_page: "20" });
    if (q) sp.set("search", q);
    if (activeCategory) sp.set("category", activeCategory);
    api
      .get<PaginatedResponse<Product>>(`/products?${sp.toString()}`)
      .then((r) => {
        setProducts(r.data.data);
        setTotal(r.data.total);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [q, activeCategory]);

  useEffect(() => {
    const t = setTimeout(() => load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-xl font-bold sm:text-2xl">
        <span lang="bn">অনুসন্ধান</span>
        {q && <span className="text-muted-foreground">: “{q}”</span>}
      </h1>
      {!loading && (
        <p className="mt-1 text-sm text-muted-foreground">
          {total} <span lang="bn">টি ফলাফল</span>
        </p>
      )}

      <div className="mt-4 grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Category filter — horizontal chips on mobile, sidebar on md+ */}
        <aside className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
          <button
            onClick={() => setActiveCategory("")}
            className={cn(
              "shrink-0 rounded-full border px-3 py-2 text-sm md:rounded-md md:text-left",
              activeCategory === "" ? "border-[#f47920] bg-[#f47920] text-white" : "hover:bg-muted",
            )}
          >
            <span lang="bn">সব</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.slug)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-3 py-2 text-sm md:rounded-md md:text-left",
                activeCategory === c.slug ? "border-[#f47920] bg-[#f47920] text-white" : "hover:bg-muted",
              )}
            >
              {c.name}
            </button>
          ))}
        </aside>

        {/* Results */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-7 w-7" />}
              title="কোনো পণ্য পাওয়া যায়নি"
              description="অন্য কিছু খুঁজে দেখুন।"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-6">Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
