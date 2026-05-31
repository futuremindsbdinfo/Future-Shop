import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { apiFetchSafe } from "@/lib/server-api";
import type { Product } from "@/types";

// SSR — render per request.
export const dynamic = "force-dynamic";

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
