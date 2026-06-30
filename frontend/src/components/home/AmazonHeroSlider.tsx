"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const DEMO_BANNERS = [
  {
    id: 1,
    gradient: "linear-gradient(135deg, #c05a10 0%, #f47920 40%, #fb923c 100%)",
    title: "আপনার বিশ্বস্ত অনলাইন শপ",
    subtitle: "সেরা মানের পণ্য, সবচেয়ে দ্রুত ডেলিভারি"
  },
  {
    id: 2,
    gradient: "linear-gradient(135deg, #f47920 0%, #fb923c 50%, #c05a10 100%)",
    title: "বগুড়া শেরপুরের সবচেয়ে বড় বাজার",
    subtitle: "ঘরে বসেই পেয়ে যান সব প্রয়োজনীয় জিনিস"
  },
  {
    id: 3,
    gradient: "linear-gradient(135deg, #fb923c 0%, #c05a10 50%, #f47920 100%)",
    title: "১০০% আসল পণ্য",
    subtitle: "যাচাইকৃত বিক্রেতাদের থেকে সেরা ডিল"
  }
];

export function AmazonHeroSlider() {
  return (
    <section className="relative w-full">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true, dynamicBullets: true }}
        loop={true}
        className="w-full [&_.swiper-button-prev]:text-white [&_.swiper-button-next]:text-white [&_.swiper-pagination-bullet]:bg-white"
      >
        {DEMO_BANNERS.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div 
              className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] flex flex-col items-center justify-center text-center px-4"
              style={{ background: banner.gradient }}
            >
              <h1 className="text-white text-3xl sm:text-5xl font-bold mb-4 drop-shadow-md">{banner.title}</h1>
              <p className="text-white/90 text-lg sm:text-xl drop-shadow">{banner.subtitle}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Gradient Overlay at the bottom to blend with background */}
      <div className="absolute bottom-0 left-0 w-full h-32 sm:h-64 bg-gradient-to-t from-[#e3e6e6] to-transparent z-10 pointer-events-none" />
    </section>
  );
}
