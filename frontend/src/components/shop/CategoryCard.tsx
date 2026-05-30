import Image from "next/image";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center transition-all hover:border-[#1a6bdf] hover:shadow-md"
    >
      <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="64px"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <LayoutGrid className="h-7 w-7 text-[#1a6bdf]" />
        )}
      </div>
      <span className="line-clamp-2 text-sm font-medium group-hover:text-[#1a6bdf]">
        {category.name}
      </span>
    </Link>
  );
}
