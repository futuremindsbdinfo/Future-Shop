export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate sitemap every hour

import { MetadataRoute } from "next";
import { apiFetchSafe } from "@/lib/server-api";
import type { Category, Brand, Product, PaginatedResponse } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shop.fuminds.com";

  // 1. Base / Static marketing, legal & shop pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/returns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  // 2. Fetch all active categories
  const categoriesRes = await apiFetchSafe<{ data: Category[] } | null>(
    "/categories",
    null,
    { cache: "no-store" }
  );
  const categoryList: Category[] = Array.isArray(categoriesRes?.data) ? categoriesRes.data : [];
  const categoryPages: MetadataRoute.Sitemap = categoryList.map((cat) => ({
    url: `${siteUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // 3. Fetch all active brands
  const brandsRes = await apiFetchSafe<PaginatedResponse<Brand> | null>(
    "/brands?per_page=200",
    null,
    { cache: "no-store" }
  );
  const brandList: Brand[] = Array.isArray(brandsRes?.data) ? brandsRes.data : [];
  const brandPages: MetadataRoute.Sitemap = brandList.map((brand) => ({
    url: `${siteUrl}/brands/${brand.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  // 4. Fetch all active published products (up to 2000)
  const productRes = await apiFetchSafe<PaginatedResponse<Product> | null>(
    "/products?per_page=2000",
    null,
    { cache: "no-store" }
  );

  const productPages: MetadataRoute.Sitemap =
    productRes?.data?.map((prod) => {
      const categorySlug = prod.category?.slug || "general";
      return {
        url: `${siteUrl}/products/${categorySlug}/${prod.slug}`,
        lastModified: new Date(prod.updated_at || new Date()),
        changeFrequency: "daily",
        priority: 0.9,
      };
    }) || [];

  return [...staticPages, ...categoryPages, ...brandPages, ...productPages];
}
