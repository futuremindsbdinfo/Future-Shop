import Link from "next/link";
import { CategoryCard } from "@/components/shop/CategoryCard";
import type { Category } from "@/types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 lang="bn" className="text-lg font-bold">
          ক্যাটাগরি
        </h2>
        <Link
          href="/categories"
          lang="bn"
          className="text-sm text-[#f47920] hover:underline"
        >
          সব দেখুন →
        </Link>
      </div>
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="w-28 flex-shrink-0 snap-start sm:w-32"
          >
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </section>
  );
}
