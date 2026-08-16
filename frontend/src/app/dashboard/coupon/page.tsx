"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag,
  Copy,
  Check,
  Calendar,
  Sparkles,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Wallet,
  Loader2,
  Gift,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { Coupon, CouponUsage } from "@/types";

interface CouponData {
  available: Coupon[];
  used: CouponUsage[];
}

export default function CouponPage() {
  const { hydrated, isAuthenticated } = useDashboardAuth();

  const [data, setData] = useState<CouponData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    api
      .get<CouponData>("/account/coupons")
      .then((res) => setData(res.data))
      .catch(() => toast.error("কুপন তথ্য লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, [hydrated, isAuthenticated]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`কুপন কোড '${code}' কপি করা হয়েছে!`);
      setTimeout(() => setCopiedCode(null), 3000);
    } catch {
      toast.error("কপি করা সম্ভব হয়নি");
    }
  };

  if (!hydrated) return null;

  const available = data?.available ?? [];
  const used = data?.used ?? [];

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2" lang="bn">
            <Gift className="w-6 h-6 text-[#f47920]" />
            <span>আমার কুপন ও ডিসকাউন্ট ভাউচার</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5" lang="bn">
            আপনার অ্যাকাউন্টে প্রযোজ্য সক্রিয় ভাউচার কোড কপি করে চেকআউটে ছাড় উপভোগ করুন
          </p>
        </div>

        <Button
          nativeButton={false}
          render={<Link href="/products" />}
          className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs self-start sm:self-auto"
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
          <span>কেনাকাটা করুন</span>
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#f47920]" />
          <p className="text-sm text-muted-foreground font-medium" lang="bn">
            কুপন ও অফার লোড হচ্ছে...
          </p>
        </div>
      ) : available.length === 0 && used.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-gray-100 shadow-sm text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-[#f47920]">
            <Tag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900" lang="bn">
            বর্তমানে কোনো কুপন সক্রিয় নেই
          </h2>
          <p className="text-xs text-muted-foreground" lang="bn">
            আমাদের বিশেষ ক্যাম্পেইন বা কেনাকাটার মাধ্যমে অর্জিত কুপনগুলো এখানে দেখতে পাবেন।
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/products" />}
            className="h-11 px-6 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-md"
          >
            সেরা অফারগুলো দেখুন
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Section: Available Coupons */}
          {available.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
                <Sparkles className="w-4 h-4 text-[#f47920]" />
                <span>আপনার জন্য সক্রিয় ভাউচার ({available.length}টি)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {available.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="relative bg-gradient-to-br from-orange-50/70 via-white to-amber-50/50 rounded-3xl border border-orange-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 overflow-hidden"
                  >
                    {/* Left & Right Notch Circles */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#f8fafc] border-r border-orange-200" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#f8fafc] border-l border-orange-200" />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f47920] text-white font-extrabold text-xs shadow-2xs">
                          <Tag className="w-3 h-3" />
                          <span>{coupon.discount_percentage}% ছাড়</span>
                        </div>
                        {coupon.max_discount_amount && (
                          <span className="text-[11px] font-bold text-orange-700 bg-orange-100/60 px-2 py-0.5 rounded-md" lang="bn">
                            সর্বোচ্চ ছাড় {formatTaka(Number(coupon.max_discount_amount))}
                          </span>
                        )}
                      </div>

                      <div className="pt-2">
                        <p className="font-mono text-2xl font-black text-gray-900 tracking-wider">
                          {coupon.code}
                        </p>
                        {coupon.description && (
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {coupon.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-dashed border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      {coupon.expires_at ? (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span lang="bn">মেয়াদ: {new Date(coupon.expires_at).toLocaleDateString("bn-BD")} পর্যন্ত</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">সীমাহীন মেয়াদি</span>
                      )}

                      <Button
                        onClick={() => copyCode(coupon.code)}
                        className={`h-9 px-4 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 ${
                          copiedCode === coupon.code
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-[#f47920] hover:bg-[#d46212] text-white"
                        }`}
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>কপি হয়েছে ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>কুপন কোড কপি</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Used Coupons History */}
          {used.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>পূর্বে ব্যবহৃত কুপনের ইতিহাস</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {used.map((usage) => (
                  <div
                    key={usage.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="font-mono text-sm font-bold text-gray-900">
                        {usage.coupon?.code ?? "DISCOUNT"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span lang="bn">{new Date(usage.created_at).toLocaleDateString("bn-BD")}</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-600" lang="bn">
                          {formatTaka(usage.discount_amount)} সাশ্রয়
                        </span>
                      </p>
                    </div>

                    <div>
                      {usage.wallet_credited ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ক্যাশব্যাক জমা</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[11px] font-semibold">
                          ডেলিভারি সাপেক্ষে
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
