import Link from "next/link";
import { CreditCard, Shield, ShoppingBag, Truck } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Truck, label: "দ্রুত ডেলিভারি", sub: "শেরপুর ও বগুড়া" },
  { icon: CreditCard, label: "ক্যাশ অন ডেলিভারি", sub: "নিরাপদ পেমেন্ট" },
  { icon: Shield, label: "১০০% আসল পণ্য", sub: "যাচাইকৃত বিক্রেতা" },
  { icon: ShoppingBag, label: "৩,০০০+ পণ্য", sub: "সব ক্যাটাগরি" },
];

export function HeroBanner() {
  return (
    <section>
      {/* Main hero */}
      <div
        className="relative mx-4 my-4 overflow-hidden rounded-2xl sm:mx-0 sm:my-0 sm:rounded-none"
        style={{
          background:
            "linear-gradient(135deg, #c05a10 0%, #f47920 40%, #fb923c 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 md:py-16">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <span
              lang="bn"
              className="mb-4 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white"
            >
              🛒 শেরপুর ও বগুড়ার সেরা অনলাইন বাজার
            </span>
            {/* Headline */}
            <h1
              lang="bn"
              className="mb-3 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
            >
              বাজারে নয়,
              <br />
              বাজার আসবে
              <br />
              আপনার ঘরে।
            </h1>
            {/* Sub */}
            <p
              lang="bn"
              className="mb-6 text-sm text-white/90 sm:text-base"
            >
              স্থানীয় বিক্রেতাদের সেরা পণ্য, দ্রুত ডেলিভারি
            </p>
            {/* CTA */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#f47920] transition-colors hover:bg-orange-50 sm:text-base"
            >
              <ShoppingBag className="h-4 w-4" />
              <span lang="bn">এখনই কিনুন</span>
            </Link>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
      </div>

      {/* Trust badges ribbon */}
      <div className="border-y border-orange-100 bg-[#fff7ed]">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#f47920]/10">
                  <Icon className="h-4 w-4 text-[#f47920]" />
                </div>
                <div>
                  <p
                    lang="bn"
                    className="text-xs font-semibold leading-tight text-gray-800"
                  >
                    {label}
                  </p>
                  <p
                    lang="bn"
                    className="text-[10px] text-muted-foreground"
                  >
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
