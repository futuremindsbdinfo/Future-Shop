import type { Metadata } from "next";
import Link from "next/link";
import { Grid, Sparkles } from "lucide-react";
import { CategoryCard } from "@/components/shop/CategoryCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { apiFetchSafe } from "@/lib/server-api";
import type { Category } from "@/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "সকল ক্যাটাগরি | Future Shop — শেরপুর, বগুড়া",
  description:
    "Future Shop-এর সকল ক্যাটাগরি থেকে সহজে আপনার প্রয়োজনীয় পণ্য খুঁজে নিন। মুদি, নিত্যপ্রয়োজনীয় পণ্য, শিশু যত্ন এবং আরও অনেক কিছু।",
};

export default async function CategoriesPage() {
  const categoriesRes = await apiFetchSafe<{ data: Category[] }>(
    "/categories",
    { data: [] },
    { next: { revalidate: 60 } }
  );

  const categories = categoriesRes.data ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f47920]/10 text-[#f47920] text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>অনলাইন শপিং ক্যাটাগরি</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight" lang="bn">
          সকল ক্যাটাগরি (All Categories)
        </h1>
        <p className="text-sm md:text-base text-muted-foreground" lang="bn">
          আপনার প্রয়োজনীয় পণ্য সহজে খুঁজে পেতে নিচের যেকোনো ক্যাটাগরিতে ক্লিক করুন ({categories.length}টি ক্যাটাগরি উপলব্ধ)
        </p>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<Grid className="h-8 w-8 text-[#f47920]" />}
          title="কোনো ক্যাটাগরি পাওয়া যায়নি"
          description="শীঘ্রই নতুন ক্যাটাগরি যুক্ত করা হবে।"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </main>
  );
}
