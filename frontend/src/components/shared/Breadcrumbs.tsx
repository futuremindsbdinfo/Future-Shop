import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  url?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: Props) {
  // JSON-LD BreadcrumbList Schema for Google Search
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": process.env.NEXT_PUBLIC_SITE_URL || "https://shop.fuminds.com",
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": item.url
          ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://shop.fuminds.com"}${item.url}`
          : undefined,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="flex pb-4 text-slate-500 text-[11px] md:text-xs">
        <ol className="inline-flex items-center space-x-1 select-none">
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="inline-flex items-center hover:text-[#f47920] transition-colors font-medium"
            >
              <Home className="mr-1 h-3.5 w-3.5 shrink-0" />
              <span>Home</span>
            </Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="inline-flex items-center">
                <ChevronRight className="h-3 w-3 text-slate-300 mx-1 shrink-0" aria-hidden="true" />
                {isLast || !item.url ? (
                  <span className="font-semibold text-slate-800 truncate max-w-[120px] md:max-w-xs">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="hover:text-[#f47920] transition-colors truncate max-w-[120px] md:max-w-xs font-medium"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
