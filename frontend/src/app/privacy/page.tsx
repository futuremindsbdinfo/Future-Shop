import type { Metadata } from "next";
import {
  Cookie,
  Eye,
  FileText,
  Lock,
  Mail,
  MapPin,
  Phone,
  Server,
  ShieldCheck,
  Truck,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি (Privacy Policy) | Future Shop",
  description:
    "Future Shop শেরপুর, বগুড়ার বিশ্বস্ত অনলাইন বাজার। আপনার ব্যক্তিগত তথ্যের গোপনীয়তা ও সুরক্ষার বিস্তারিত নিয়মাবলী জানুন।",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f47920]/10 text-[#f47920] text-xs md:text-sm font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>১০০% নিরাপদ ও সুরক্ষিত প্ল্যাটফর্ম</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight" lang="bn">
            গোপনীয়তা নীতি (Privacy Policy)
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed" lang="bn">
            Future Shop-এ আপনার ব্যক্তিগত তথ্যের নিরাপত্তা ও গোপনীয়তা রক্ষা করা আমাদের সর্বোচ্চ দায়িত্ব। আমরা কীভাবে তথ্য সংগ্রহ ও সুরক্ষা করি তা নিচে বিস্তারিত দেওয়া হলো।
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
            <span>সর্বশেষ হালনাগাদ: আগস্ট ২০২৬</span>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-[#f47920] to-[#fb923c] mx-auto rounded-full"></div>
        </div>

        {/* Introduction Banner */}
        <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5" lang="bn">
            <Lock className="h-5 w-5 text-[#f47920]" />
            আমাদের মূল অঙ্গীকার
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed" lang="bn">
            <strong>Future Shop</strong> (শেরপুর, বগুড়া) আপনার ব্যক্তিগত তথ্যের গোপনীয়তাকে পূর্ণ সম্মান জানায়। আমরা নিশ্চিত করছি যে আপনার সংবেদনশীল তথ্য কখনোই কোনো বাণিজ্যিক লাভের উদ্দেশ্যে বিক্রি, ভাড়া বা অননুমোদিত কারো কাছে হস্তান্তর করা হয় না।
          </p>
        </div>

        {/* Privacy Sections Grid */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-100 text-[#f47920]">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ১. আমরা যেসকল তথ্য সংগ্রহ করি
              </h3>
            </div>
            <div className="space-y-3 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>ওয়েবসাইটে অর্ডার ও উন্নত সেবা প্রদানের উদ্দেশ্যে আমরা প্রয়োজনীয় তথ্য সংগ্রহ করি:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-foreground">ব্যক্তিগত ও যোগাযোগের তথ্য:</strong> আপনার নাম, মোবাইল ফোন নম্বর, বিকল্প নম্বর (যদি থাকে) এবং ইমেইল ঠিকানা।
                </li>
                <li>
                  <strong className="text-foreground">ডেলিভারি ঠিকানা:</strong> আপনার পূর্ণ ঠিকানা, এলাকা/মহল্লা, ইউনিয়ন, থানা (শেরপুর) এবং জেলা (বগুড়া)।
                </li>
                <li>
                  <strong className="text-foreground">অর্ডার সংক্রান্ত তথ্য:</strong> নির্বাচিত পণ্যের তালিকা, অর্ডারের পরিমাণ, ডেলিভারি নোট এবং পেমেন্ট মেথড (যেমন: ক্যাশ অন ডেলিভারি)।
                </li>
                <li>
                  <strong className="text-foreground">ডিভাইস ও ব্রাউজিং ডেটা:</strong> আইপি অ্যাড্রেস, ব্রাউজারের ধরণ এবং সিস্টেম লগ যা প্ল্যাটফর্মের নিরাপত্তা বজায় রাখতে সাহায্য করে।
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ২. তথ্যের ব্যবহার কীভাবে করা হয়
              </h3>
            </div>
            <div className="space-y-3 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>আপনার প্রদত্ত তথ্য শুধুমাত্র নিম্নোক্ত সুনির্দিষ্ট উদ্দেশ্যে ব্যবহার করা হয়:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>আপনার পছন্দের পণ্যটি দ্রুত ও নির্ভুল ঠিকানায় পৌঁছে দেওয়ার জন্য।</li>
                <li>অর্ডার কনফার্মেশন, ডেলিভারি আপডেট ও স্ট্যাটাস জানানোর জন্য ফোন কল বা এসএমএস প্রেরণে।</li>
                <li>যেকোনো ধরনের রিটার্ন, রিফান্ড বা কাস্টমার সাপোর্ট অনুসন্ধান দ্রুত সমাধানের জন্য।</li>
                <li>ওয়েবসাইটে জালিয়াতি রোধ এবং নিরাপত্তা নিশ্চিত করার স্বার্থে।</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-100 text-green-700">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ৩. তথ্য শেয়ার করার নীতিমালা (Third-Party Disclosure)
              </h3>
            </div>
            <div className="space-y-3 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>আমরা গ্রাহকের তথ্যের সর্বোচ্চ সুরক্ষা নিশ্চিত করি এবং তা কখনোই অননুমোদিত কারো সাথে ভাগ করি না। তবে শুধুমাত্র ডেলিভারির স্বার্থে:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>আমাদের নির্ধারিত বিশ্বস্ত ডেলিভারি রাইডারদের শুধুমাত্র গ্রাহকের নাম, ফোন ও ঠিকানা প্রদান করা হয়।</li>
                <li>দেশের প্রচলিত আইন ও বিচারিক নির্দেশের বাধ্যবাধকতা ব্যতিরেকে কোনো অবস্থাতেই অন্য কারো সাথে তথ্য বিনিময় করা হয় না।</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                <Server className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ৪. ডেটা সুরক্ষা ও এনক্রিপশন
              </h3>
            </div>
            <div className="space-y-3 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>
                আপনার পাসওয়ার্ড ও সংবেদনশীল তথ্যসমূহ আধুনিক এনক্রিপশন প্রযুক্তির মাধ্যমে সুরক্ষিত সার্ভারে সংরক্ষিত থাকে। আমাদের সার্ভারে নিয়মিত নিরাপত্তা প্যাচ ও ফায়ারওয়াল রক্ষণাবেক্ষণ করা হয় যাতে কোনো ধরনের অননুমোদিত প্রবেশাধিকার ঘটতে না পারে।
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <Cookie className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ৫. কুকিজ (Cookies) নীতিমালা
              </h3>
            </div>
            <div className="space-y-3 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>
                আপনার শপিং অভিজ্ঞতা সহজতর করতে (যেমন: শপিং কার্টে আইটেম সংরক্ষণ, ভাষা পছন্দ ও লগইন সেশন মনে রাখা) আমাদের ওয়েবসাইট সীমিত মাত্রায় স্ট্যান্ডার্ড কুকিজ ব্যবহার করে। আপনি চাইলে আপনার ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকি নিয়ন্ত্রণ বা মুছে ফেলতে পারেন।
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ৬. আপনার অধিকার ও নিয়ন্ত্রণ
              </h3>
            </div>
            <div className="space-y-3 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>একজন সচেতন গ্রাহক হিসেবে আপনার অধিকার রয়েছে:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>যেকোনো সময় আপনার অ্যাকাউন্টের প্রোফাইল ও সংরক্ষিত ঠিকানা পরিবর্তন বা আপডেট করার।</li>
                <li>আপনার অ্যাকাউন্টের পূর্ববর্তী অর্ডারের হিস্টোরি দেখার।</li>
                <li>প্রয়োজনে অ্যাকাউন্ট সম্পূর্ণ নিষ্ক্রিয় বা মুছে ফেলার অনুরোধ জানানোর।</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Support Card */}
        <div className="rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/20 p-6 md:p-8 space-y-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground" lang="bn">
              গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্ন বা সহায়তায়
            </h3>
            <p className="text-sm text-muted-foreground" lang="bn">
              আমাদের ডেটা সুরক্ষা ও গোপনীয়তা নীতি সম্পর্কিত যেকোনো তথ্যের জন্য সরাসরি যোগাযোগ করুন
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
              <MapPin className="h-5 w-5 text-[#f47920] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium" lang="bn">অফিস ঠিকানা</p>
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
