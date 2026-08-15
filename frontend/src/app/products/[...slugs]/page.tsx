import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { apiFetchSafe } from "@/lib/server-api";
import type { Product } from "@/types";

// SSR — render per request.
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slugs: string[] }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slugs } = await params;
  const slug = slugs[slugs.length - 1];

  const res = await apiFetchSafe<{ data: Product } | null>(`/products/${slug}`, null, {
    cache: "no-store",
  });

  if (!res) {
    return {
      title: "Product Not Found | Future Shop",
      description: "The requested product could not be found.",
    };
  }

  const product = res.data;
  const cleanDescription = product.description
    ? product.description.replace(/<[^>]*>?/gm, "").trim().substring(0, 160)
    : `Buy ${product.name} at Future Shop`;

  const imageUrl = product.images?.[0]?.url || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shop.fuminds.com";
  const canonicalUrl = `${siteUrl}/products/${slugs.join("/")}`;

  return {
    title: `${product.name} | Future Shop`,
    description: cleanDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: product.name,
      description: cleanDescription,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: cleanDescription,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: RouteParams) {
  const { slugs } = await params;
  const slug = slugs[slugs.length - 1];

  const res = await apiFetchSafe<{ data: Product } | null>(`/products/${slug}`, null, {
    cache: "no-store",
  });

  if (!res) notFound();

  const product = res.data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shop.fuminds.com";
  const canonicalUrl = `${siteUrl}/products/${slugs.join("/")}`;

  const price = Number(product.price);
  const salePrice = product.sale_price !== null ? Number(product.sale_price) : null;
  const hasSale = salePrice !== null && salePrice < price;
  const effectivePrice = hasSale && salePrice !== null ? salePrice : price;
  const outOfStock = product.status === "out_of_stock" || product.stock_quantity <= 0;

  // JSON-LD Structured Data Schema for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.map((img) => img.url) || [],
    "description": product.description || `Buy ${product.name} at Future Shop`,
    "sku": product.sku || `FS-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": product.brand?.name || "Future Shop",
    },
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "BDT",
      "price": effectivePrice,
      "priceValidUntil": "2030-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "60",
          "currency": "BDT",
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "BD",
        },
      },
    },
  };

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <ProductDetail product={product} />
      </div>
    </>
  );
}
