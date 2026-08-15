export const dynamic = "force-dynamic";
export const revalidate = 3600; // revalidate sitemap every hour

import { MetadataRoute } from "next";
import { apiFetchSafe } from "@/lib/server-api";
import type { Category, Product } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shop.fuminds.com";

  // Base / Static marketing & utility pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/returns`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  // Fetch active categories
  const categoriesRes = await apiFetchSafe<PaginatedResponse<Category> | { data: Category[] } | null>(
    "/categories",
    null
  );
  const categoryList: Category[] = Array.isArray(categoriesRes?.data) ? categoriesRes.data : [];
  const categoryPages: MetadataRoute.Sitemap = categoryList.map((cat) => ({
    url: `${siteUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Fetch all active products (up to 1000)
  const productRes = await apiFetchSafe<PaginatedResponse<Product> | null>(
    "/products?per_page=1000",
    null
  );

  const productPages: MetadataRoute.Sitemap =
    productRes?.data?.map((prod) => {
      const categorySlug = prod.category?.slug || "general";
      return {
        url: `${siteUrl}/products/${categorySlug}/${prod.slug}`,
        lastModified: new Date(prod.updated_at || new Date()),
        changeFrequency: "weekly",
        priority: 0.9,
      };
    }) || [];

  return [...staticPages, ...categoryPages, ...productPages];
}
