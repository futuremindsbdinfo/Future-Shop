"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

export function ProductSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val && val !== "newest") {
      params.set("sort", val);
    } else {
      params.delete("sort");
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 shadow-xs">
      <ArrowUpDown className="w-3.5 h-3.5 text-[#f47920]" />
      <span className="text-gray-500 whitespace-nowrap" lang="bn">
        সাজান:
      </span>
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer pr-2"
        lang="bn"
      >
        <option value="newest">নতুন কালেকশন</option>
        <option value="price_asc">দাম: কম থেকে বেশি</option>
        <option value="price_desc">দাম: বেশি থেকে কম</option>
        <option value="popular">সর্বাধিক জনপ্রিয়</option>
      </select>
    </div>
  );
}
