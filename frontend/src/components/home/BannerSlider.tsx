"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import type { Banner } from "@/types";
import "swiper/css";
import "swiper/css/pagination";

export function BannerSlider({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={banners.length > 1}
        className="overflow-hidden rounded-lg"
      >
        {banners.map((banner) => {
          const slide = (
            <div className="relative aspect-[16/7] w-full sm:aspect-[16/5]">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
                priority
              />
            </div>
          );
          return (
            <SwiperSlide key={banner.id}>
              {banner.link_url ? (
                <a href={banner.link_url} aria-label={banner.title}>
                  {slide}
                </a>
              ) : (
                slide
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
