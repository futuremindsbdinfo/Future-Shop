import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section
      className="w-full text-white"
      style={{ background: "linear-gradient(135deg, #f47920 0%, #fb923c 50%, #fed7aa 100%)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:py-16 md:py-24">
        <h1 className="text-2xl font-bold leading-snug sm:text-3xl md:text-4xl lg:text-5xl" lang="bn">
          শেরপুর ও বগুড়ার সেরা পণ্য, দোরগোড়ায় পৌঁছে দিই
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-orange-50 sm:mt-4 sm:text-base md:text-lg" lang="bn">
          স্থানীয় বিক্রেতাদের পণ্য, দ্রুত ডেলিভারি
        </p>
        <Button
          size="lg"
          nativeButton={false}
          className="mt-6 h-11 bg-white px-6 text-[#f47920] hover:bg-blue-50 sm:mt-8"
          render={<Link href="/products" />}
        >
          <span lang="bn">এখনই কিনুন</span>
        </Button>
      </div>
    </section>
  );
}
