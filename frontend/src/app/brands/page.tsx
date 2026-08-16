"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tag, Search, Sparkles, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import api from "@/lib/api";
import type { Brand } from "@/types";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    api
      .get<{ data: Brand[] }>("/brands?per_page=100")
      .then((res) => {
        if (isMounted) {
          setBrands(res.data.data ?? []);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch brands:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBrands = brands.filter((brand) =>
    (brand.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 md:py-10 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: "সকল ব্র্যান্ড" }]} />

      {/* Header & Live Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#f47920]/10 text-[#f47920] text-xs font-bold">
            <Sparkles className="h-3 w-3" />
            <span>অফিসিয়াল ব্র্যান্ডসমূহ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight" lang="bn">
            সকল জনপ্রিয় ব্র্যান্ডসমূহ (Top Brands)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground" lang="bn">
            আপনার পছন্দের ব্র্যান্ডের বিশ্বস্ত ও আসল পণ্য সহজে খুঁজে নিন {!loading && `(মোট ${brands.length}টি ব্র্যান্ড)`}
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ব্র্যান্ডের নাম খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm outline-none focus:border-[#f47920] shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* Brands Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#f47920]" />
          <p className="text-sm text-muted-foreground font-medium" lang="bn">
            ব্র্যান্ড তালিকা লোড হচ্ছে...
          </p>
        </div>
      ) : filteredBrands.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-8 w-8 text-[#f47920]" />}
          title={searchQuery ? `"${searchQuery}" নামে কোনো ব্র্যান্ড পাওয়া যায়নি` : "কোনো ব্র্যান্ড পাওয়া যায়নি"}
          description="অন্য কোনো বানান দিয়ে অনুসন্ধান করে দেখুন।"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
          {filteredBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-xs transition-all hover:border-[#f47920] hover:shadow-md hover:bg-orange-50/30"
            >
              {/* Logo Container */}
              <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-[#F8F9FA] p-2.5 transition-transform group-hover:scale-105">
                {brand.logo?.url ? (
                  <Image
                    src={brand.logo.url}
                    alt={brand.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                ) : (
                  <Tag className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Brand Name */}
              <h2 className="line-clamp-1 text-xs sm:text-sm font-bold text-gray-800 transition-colors group-hover:text-[#f47920]">
                {brand.name}
              </h2>

              {/* Product count if present */}
              {brand.products_count !== undefined && (
                <p className="mt-1 text-[11px] font-medium text-gray-500" lang="bn">
                  {brand.products_count}টি পণ্য
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
