"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, X, Check, Tag, Sparkles } from "lucide-react";
import type { Category, Brand } from "@/types";

interface ProductFilterSidebarProps {
  categories: Category[];
  brands: Brand[];
}

export function ProductFilterSidebar({ categories, brands }: ProductFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentBrandId = searchParams.get("brand_id") || "";
  const currentSort = searchParams.get("sort") || "";
  const currentSearch = searchParams.get("search") || "";

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 on filter change
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/products");
    setIsOpenMobile(false);
  };

  const hasActiveFilters = !!(currentCategory || currentBrandId || currentSearch || currentSort);

  const filterContent = (
    <div className="space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#f47920]" />
          <h3 className="font-bold text-gray-900 text-base" lang="bn">
            ফিল্টার (Filters)
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
            lang="bn"
          >
            <RotateCcw className="w-3 h-3" />
            <span>রিসেট করুন</span>
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5" lang="bn">
          <Sparkles className="w-3.5 h-3.5 text-[#f47920]" />
          ক্যাটাগরি
        </h4>
        <div className="space-y-1 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => {
              updateFilter("category", null);
              setIsOpenMobile(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              !currentCategory
                ? "bg-[#f47920] text-white shadow-sm"
                : "text-gray-700 hover:bg-orange-50 hover:text-[#f47920]"
            }`}
          >
            <span>সব ক্যাটাগরি</span>
            {!currentCategory && <Check className="w-3.5 h-3.5" />}
          </button>

          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  updateFilter("category", isSelected ? null : cat.slug);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-left ${
                  isSelected
                    ? "bg-[#f47920] text-white shadow-sm font-semibold"
                    : "text-gray-700 hover:bg-orange-50 hover:text-[#f47920]"
                }`}
              >
                <span className="line-clamp-1">{cat.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands Filter */}
      {brands.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5" lang="bn">
            <Tag className="w-3.5 h-3.5 text-[#f47920]" />
            ব্র্যান্ড
          </h4>
          <div className="space-y-1 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => {
                updateFilter("brand_id", null);
                setIsOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                !currentBrandId
                  ? "bg-[#f47920] text-white shadow-sm"
                  : "text-gray-700 hover:bg-orange-50 hover:text-[#f47920]"
              }`}
            >
              <span>সব ব্র্যান্ড</span>
              {!currentBrandId && <Check className="w-3.5 h-3.5" />}
            </button>

            {brands.map((b) => {
              const isSelected = currentBrandId === String(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    updateFilter("brand_id", isSelected ? null : String(b.id));
                    setIsOpenMobile(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-left ${
                    isSelected
                      ? "bg-[#f47920] text-white shadow-sm font-semibold"
                      : "text-gray-700 hover:bg-orange-50 hover:text-[#f47920]"
                  }`}
                >
                  <span className="line-clamp-1">{b.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Left Column) */}
      <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm sticky top-24">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Floating Filter Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setIsOpenMobile(true)}
          className="flex items-center gap-2 bg-[#f47920] hover:bg-[#d46212] text-white px-5 py-3 rounded-full shadow-xl font-bold text-sm transition-transform active:scale-95"
          lang="bn"
        >
          <Filter className="w-4 h-4" />
          <span>ফিল্টার ও ক্যাটাগরি</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Mobile Bottom Sheet / Drawer Modal */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpenMobile(false)}
          />

          {/* Drawer Body */}
          <div className="relative z-10 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2" lang="bn">
                <Filter className="w-5 h-5 text-[#f47920]" />
                ফিল্টার নির্বাচন করুন
              </h3>
              <button
                onClick={() => setIsOpenMobile(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 pb-6">{filterContent}</div>

            <div className="sticky bottom-0 pt-3 bg-white border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpenMobile(false)}
                className="w-full bg-[#f47920] hover:bg-[#d46212] text-white py-3 rounded-xl font-bold text-sm shadow-md"
                lang="bn"
              >
                ফলাফল দেখুন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
