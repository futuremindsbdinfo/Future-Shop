"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Pagination, Thumbs } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper/types";
import { Minus, Plus, ShoppingBag, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import type { Product, ProductImage } from "@/types";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/free-mode";

const TK = "৳";
const formatTk = (value: number) => `${TK}${value.toLocaleString("en-US")}`;

export function ProductDetail({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);

  const price = Number(product.price);
  const salePrice = product.sale_price !== null ? Number(product.sale_price) : null;
  const hasSale = salePrice !== null && salePrice < price;
  const effectivePrice = hasSale && salePrice !== null ? salePrice : price;
  const discountPct =
    hasSale && salePrice !== null ? Math.round(((price - salePrice) / price) * 100) : 0;

  const outOfStock = product.status === "out_of_stock" || product.stock_quantity <= 0;
  // Treat null / undefined / empty as "no images". Also drop external SVGs
  // (XSS risk) — our own uploads are only jpg/png/webp anyway.
  const isExternalSvg = (img: ProductImage) =>
    img.disk === "external" && /\.svg(\?|#|$)/i.test(img.url);
  const images = (product.images ?? []).filter((img) => img && img.url && !isExternalSvg(img));
  const hasImages = images.length > 0;
  const isGallery = images.length > 1;

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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
      {/* Gallery */}
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-lg border bg-muted">
          {!hasImages ? (
            // No image placeholder
            <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ShoppingBag className="h-12 w-12" />
              <span className="text-sm">No image</span>
            </div>
          ) : !isGallery ? (
            // Single image
            <div className="relative aspect-square w-full">
              <Image
                src={images[0].url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
                priority
                unoptimized={images[0].disk === "external"}
              />
            </div>
          ) : (
            // Multiple images: main swiper linked to thumbnails below
            <Swiper
              modules={[Navigation, Pagination, Thumbs]}
              navigation
              pagination={{ clickable: true }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              spaceBetween={10}
              className="aspect-square w-full"
            >
              {images.map((image, index) => (
                <SwiperSlide key={image.path ?? image.url}>
                  <div className="relative aspect-square w-full">
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                      priority={index === 0}
                      unoptimized={image.disk === "external"}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Thumbnails — only when there's more than one image */}
        {isGallery && (
          <Swiper
            modules={[FreeMode, Thumbs]}
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView={4}
            freeMode
            watchSlidesProgress
            breakpoints={{
              640: { slidesPerView: 5 },
              768: { slidesPerView: 6 },
            }}
            className="w-full"
          >
            {images.map((image, index) => (
              <SwiperSlide key={image.path ?? image.url} className="cursor-pointer">
                <div className="relative aspect-square overflow-hidden rounded-md border-2 border-transparent ring-offset-2 [.swiper-slide-thumb-active_&]:border-[#f47920]">
                  <Image
                    src={image.url}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized={image.disk === "external"}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col">
        {product.vendor && (
          <p className="text-sm text-muted-foreground">
            <span lang="bn">বিক্রেতা:</span> {product.vendor.shop_name}
          </p>
        )}

        <h1 className="mt-1 text-xl font-bold sm:text-2xl">{product.name}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-2xl font-bold text-[#f47920] sm:text-3xl">{formatTk(effectivePrice)}</span>
          {hasSale && (
            <span className="text-base text-muted-foreground line-through sm:text-lg">{formatTk(price)}</span>
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

        {product.attributes && product.attributes.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold" lang="bn">আরও তথ্য</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {product.attributes.map((attr, index) => (
                <div
                  key={index}
                  className="flex justify-between gap-3 border-b border-dashed py-1 text-sm"
                >
                  <dt className="text-muted-foreground">{attr.title}</dt>
                  <dd className="text-right font-medium">{attr.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {!outOfStock && (
          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-medium" lang="bn">পরিমাণ:</span>
            <div className="flex items-center rounded-md border">
              <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => changeQty(-1)} aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => changeQty(1)} aria-label="Increase">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={outOfStock}
          size="lg"
          className="mt-6 h-12 bg-[#f47920] hover:bg-[#e56910]"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          <span lang="bn">{outOfStock ? "স্টকে নেই" : "কার্টে যোগ করুন"}</span>
        </Button>
      </div>
    </div>
  );
}
