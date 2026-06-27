"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import type { PaginatedResponse, Product } from "@/types";

interface InfiniteProductGridProps {
  initialData: PaginatedResponse<Product>;
  queryParams: Record<string, string>;
}

export function InfiniteProductGrid({
  initialData,
  queryParams,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialData.data);
  const [page, setPage] = useState(initialData.current_page);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialData.current_page < initialData.last_page
  );
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchNextPage = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const sp = new URLSearchParams(queryParams);
      sp.set("page", String(nextPage));

      const res = await api.get<PaginatedResponse<Product>>(
        `/products?${sp.toString()}`
      );

      setProducts((prev) => {
        // Prevent duplicates in StrictMode or concurrent requests
        const existingIds = new Set(prev.map((p) => p.id));
        const newProducts = res.data.data.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });

      setPage(res.data.current_page);
      setHasMore(res.data.current_page < res.data.last_page);
    } catch (error) {
      console.error("Failed to fetch more products", error);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, queryParams]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "200px" } // Load a bit earlier before user scrolls to the very bottom
    );

    observer.observe(target);
    return () => {
      observer.unobserve(target);
    };
  }, [fetchNextPage, hasMore, loading]);

  return (
    <>
      <div className="product-grid grid gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="mt-8 flex justify-center py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span lang="bn" className="text-sm">
              লোড হচ্ছে...
            </span>
          </div>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="mt-8 flex justify-center py-4">
          <p lang="bn" className="text-sm text-muted-foreground">
            আর কোনো পণ্য নেই
          </p>
        </div>
      )}
    </>
  );
}
