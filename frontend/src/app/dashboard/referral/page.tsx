"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Trophy,
  Users,
  Share2,
  Gift,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";

interface ReferralSummary {
  referral_code: string | null;
  referral_count: number;
  referral_earned: string | number;
}

export default function ReferralPage() {
  const { hydrated, isAuthenticated } = useDashboardAuth();

  const [data, setData] = useState<ReferralSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    api
      .get<ReferralSummary>("/account/referral")
      .then((res) => setData(res.data))
      .catch(() => toast.error("রেফারেল তথ্য লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, [hydrated, isAuthenticated]);

  const code = data?.referral_code ?? "";
  const count = data?.referral_count ?? 0;
  const earned = Number(data?.referral_earned ?? 0);
  const referralUrl = typeof window !== "undefined" ? `${window.location.origin}/?ref=${code}` : `https://shop.fuminds.com/?ref=${code}`;

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      toast.success(`রেফারেল কোড '${code}' কপি করা হয়েছে!`);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      toast.error("কপি করা সম্ভব হয়নি");
    }
  };

  const copyLink = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      toast.success("রেফারেল লিংক কপি করা হয়েছে!");
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      toast.error("লিংক কপি করা সম্ভব হয়নি");
    }
  };

  const shareWhatsApp = () => {
    if (!code) return;
    const msg = encodeURIComponent(
      `Future Shop শেরপুর থেকে কেনাকাটা করতে আমার রেফারেল কোড '${code}' ব্যবহার করুন এবং প্রথম অর্ডারে ১০% ক্যাশব্যাক পান!\n\nরেজিস্ট্রেশন লিংক: ${referralUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2" lang="bn">
            <Gift className="w-6 h-6 text-[#f47920]" />
            <span>রেফারেল ও আয় (Refer &amp; Earn)</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5" lang="bn">
            বন্ধুদের ইনভাইট করুন এবং তাদের প্রথম অর্ডারে আপনারা উভয়েই ১০% ওয়ালেট ক্যাশব্যাক পান
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-[#f47920] self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>১০% বোনাস রিওয়ার্ড</span>
        </div>
      </div>

      {/* Main Referral Code & Share Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-[#f47920] to-amber-500 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 space-y-6 max-w-xl">
          <div className="space-y-1.5">
            <span className="text-xs font-bold tracking-wider uppercase text-white/80" lang="bn">
              আপনার ইউনিক রেফারেল কোড
            </span>
            <p className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-white drop-shadow-xs">
              {loading ? "…" : code || "—"}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-white/90 leading-relaxed" lang="bn">
            আপনার এই কোড বা লিংকটি বন্ধুদের সাথে শেয়ার করুন। তারা একাউন্ট খোলার সময় আপনার কোড বসালে এবং প্রথম ডেলিভারি সফল হলে আপনার ওয়ালেটে ১০% ক্যাশব্যাক জমা হবে।
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              onClick={copyCode}
              disabled={!code}
              className="h-11 px-5 rounded-xl bg-white text-gray-900 hover:bg-orange-50 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {copiedCode ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[#f47920]" />}
              <span>{copiedCode ? "কোড কপি হয়েছে ✓" : "রেফারেল কোড কপি"}</span>
            </Button>

            <Button
              onClick={copyLink}
              disabled={!code}
              className="h-11 px-5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold text-xs border border-white/30 transition-all flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? "লিংক কপি হয়েছে ✓" : "ইনভাইট লিংক কপি"}</span>
            </Button>

            <button
              type="button"
              onClick={shareWhatsApp}
              disabled={!code}
              className="h-11 px-5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp-এ শেয়ার</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground" lang="bn">
              মোট আমন্ত্রিত বন্ধু (Friends Referred)
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
              {count} জন
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#f47920] flex items-center justify-center shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground" lang="bn">
              রেফারেল থেকে অর্জিত মোট আয় (Total Earned)
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#f47920] mt-0.5">
              {formatTaka(earned)}
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
          <Sparkles className="w-4 h-4 text-[#f47920]" />
          <span>রেফারেল প্রোগ্রাম কিভাবে কাজ করে?</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#f47920] font-extrabold flex items-center justify-center text-sm">
              ১
            </div>
            <h3 className="text-sm font-bold text-gray-900" lang="bn">ইনভাইট পাঠান</h3>
            <p className="text-xs text-muted-foreground leading-relaxed" lang="bn">
              আপনার রেফারেল কোড বা লিংকটি বন্ধুদের মেসেজ বা হোয়াটসঅ্যাপে পাঠান।
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#f47920] font-extrabold flex items-center justify-center text-sm">
              ২
            </div>
            <h3 className="text-sm font-bold text-gray-900" lang="bn">বন্ধু একাউন্ট খুলবে</h3>
            <p className="text-xs text-muted-foreground leading-relaxed" lang="bn">
              আপনার বন্ধু রেজিস্ট্রেশন করার সময় রেফারেল কোড ফিল্ডে কোডটি যুক্ত করবে।
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#f47920] font-extrabold flex items-center justify-center text-sm">
              ৩
            </div>
            <h3 className="text-sm font-bold text-gray-900" lang="bn">১০% ক্যাশব্যাক উপভোগ করুন</h3>
            <p className="text-xs text-muted-foreground leading-relaxed" lang="bn">
              বন্ধুর প্রথম অর্ডার সফলভাবে ডেলিভারি হওয়ার সাথে সাথেই আপনার ওয়ালেটে ১০% জমা হবে।
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
