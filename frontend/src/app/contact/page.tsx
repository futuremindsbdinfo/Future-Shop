import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  PackageSearch,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "যোগাযোগ (Contact Us) | Future Shop",
  description:
    "Future Shop শেরপুর, বগুড়া — আমাদের সাথে যোগাযোগ করুন। হেল্পলাইন ফোন নম্বর, অফিস ঠিকানা এবং ইমেইল সহায়তা।",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f47920]/10 text-[#f47920] text-xs md:text-sm font-semibold">
            <MessageSquare className="h-4 w-4" />
            <span>আমরা আপনার সেবায় নিয়োজিত</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight" lang="bn">
            যোগাযোগ (Contact Us)
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed" lang="bn">
            পণ্য, অর্ডার, ডেলিভারি বা যেকোনো প্রশ্ন ও পরামর্শের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।
          </p>
          <div className="h-1.5 w-24 bg-gradient-to-r from-[#f47920] to-[#fb923c] mx-auto rounded-full"></div>
        </div>

        {/* 3 Main Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Address Card */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 text-center flex flex-col items-center justify-between shadow-sm transition-all hover:shadow-md hover:border-[#f47920]/40">
            <div className="space-y-3 flex flex-col items-center">
              <div className="p-4 rounded-2xl bg-[#f47920]/10 text-[#f47920]">
                <MapPin className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground" lang="bn">অফিস ও স্টোর ঠিকানা</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sannalpara, Behind Sonali bank Bus-stand, <br />
                Sherpur - 5840, Bogura
              </p>
            </div>
            <div className="pt-2 text-xs text-muted-foreground font-medium">
              সরাসরি অফিসে এসে দেখা করার সময়: সকাল ১০:০০ - রাত ৮:০০
            </div>
          </div>

          {/* Phone Card */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 text-center flex flex-col items-center justify-between shadow-sm transition-all hover:shadow-md hover:border-[#f47920]/40">
            <div className="space-y-3 flex flex-col items-center">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Phone className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground" lang="bn">ফোন ও হেল্পলাইন</h3>
              <a
                href="tel:01813354648"
                className="text-xl font-extrabold text-foreground hover:text-[#f47920] transition-colors"
              >
                ০১৮১৩৩৫৪৬৪৮
              </a>
              <p className="text-xs text-muted-foreground leading-relaxed" lang="bn">
                সরাসরি কথা বলতে বা জরুরি অর্ডারের জন্য কল করুন
              </p>
            </div>
            <div className="pt-2">
              <Button
                nativeButton={false}
                render={<a href="tel:01813354648" />}
                className="h-10 px-5 bg-[#f47920] hover:bg-[#e56910] text-white font-semibold text-xs shadow-sm rounded-xl"
              >
                <Phone className="mr-2 h-4 w-4" />
                এখনই কল করুন
              </Button>
            </div>
          </div>

          {/* Email Card */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 text-center flex flex-col items-center justify-between shadow-sm transition-all hover:shadow-md hover:border-[#f47920]/40">
            <div className="space-y-3 flex flex-col items-center">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-600">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground" lang="bn">ইমেইল সাপোর্ট</h3>
              <a
                href="mailto:futuremindsbd.info@gmail.com"
                className="text-sm font-bold text-foreground hover:text-[#f47920] transition-colors break-all"
              >
                futuremindsbd.info@gmail.com
              </a>
              <p className="text-xs text-muted-foreground leading-relaxed" lang="bn">
                অভিযোগ, ব্যবসায়িক প্রস্তাব বা যেকোনো ফিডব্যাক পাঠাতে পারেন
              </p>
            </div>
            <div className="pt-2">
              <Button
                nativeButton={false}
                render={<a href="mailto:futuremindsbd.info@gmail.com" />}
                variant="outline"
                className="h-10 px-5 text-xs font-semibold rounded-xl"
              >
                <Mail className="mr-2 h-4 w-4" />
                ইমেইল পাঠান
              </Button>
            </div>
          </div>
        </div>

        {/* Service Area & Support Hours Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-muted/30 p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-100 text-[#f47920]">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground" lang="bn">সেবার এলাকা (Delivery Coverage)</h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed" lang="bn">
              <p>
                <strong className="text-foreground">প্রধান হোম ডেলিভারি জোন:</strong> শেরপুর, বগুড়া অঞ্চল (পৌরসভা ও পার্শ্ববর্তী ইউনিয়নসমূহ)।
              </p>
              <p>
                <strong className="text-foreground">অন্যান্য জেলা:</strong> কুরিয়ার সার্ভিসের মাধ্যমে সারাদেশে দ্রুত হোম ডেলিভারি সুবিধা।
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground" lang="bn">কাস্টমার কেয়ার সময়সূচী</h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed" lang="bn">
              <p>
                <strong className="text-foreground">সাপোর্ট হেল্পলাইন:</strong> প্রতিদিন সকাল ৯:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত।
              </p>
              <p>
                <strong className="text-foreground">অনলাইন শপ:</strong> ২৪ ঘণ্টা (যেকোনো সময় অর্ডার করা যাবে)।
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links Help Grid */}
        <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-foreground text-center md:text-left flex items-center gap-2.5" lang="bn">
            <HelpCircle className="h-5 w-5 text-[#f47920]" />
            প্রয়োজনীয় লিঙ্ক ও দ্রুত সাহায্য
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/orders"
              className="flex items-center gap-3 p-4 rounded-xl border bg-muted/20 hover:bg-muted/50 transition-all hover:border-[#f47920]/40 group"
            >
              <div className="p-2 rounded-lg bg-orange-100 text-[#f47920] group-hover:scale-110 transition-transform">
                <PackageSearch className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground" lang="bn">অর্ডার ট্র্যাক করুন</h4>
                <p className="text-xs text-muted-foreground" lang="bn">লাইভ স্ট্যাটাস দেখুন</p>
              </div>
            </Link>

            <Link
              href="/returns"
              className="flex items-center gap-3 p-4 rounded-xl border bg-muted/20 hover:bg-muted/50 transition-all hover:border-[#f47920]/40 group"
            >
              <div className="p-2 rounded-lg bg-green-100 text-green-700 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground" lang="bn">রিটার্ন ও ফেরত নীতি</h4>
                <p className="text-xs text-muted-foreground" lang="bn">রিফান্ড নিয়মাবলী</p>
              </div>
            </Link>

            <Link
              href="/terms"
              className="flex items-center gap-3 p-4 rounded-xl border bg-muted/20 hover:bg-muted/50 transition-all hover:border-[#f47920]/40 group"
            >
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground" lang="bn">শর্তাবলী</h4>
                <p className="text-xs text-muted-foreground" lang="bn">কেনাকাটার নিয়মাবলী</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
