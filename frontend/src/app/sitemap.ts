export const dynamic = "force-static";
import { MetadataRoute } from "next";
import { apiFetchSafe } from "@/lib/server-api";
import type { Product } from "@/types";

interface PaginatedProducts {
  data: Product[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Base pages
  const staticPages = [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/about`, lastModified: new Date() },
    { url: `${siteUrl}/contact`, lastModified: new Date() },
    { url: `${siteUrl}/terms`, lastModified: new Date() },
  ];

  // Fetch all active products
  const productRes = await apiFetchSafe<PaginatedProducts | null>(
    "/products?per_page=1000",
    null
  );

  const productPages =
    productRes?.data?.map((prod) => {
      const categorySlug = prod.category?.slug || "grocery";
      return {
        url: `${siteUrl}/products/${categorySlug}/${prod.slug}`,
        lastModified: new Date(prod.updated_at || new Date()),
      };
    }) || [];

  return [...staticPages, ...productPages];
}
