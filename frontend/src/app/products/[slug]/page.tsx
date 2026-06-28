import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { apiFetchSafe } from "@/lib/server-api";
import type { Product } from "@/types";

// SSR — render per request.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  // Note: Since we use cache: "no-store", this fetch will run twice (once here, once in ProductPage).
  // In the future, this can be optimized using React cache() if the API layer supports it.
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

  return {
    title: `${product.name} | Future Shop`,
    description: cleanDescription,
    openGraph: {
      title: product.name,
      description: cleanDescription,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: cleanDescription,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const res = await apiFetchSafe<{ data: Product } | null>(`/products/${slug}`, null, {
    cache: "no-store",
  });

  if (!res) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ProductDetail product={res.data} />
    </div>
  );
}
