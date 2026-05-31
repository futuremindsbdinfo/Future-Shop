"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ImageOff, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const TK = "৳";
const formatTk = (value: number) => `${TK}${value.toLocaleString("en-US")}`;

export function ProductDetail({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const price = Number(product.price);
  const salePrice = product.sale_price !== null ? Number(product.sale_price) : null;
  const hasSale = salePrice !== null && salePrice < price;
  const effectivePrice = hasSale && salePrice !== null ? salePrice : price;
  const discountPct =
    hasSale && salePrice !== null ? Math.round(((price - salePrice) / price) * 100) : 0;

  const outOfStock = product.status === "out_of_stock" || product.stock_quantity <= 0;
  const images = product.images ?? [];

  const changeQty = (delta: number) => {
    setQuantity((current) => {
      const next = current + delta;
      if (next < 1) return 1;
      if (next > product.stock_quantity) return product.stock_quantity;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      quantity,
      image: images[0]?.url,
      stock: product.stock_quantity,
    });
    toast.success("কার্টে যোগ হয়েছে", { description: product.name });
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Gallery */}
      <div className="relative overflow-hidden rounded-lg border bg-muted">
        {images.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="aspect-square w-full"
          >
            {images.map((image, index) => (
              <SwiperSlide key={image.path}>
                <div className="relative aspect-square w-full">
                  <Image
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-12 w-12" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col">
        {product.vendor && (
          <p className="text-sm text-muted-foreground">
            <span lang="bn">বিক্রেতা:</span> {product.vendor.shop_name}
          </p>
        )}

        <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl font-bold text-[#1a6bdf]">{formatTk(effectivePrice)}</span>
          {hasSale && (
            <span className="text-lg text-muted-foreground line-through">{formatTk(price)}</span>
          )}
          {discountPct > 0 && (
            <Badge className="bg-red-600 text-white hover:bg-red-600">-{discountPct}%</Badge>
          )}
        </div>

        <div className="mt-3" lang="bn">
          {outOfStock ? (
            <Badge variant="outline" className="border-red-300 text-red-600">স্টকে নেই</Badge>
          ) : (
            <Badge variant="outline" className="border-green-300 text-green-700">
              স্টকে আছে ({product.stock_quantity})
            </Badge>
          )}
        </div>

        {product.description && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold" lang="bn">বিবরণ</h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {product.description}
            </p>
          </div>
        )}

        {!outOfStock && (
          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-medium" lang="bn">পরিমাণ:</span>
            <div className="flex items-center rounded-md border">
              <Button variant="ghost" size="icon" onClick={() => changeQty(-1)} aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => changeQty(1)} aria-label="Increase">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={outOfStock}
          size="lg"
          className="mt-6 bg-[#1a6bdf] hover:bg-[#1559bd]"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          <span lang="bn">{outOfStock ? "স্টকে নেই" : "কার্টে যোগ করুন"}</span>
        </Button>
      </div>
    </div>
  );
}
