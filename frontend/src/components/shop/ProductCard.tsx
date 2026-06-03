"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";

const TK = "৳";

function formatTk(value: number): string {
  return `${TK}${value.toLocaleString("en-US")}`;
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const price = Number(product.price);
  const salePrice = product.sale_price !== null ? Number(product.sale_price) : null;
  const hasSale = salePrice !== null && salePrice < price;
  const effectivePrice = hasSale && salePrice !== null ? salePrice : price;
  const discountPct =
    hasSale && salePrice !== null ? Math.round(((price - salePrice) / price) * 100) : 0;

  const outOfStock = product.status === "out_of_stock" || product.stock_quantity <= 0;
  // images may be null, undefined, or empty array — handle all gracefully.
  const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : null;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      quantity: 1,
      image: imageUrl ?? undefined,
      stock: product.stock_quantity,
    });
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
        {discountPct > 0 && (
          <Badge className="absolute left-2 top-2 z-10 bg-red-600 text-white hover:bg-red-600">
            -{discountPct}%
          </Badge>
        )}

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded bg-white px-3 py-1 text-sm font-semibold text-gray-900">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        {product.vendor && (
          <p className="truncate text-xs text-muted-foreground">{product.vendor.shop_name}</p>
        )}

        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium hover:text-[#1a6bdf]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-[#1a6bdf]">{formatTk(effectivePrice)}</span>
          {hasSale && (
            <span className="text-sm text-muted-foreground line-through">{formatTk(price)}</span>
          )}
        </div>

        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="mt-3 h-11 w-full bg-[#1a6bdf] hover:bg-[#1559bd]"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {outOfStock ? "Unavailable" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
