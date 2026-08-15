import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে | Future Shop",
  description:
    "Future Shop — শেরপুর ও বগুড়ার অনলাইন বাজার। আমাদের লক্ষ্য, ভিশন ও গ্রাহকদের প্রতি আমাদের অঙ্গীকার জানুন।",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f47920]/10 text-[#f47920] text-xs md:text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>Future Shop — আপনার বিশ্বস্ত অনলাইন বাজার</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight" lang="bn">
            বাজারে নয়, বাজার আসবে আপনার ঘরে
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed" lang="bn">
            প্রযুক্তির ছোঁয়ায় শেরপুর ও বগুড়া অঞ্চলের মানুষের কেনাকাটার অভিজ্ঞতাকে আরও সহজ, দ্রুত ও নির্ভরযোগ্য করে তোলাই আমাদের মূল লক্ষ্য।
          </p>
          <div className="h-1.5 w-24 bg-gradient-to-r from-[#f47920] to-[#fb923c] mx-auto rounded-full"></div>
        </div>

        {/* Story / Introduction */}
        <div className="rounded-2xl border bg-card p-6 md:p-10 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3" lang="bn">
            <ShoppingBag className="h-6 w-6 text-[#f47920]" />
            আমাদের গল্প
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed" lang="bn">
            <strong>Future Shop</strong> হলো বগুড়া ও শেরপুর অঞ্চলের একটি আধুনিক ও নির্ভরযোগ্য ই-কমার্স প্ল্যাটফর্ম। দৈনন্দিন ব্যস্ত জীবনে বাজারের ভিড় এড়িয়ে যেন ঘরে বসেই খাঁটি, তাজা এবং মানসম্মত পণ্য পাওয়া যায় — সেই উদ্দেশ্য নিয়েই আমাদের যাত্রা শুরু।
          </p>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed" lang="bn">
            নিত্যপ্রয়োজনীয় মুদিপণ্য (Grocery), রান্নার সামগ্রী, পার্সোনাল কেয়ার, বেবি কেয়ার থেকে শুরু করে সেরা ব্র্যান্ডের বিশ্বস্ত পণ্যসমূহ ন্যায্য মূল্যে আপনার দরজায় পৌঁছে দিতে আমরা প্রতিশ্রুতিবদ্ধ।
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-gradient-to-br from-[#f47920]/5 via-transparent to-transparent p-6 md:p-8 space-y-3">
            <div className="inline-flex p-3 rounded-xl bg-[#f47920]/15 text-[#f47920]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground" lang="bn">আমাদের মিশন (Mission)</h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed" lang="bn">
              গ্রাহকদের সবচেয়ে দ্রুততম সময়ে শতভাগ খাঁটি ও মানসম্পন্ন পণ্য সরবরাহ করা এবং প্রতিটি অর্ডারে সর্বোচ্চ সন্তুষ্টি ও নিরাপত্তা নিশ্চিত করা।
            </p>
          </div>

          <div className="rounded-2xl border bg-gradient-to-br from-blue-500/5 via-transparent to-transparent p-6 md:p-8 space-y-3">
            <div className="inline-flex p-3 rounded-xl bg-blue-500/15 text-blue-600">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground" lang="bn">আমাদের ভিশন (Vision)</h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed" lang="bn">
              স্থানীয় বিশ্বস্ত ব্যবসা ও বিক্রেতাদের সাথে প্রযুক্তিগত সেতুবন্ধন তৈরি করে উত্তরবঙ্গের অন্যতম সেরা ও শীর্ষস্থানীয় ই-কমার্স নেটওয়ার্ক হিসেবে প্রতিষ্ঠা পাওয়া।
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground" lang="bn">
              কেন Future Shop থেকে কেনাকাটা করবেন?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground" lang="bn">
              আমাদের প্রতিটি সেবায় রয়েছে গ্রাহকের সুবিধা ও নিরাপত্তার সর্বোচ্চ নিশ্চয়তা
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="rounded-xl border bg-card p-5 space-y-3 transition-all hover:shadow-md hover:border-[#f47920]/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-100 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-base" lang="bn">১০০% আসল ও খাঁটি পণ্য</h4>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed" lang="bn">
                সরাসরি অনুমোদিত পরিবেশক ও বিশ্বস্ত উৎপাদকদের থেকে সংগ্রহকৃত ফ্রেশ পণ্য।
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3 transition-all hover:shadow-md hover:border-[#f47920]/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-orange-100 text-[#f47920]">
                  <Truck className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-base" lang="bn">দ্রুত হোম ডেলিভারি</h4>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed" lang="bn">
                শেরপুর ও বগুড়া শহরের যেকোনো স্থানে আপনার সুবিধাজনক সময়ে দ্রুততম হোম ডেলিভারি।
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3 transition-all hover:shadow-md hover:border-[#f47920]/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-base" lang="bn">ক্যাশ অন ডেলিভারি</h4>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed" lang="bn">
                আগে কোনো পেমেন্ট লাগবে না; পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করার পূর্ণ স্বাধীনতা।
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3 transition-all hover:shadow-md hover:border-[#f47920]/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-100 text-purple-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-base" lang="bn">ন্যায্য ও সাশ্রয়ী মূল্য</h4>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed" lang="bn">
                নিয়মিত আকর্ষণীয় ডিসকাউন্ট, ক্যাশব্যাক ও বাজারের সেরা মূল্যে পণ্য কেনার সুযোগ।
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3 transition-all hover:shadow-md hover:border-[#f47920]/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-red-100 text-red-600">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-base" lang="bn">সহজ রিটার্ন সুবিধা</h4>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed" lang="bn">
                পণ্যে কোনো ত্রুটি বা অমিল থাকলে তাত্ক্ষণিক পরিবর্তন বা রিটার্নের সহজ ব্যবস্থা।
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3 transition-all hover:shadow-md hover:border-[#f47920]/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600">
                  <Phone className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-base" lang="bn">সার্বক্ষণিক কাস্টমার সাপোর্ট</h4>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed" lang="bn">
                যেকোনো জিজ্ঞাসা, অর্ডার বা সহায়তার জন্য আমাদের সাপোর্ট টিম সর্বদা প্রস্তুত।
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Location Info Card */}
        <div className="rounded-2xl border bg-muted/30 p-6 md:p-8 space-y-6">
          <h3 className="text-xl font-bold text-foreground text-center md:text-left" lang="bn">
            যোগাযোগের ঠিকানা ও তথ্য
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
              <MapPin className="h-5 w-5 text-[#f47920] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium" lang="bn">অফিস ও স্টোর ঠিকানা</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  Sannalpara, Behind Sonali bank Bus-stand, Sherpur - 5840, Bogura
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
              <Phone className="h-5 w-5 text-[#f47920] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium" lang="bn">হেল্পলাইন / ফোন</p>
                <a href="tel:01813354648" className="text-sm font-semibold text-foreground hover:text-[#f47920] mt-0.5 block">
                  ০১৮১৩৩৫৪৬৪৮
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
              <Mail className="h-5 w-5 text-[#f47920] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium" lang="bn">ইমেইল</p>
                <a href="mailto:futuremindsbd.info@gmail.com" className="text-sm font-semibold text-foreground hover:text-[#f47920] break-all mt-0.5 block">
                  futuremindsbd.info@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#f47920] to-[#fb923c] p-8 md:p-12 text-center text-white space-y-4 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-extrabold" lang="bn">
            আজই ঘরে বসে আপনার পছন্দের পণ্য অর্ডার করুন!
          </h2>
          <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto" lang="bn">
            বাজারের সেরা পণ্য, দ্রুততম ডেলিভারি এবং ক্যাশ অন ডেলিভারি সুবিধা উপভোগ করুন Future Shop-এ।
          </p>
          <div className="pt-2">
            <Button
              nativeButton={false}
              render={<Link href="/products" />}
              className="h-12 px-8 bg-white text-[#f47920] hover:bg-gray-100 font-bold text-base shadow-md transition-all hover:scale-105"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              পণ্যসমূহ দেখুন
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
