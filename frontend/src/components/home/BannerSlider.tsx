"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import type { Banner } from "@/types";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export function BannerSlider({ banners }: { banners: Banner[] }) {
  if (!banners || banners.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-4 sm:px-6 pt-4 sm:pt-6">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={banners.length > 1}
        loop={banners.length > 1}
        className="overflow-hidden rounded-2xl shadow-sm [&_.swiper-button-prev]:text-white [&_.swiper-button-next]:text-white [&_.swiper-button-prev]:h-8 [&_.swiper-button-prev]:w-8 [&_.swiper-button-next]:h-8 [&_.swiper-button-next]:w-8 [&_.swiper-pagination-bullet-active]:bg-[#f47920]"
      >
        {banners.map((banner) => {
          const slide = (
            <div className="relative aspect-[21/9] sm:aspect-[24/9] md:aspect-[28/9] w-full min-h-[160px] sm:min-h-[220px] md:min-h-[280px]">
              <Image
                src={banner.image}
                alt={banner.title || "Future Shop Banner"}
                fill
                sizes="(max-width: 768px) 100vw, 1500px"
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          );
          return (
            <SwiperSlide key={banner.id}>
              {banner.link_url ? (
                <Link href={banner.link_url} aria-label={banner.title || "Banner"}>
                  {slide}
                </Link>
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
