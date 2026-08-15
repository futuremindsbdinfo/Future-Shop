import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "রিটার্ন ও ফেরত নীতি (Return & Refund Policy) | Future Shop",
  description:
    "Future Shop শেরপুর, বগুড়া — সহজ রিটার্ন, রিপ্লেসমেন্ট ও রিফান্ড নীতি। পণ্য ফেরত ও টাকা পাওয়ার সুস্পষ্ট নিয়মাবলী জানুন।",
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 text-green-700 text-xs md:text-sm font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>১০০% গ্রাহক সন্তুষ্টি গ্যারান্টি</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight" lang="bn">
            রিটার্ন ও ফেরত নীতি (Return & Refund Policy)
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed" lang="bn">
            Future Shop-এ কেনাকাটায় আপনি যেন শতভাগ নিশ্চিন্ত থাকতে পারেন, সেজন্য রয়েছে আমাদের সহজ ও গ্রাহকবান্ধব রিটার্ন ও রিফান্ড নীতিমালা।
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
            <span>সর্বশেষ হালনাগাদ: আগস্ট ২০২৬</span>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-[#f47920] to-[#fb923c] mx-auto rounded-full"></div>
        </div>

        {/* Highlight Guarantee Card */}
        <div className="rounded-2xl border bg-gradient-to-br from-[#f47920]/5 via-card to-card p-6 md:p-8 shadow-sm space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2.5" lang="bn">
            <RotateCcw className="h-5 w-5 text-[#f47920]" />
            আমাদের রিটার্ন প্রতিশ্রুতি
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed" lang="bn">
            ডেলিভারি পাওয়ার পর পণ্যে কোনো প্রকার সমস্যা বা অমিল থাকলে আপনি সম্পূর্ণ নিরাপদে পণ্য পরিবর্তন (Replacement) বা মূল্য ফেরত (Refund) পাওয়ার অধিকারী।
          </p>
        </div>

        {/* Policy Details */}
        <div className="space-y-6">
          {/* Section 1: When eligible */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-100 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ১. কোন কোন ক্ষেত্রে রিটার্ন গ্রহণযোগ্য?
              </h3>
            </div>
            <div className="space-y-2.5 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-foreground">ত্রুটিপূর্ণ বা নষ্ট পণ্য:</strong> ডেলিভারির সময় পণ্য ভাঙা, ফুটো বা ব্যবহারের অনুপযোগী অবস্থায় পাওয়া গেলে।
                </li>
                <li>
                  <strong className="text-foreground">ভুল পণ্য ডেলিভারি:</strong> আপনি যে পণ্য বা সাইজ/ভ্যারিয়েন্ট অর্ডার করেছিলেন তা না পাঠিয়ে অন্য পণ্য ডেলিভারি দিলে।
                </li>
                <li>
                  <strong className="text-foreground">মেয়াদোত্তীর্ণ পণ্য:</strong> পণ্যের গায়ে থাকা উৎপাদন ও মেয়াদের তারিখ উত্তীর্ণ অবস্থায় পাওয়া গেলে।
                </li>
                <li>
                  <strong className="text-foreground">প্যাকেট বা আইটেম অপূর্ণ থাকা:</strong> বক্স বা প্যাকেটের ভেতরে কোনো নির্ধারিত সামগ্রী না থাকলে।
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: How to return */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-100 text-[#f47920]">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ২. রিটার্ন করার নিয়ম ও সময়সীমা
              </h3>
            </div>
            <div className="space-y-3 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <div className="p-4 rounded-xl bg-muted/40 border space-y-2">
                <p className="font-semibold text-foreground" lang="bn">
                  💡 সেরা পরামর্শ — রাইডারের সামনে চেক করুন:
                </p>
                <p className="text-xs md:text-sm">
                  ডেলিভারি ম্যানের উপস্থিতিতে প্যাকেট খুলে পণ্যটি ঠিক আছে কি না দেখে নিন। সমস্যা থাকলে তৎক্ষণাৎ রাইডারের কাছেই পণ্যটি ফেরত দিতে পারবেন।
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  পণ্য গ্রহণের পর কোনো ত্রুটি পরিলক্ষিত হলে <strong>২৪ ঘণ্টার মধ্যে</strong> আমাদের হেল্পলাইনে (০১৮১৩৩৫৪৬৪৮) কল করে বা ইমেইলে জানাতে হবে।
                </li>
                <li>
                  পণ্যটি অবশ্যই অব্যবহৃত এবং তার আসল বক্স, স্টিকার, ট্যাগ ও ইনভয়েস সহ অক্ষত থাকতে হবে।
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3: Non returnable */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
                <XCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ৩. যেসকল ক্ষেত্রে রিটার্ন প্রযোজ্য নয়
              </h3>
            </div>
            <div className="space-y-2.5 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>ব্যক্তিগত ব্যবহারের পর বা সিল খোলার পর স্বাস্থ্য ও হাইজিন পণ্য (ব্যক্তিগত সুরক্ষা সামগ্রী)।</li>
                <li>খাদ্যপণ্য ও ফলমূল যদি ডেলিভারির সময় ভালো থাকা সত্ত্বেও পরবর্তীতে ভুল সংরক্ষণের কারণে নষ্ট হয়।</li>
                <li>পণ্যে কোনো ত্রুটি না থাকা সত্ত্বেও শুধুমাত্র ব্যক্তিগত মন পরিবর্তন হলে।</li>
                <li>পণ্য গ্রহণের ২৪ ঘণ্টা পার হয়ে যাওয়ার পর অভিযোগ জানালে।</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Refund & Replacement */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ৪. পণ্য পরিবর্তন (Replacement) ও টাকা ফেরত (Refund)
              </h3>
            </div>
            <div className="space-y-2.5 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>
                • <strong className="text-foreground">তাত্ক্ষণিক রিপ্লেসমেন্ট:</strong> ত্রুটিপূর্ণ পণ্যটি আমাদের হাতে পৌঁছানোর ২৪-৪৮ ঘণ্টার মধ্যে আমরা নতুন ফ্রেশ পণ্য ডেলিভারি করে দেবো।
              </p>
              <p>
                • <strong className="text-foreground">মূল্য ফেরত (Refund):</strong> যদি ওই পণ্যটি স্টকে না থাকে বা আপনি পণ্য না নিতে চান, তবে আপনার সম্পূর্ণ টাকা বিকাশ / নগদ / ব্যাংক ট্রান্সফারের মাধ্যমে ৩-৫ কার্যদিবসের মধ্যে ফেরত দেওয়া হবে।
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support Card */}
        <div className="rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/20 p-6 md:p-8 space-y-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground" lang="bn">
              রিটার্ন বা রিফান্ড সংক্রান্ত সহায়তার জন্য
            </h3>
            <p className="text-sm text-muted-foreground" lang="bn">
              আমাদের সাপোর্ট টিম দ্রুততম সময়ে আপনার সমস্যার সমাধান করবে
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
              <MapPin className="h-5 w-5 text-[#f47920] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium" lang="bn">স্টোর ঠিকানা</p>
                <p className="text-xs md:text-sm font-semibold text-foreground mt-0.5">
                  Sannalpara, Behind Sonali bank Bus-stand, Sherpur - 5840, Bogura
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
              <Phone className="h-5 w-5 text-[#f47920] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium" lang="bn">ফোন / হেল্পলাইন</p>
                <a
                  href="tel:01813354648"
                  className="text-xs md:text-sm font-semibold text-foreground hover:text-[#f47920] mt-0.5 block"
                >
                  ০১৮১৩৩৫৪৬৪৮
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
              <Mail className="h-5 w-5 text-[#f47920] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium" lang="bn">ইমেইল</p>
                <a
                  href="mailto:futuremindsbd.info@gmail.com"
                  className="text-xs md:text-sm font-semibold text-foreground hover:text-[#f47920] break-all mt-0.5 block"
                >
                  futuremindsbd.info@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
