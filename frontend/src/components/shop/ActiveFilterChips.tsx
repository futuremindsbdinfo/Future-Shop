"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X, RotateCcw } from "lucide-react";
import type { Category, Brand } from "@/types";

interface ActiveFilterChipsProps {
  categories: Category[];
  brands: Brand[];
}

export function ActiveFilterChips({ categories, brands }: ActiveFilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategorySlug = searchParams.get("category");
  const currentBrandId = searchParams.get("brand_id");
  const currentSearch = searchParams.get("search");
  const currentSort = searchParams.get("sort");

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const clearAll = () => {
    router.push("/products");
  };

  const categoryObj = categories.find((c) => c.slug === currentCategorySlug);
  const brandObj = brands.find((b) => String(b.id) === currentBrandId);

  const hasAnyFilter = !!(currentCategorySlug || currentBrandId || currentSearch || (currentSort && currentSort !== "newest"));

  if (!hasAnyFilter) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 pt-1">
      <span className="text-xs text-gray-500 font-medium" lang="bn">
        সক্রিয় ফিল্টার:
      </span>

      {/* Category Chip */}
      {currentCategorySlug && (
        <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-[#f47920]/30 text-[#f47920] px-2.5 py-1 rounded-lg text-xs font-semibold">
          <span>ক্যাটাগরি: {categoryObj?.name || currentCategorySlug}</span>
          <button
            type="button"
            onClick={() => removeFilter("category")}
            className="hover:bg-[#f47920]/20 rounded p-0.5"
            aria-label="Remove category filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Brand Chip */}
      {currentBrandId && (
        <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-[#f47920]/30 text-[#f47920] px-2.5 py-1 rounded-lg text-xs font-semibold">
          <span>ব্র্যান্ড: {brandObj?.name || currentBrandId}</span>
          <button
            type="button"
            onClick={() => removeFilter("brand_id")}
            className="hover:bg-[#f47920]/20 rounded p-0.5"
            aria-label="Remove brand filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Search Term Chip */}
      {currentSearch && (
        <span className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-300 text-gray-800 px-2.5 py-1 rounded-lg text-xs font-semibold">
          <span>খোঁজ: &quot;{currentSearch}&quot;</span>
          <button
            type="button"
            onClick={() => removeFilter("search")}
            className="hover:bg-gray-200 rounded p-0.5"
            aria-label="Remove search filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Clear All Button */}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline ml-1"
        lang="bn"
      >
        <RotateCcw className="w-3 h-3" />
        <span>সব মুছুন</span>
      </button>
    </div>
  );
}
