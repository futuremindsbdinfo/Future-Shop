"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  CreditCard,
  ChevronRight,
  Package,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";

interface DeliveryOrder {
  id: number;
  order_number: string;
  total: string;
  payment_method: string;
  payment_status: string;
  delivered_at: string | null;
  user?: {
    id: number;
    name: string;
  };
}

interface DailyRow {
  date: string;
  delivered_count: number;
  collected_cash: number;
}

interface ReportData {
  assigned_count: number;
  delivered_count: number;
  pending_count: number;
  cancelled_count: number;
  success_rate: number;
  collected_cash: number;
  daily: DailyRow[];
  orders: DeliveryOrder[];
}

type Period = "today" | "week" | "month";

export default function DeliveryReportPage() {
  const [period, setPeriod] = useState<Period>("today");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<ReportData>(`/delivery/report?period=${period}`)
      .then((r) => setData(r.data))
      .catch(() => toast.error("রিপোর্ট লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const periods: { value: Period; label: string }[] = [
    { value: "today", label: "আজকের হিসাব" },
    { value: "week", label: "এই সপ্তাহ" },
    { value: "month", label: "এই মাস" },
  ];

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2" lang="bn">
            <FileText className="w-5 h-5 text-[#f47920]" />
            <span>রাইডার ডেলিভারি ও ক্যাশ রিপোর্ট</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            আপনার সফল ডেলিভারি সংখ্যা ও আদায়কৃত ক্যাশ হিসাব বিবরণী
          </p>
        </div>

        {/* Period Selector Pills */}
        <div className="flex gap-1.5 p-1 bg-gray-100 rounded-2xl self-start sm:self-auto border border-gray-200">
          {periods.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === p.value
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              lang="bn"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner fullHeight />
      ) : data ? (
        <div className="space-y-6">
          
          {/* 6 Performance Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Delivered Count */}
            <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50/70 to-white p-4 sm:p-5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#f47920]" lang="bn">মোট ডেলিভারি সম্পন্ন</span>
                <CheckCircle2 className="w-4 h-4 text-[#f47920]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 pt-1">
                {data.delivered_count} <span className="text-xs font-semibold text-muted-foreground">টি</span>
              </p>
            </div>

            {/* Collected Cash */}
            <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white p-4 sm:p-5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700" lang="bn">নগদ ক্যাশ সংগ্রহ (COD)</span>
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 pt-1 truncate">
                {formatTaka(data.collected_cash)}
              </p>
            </div>

            {/* Success Rate */}
            <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50/70 to-white p-4 sm:p-5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700" lang="bn">সাফল্যের হার (Success)</span>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-purple-900 pt-1">
                {Math.min(100, data.success_rate).toFixed(1)}%
              </p>
            </div>

            {/* Total Assigned */}
            <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600" lang="bn">অ্যাসাইন করা পার্সেল</span>
                <Package className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900 pt-1">
                {data.assigned_count} <span className="text-xs font-semibold text-muted-foreground">টি</span>
              </p>
            </div>

            {/* Pending */}
            <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600" lang="bn">চলমান / বাকি</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-700 pt-1">
                {data.pending_count} <span className="text-xs font-semibold text-muted-foreground">টি</span>
              </p>
            </div>

            {/* Cancelled */}
            <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600" lang="bn">বাতিল অর্ডার</span>
                <XCircle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-red-600 pt-1">
                {data.cancelled_count} <span className="text-xs font-semibold text-muted-foreground">টি</span>
              </p>
            </div>

          </div>

          {/* Daily Breakdown Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
              <Calendar className="w-4 h-4 text-[#f47920]" />
              <span>দিনভিত্তিক ডেলিভারি ও ক্যাশ হিসাব</span>
            </h2>

            {data.daily.length === 0 ? (
              <p className="text-center py-6 text-xs text-muted-foreground" lang="bn">
                এই সময়সীমায় কোনো ডেলিভারি রেকর্ড নেই।
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-left uppercase tracking-wider text-muted-foreground">
                      <th className="py-2.5 font-bold" lang="bn">তারিখ</th>
                      <th className="py-2.5 text-center font-bold" lang="bn">ডেলিভারি সংখ্যা</th>
                      <th className="py-2.5 text-right font-bold" lang="bn">সংগৃহীত ক্যাশ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.daily.map((d) => (
                      <tr key={d.date} className="hover:bg-orange-50/30 transition-colors">
                        <td className="py-3 font-semibold text-gray-800">
                          {new Date(`${d.date}T00:00:00`).toLocaleDateString("bn-BD", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 text-center font-bold text-gray-900">
                          {d.delivered_count}টি
                        </td>
                        <td className="py-3 text-right font-black text-emerald-600">
                          {formatTaka(d.collected_cash)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Deliveries List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-gray-900" lang="bn">
                সম্পন্নকৃত অর্ডারের বিবরণ ({data.orders.length}টি)
              </h2>
            </div>

            {data.orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center text-xs text-muted-foreground" lang="bn">
                এই সময়ে কোনো সম্পন্ন ডেলিভারি নেই।
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center justify-between gap-3 hover:border-[#f47920]/50 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/delivery/${order.id}`}
                          className="font-mono text-xs font-black text-[#f47920] hover:underline"
                        >
                          {order.order_number}
                        </Link>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                          {order.payment_status === "paid" ? "পরিশোধিত ✓" : "অপরিশোধিত"}
                        </Badge>
                      </div>

                      <p className="text-xs text-gray-600 truncate">
                        {order.user?.name ?? "সম্মানিত গ্রাহক"} •{" "}
                        <span className="text-muted-foreground">
                          {order.payment_method === "cod" ? "ক্যাশ অন ডেলিভারি" : "অনলাইন পেমেন্ট"}
                        </span>
                      </p>

                      {order.delivered_at && (
                        <p className="text-[11px] text-muted-foreground">
                          ডেলিভারি সম্পন্ন: {new Date(order.delivered_at).toLocaleTimeString("bn-BD", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-gray-900">
                        {formatTaka(Number(order.total))}
                      </p>
                      <Link
                        href={`/delivery/${order.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f47920] hover:underline mt-1"
                      >
                        <span>বিস্তারিত</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground">রিপোর্ট ডাটা পাওয়া যায়নি।</p>
      )}

    </div>
  );
}
