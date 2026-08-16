"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Sparkles,
  Calendar,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Gift,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { PaginatedResponse, WalletTransaction } from "@/types";

interface WalletData {
  balance: string;
  transactions: PaginatedResponse<WalletTransaction>;
}

export default function RewardPage() {
  const { hydrated, isAuthenticated } = useDashboardAuth();

  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<WalletData>(`/account/wallet?page=${page}`)
      .then((res) => setData(res.data))
      .catch(() => toast.error("ওয়ালেট তথ্য লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    load();
  }, [hydrated, isAuthenticated, load]);

  if (!hydrated) return null;

  const balance = Number(data?.balance ?? 0);
  const txs = data?.transactions.data ?? [];
  const lastPage = data?.transactions.last_page ?? 1;

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2" lang="bn">
            <Wallet className="w-6 h-6 text-[#f47920]" />
            <span>রিওয়ার্ড ও ওয়ালেট ব্যালেন্স (Rewards &amp; Wallet)</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5" lang="bn">
            রেফারেল ও কুপন ক্যাশব্যাক থেকে অর্জিত ওয়ালেট ব্যালেন্স চেকআউটে যেকোনো অর্ডারে ব্যবহার করুন
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

      {/* Wallet Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-[#f47920] to-amber-500 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>উপলব্ধ ওয়ালেট ব্যালেন্স</span>
            </span>
            <p className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-xs">
              {loading ? "…" : formatTaka(balance)}
            </p>
            <p className="text-xs sm:text-sm text-white/90 max-w-md pt-1" lang="bn">
              পরবর্তী যেকোনো কেনাকাটায় চেকআউট পেজে এই ব্যালেন্স ব্যবহার করে সরাসরি ডিসকাউন্ট উপভোগ করুন।
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2.5">
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/referral" />}
              className="h-11 px-6 rounded-xl bg-white text-gray-900 hover:bg-orange-50 font-bold text-xs shadow-md"
            >
              <Gift className="w-4 h-4 mr-1.5 text-[#f47920]" />
              <span>আরও আয় করুন (রেফারেল)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
            <CreditCard className="w-5 h-5 text-[#f47920]" />
            <span>ওয়ালেট লেনদেনের ইতিহাস (Transaction History)</span>
          </h2>
          <span className="text-xs text-muted-foreground font-semibold">
            {!loading && `মোট ${txs.length}টি লেনদেন`}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#f47920]" />
            <p className="text-sm text-muted-foreground font-medium" lang="bn">
              লেনদেন বিবরণী লোড হচ্ছে...
            </p>
          </div>
        ) : txs.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-gray-100 shadow-sm text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-[#f47920]">
              <Wallet className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900" lang="bn">
              এখনো কোনো লেনদেন হয়নি
            </h2>
            <p className="text-xs text-muted-foreground" lang="bn">
              বন্ধুদের রেফার করে অথবা কুপন ব্যবহারে ওয়ালেট ব্যালেন্স অর্জন করুন।
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/referral" />}
              className="h-11 px-6 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-md"
            >
              রেফারেল শুরু করুন
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {txs.map((tx) => {
              const isCredit = tx.type === "credit";
              return (
                <div
                  key={tx.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownCircle className="w-5 h-5" />
                      ) : (
                        <ArrowUpCircle className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {tx.description || (isCredit ? "ওয়ালেটে রিওয়ার্ড জমা" : "অর্ডারে ব্যবহার")}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{new Date(tx.created_at).toLocaleString("bn-BD")}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm sm:text-base font-extrabold ${
                        isCredit ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {isCredit ? "+" : "−"}
                      {formatTaka(tx.amount)}
                    </p>
                    <Badge
                      className={`text-[10px] font-semibold mt-0.5 ${
                        isCredit
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {isCredit ? "জমা (Credit)" : "খরচ (Debit)"}
                    </Badge>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl text-xs font-bold"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  আগের পৃষ্ঠা
                </Button>
                <span className="text-xs font-semibold text-muted-foreground" lang="bn">
                  পৃষ্ঠা {page} / {lastPage}
                </span>
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl text-xs font-bold"
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  পরের পৃষ্ঠা
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
