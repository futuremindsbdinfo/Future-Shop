"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyChart } from "@/components/shared/EmptyChart";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import { ORDER_STATUS_BN, ORDER_STATUS_CLASS } from "@/lib/order-status";
import { useAuthStore } from "@/store/authStore";
import type { DashboardStats, Order, PaginatedResponse, Product } from "@/types";

const TK = "৳";
const fmtNum = (v: number) => v.toLocaleString("bn-BD");

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  bgClass,
}: {
  label: string;
  value: string;
  icon: typeof ShoppingBag;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xs flex items-center justify-between gap-4 hover:border-gray-200 transition-all">
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-bold text-muted-foreground truncate" lang="bn">{label}</p>
        <p className="text-2xl sm:text-3xl font-black text-gray-900 truncate">{value}</p>
      </div>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bgClass} ${colorClass} shadow-2xs`}>
        <Icon className="h-6 w-6" />
      </span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Skeleton className="h-80 rounded-3xl lg:col-span-3" />
        <Skeleton className="h-80 rounded-3xl lg:col-span-2" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-9">
        <Skeleton className="h-72 rounded-3xl lg:col-span-5" />
        <Skeleton className="h-72 rounded-3xl lg:col-span-4" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekToggle, setWeekToggle] = useState<"thisWeek" | "lastWeek">("thisWeek");
  const [growthMonth, setGrowthMonth] = useState("12");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, p] = await Promise.all([
        api.get<{ data: DashboardStats }>("/admin/dashboard"),
        api.get<PaginatedResponse<Product>>("/admin/products?per_page=5"),
      ]);
      setStats(d.data.data);
      setTopProducts(p.data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ড্যাশবোর্ড তথ্য লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-gray-200 text-center max-w-md mx-auto space-y-4">
        <p className="text-sm font-bold text-red-600">{error}</p>
        <Button onClick={load} className="h-11 px-6 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-md">
          আবার চেষ্টা করুন
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  const recentFive = stats.recent_orders.slice(0, 5);
  const productsSold = stats.top_products_sold || [];
  const maxSold = Math.max(1, ...productsSold.map((p) => p.sold));

  const customerGrowth = stats.customer_growth || [];
  const growthTotal = customerGrowth.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2" lang="bn">
            <span>স্বাগতম, {user?.name ?? "অ্যাডমিন"}! 👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5" lang="bn">
            Future Shop সেন্ট্রাল কন্ট্রোল ড্যাশবোর্ড ও আজকের ব্যবসায়িক পরিসংখ্যান
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl shadow-2xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#f47920]" />
            <span>{new Date().toLocaleDateString("bn-BD", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={load}
            className="h-10 px-3 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:text-[#f47920] shadow-2xs gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>রিফ্রেশ</span>
          </Button>
        </div>
      </div>

      {/* 4 Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="মোট বিক্রয় রাজস্ব (Revenue)"
          value={formatTaka(stats.total_revenue)}
          icon={CreditCard}
          colorClass="text-[#f47920]"
          bgClass="bg-orange-50"
        />
        <StatCard
          label="মোট অর্ডার সংখ্যা (Orders)"
          value={fmtNum(stats.total_orders)}
          icon={ShoppingBag}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatCard
          label="মোট গ্রাহক (Customers)"
          value={fmtNum(stats.total_customers ?? 0)}
          icon={Users}
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
        />
        <StatCard
          label="মোট পণ্য সংখ্যা (Products)"
          value={fmtNum(stats.total_products ?? 0)}
          icon={Package}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
      </div>

      {/* CHARTS ROW — Sales Overview (60%) + Top Selling Products (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Sales Overview Line Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs lg:col-span-3 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100">
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
              <TrendingUp className="w-4 h-4 text-[#f47920]" />
              <span>বিক্রয় পরিসংখ্যান (Sales Overview)</span>
            </h2>

            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setWeekToggle("thisWeek")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  weekToggle === "thisWeek"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                lang="bn"
              >
                এই সপ্তাহ
              </button>
              <button
                type="button"
                onClick={() => setWeekToggle("lastWeek")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  weekToggle === "lastWeek"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                lang="bn"
              >
                গত সপ্তাহ
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            {stats.total_orders === 0 ? (
              <EmptyChart message="এখনো কোনো বিক্রয় ডাটা নেই" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.sales_overview || []} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${TK}${Math.round(Number(v) / 1000)}k`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(value, name) => [formatTaka(value as number), name === "thisWeek" ? "এই সপ্তাহ" : "গত সপ্তাহ"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="thisWeek"
                    stroke="#f47920"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#f47920" }}
                    activeDot={{ r: 6 }}
                    strokeOpacity={weekToggle === "thisWeek" ? 1 : 0.3}
                  />
                  <Line
                    type="monotone"
                    dataKey="lastWeek"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: "#9ca3af" }}
                    strokeOpacity={weekToggle === "lastWeek" ? 1 : 0.3}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Products Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900" lang="bn">
              সেরা বিক্রিত পণ্য
            </h2>
            <Link href="/admin/products" className="text-xs font-bold text-[#f47920] hover:underline">
              সবগুলো দেখুন →
            </Link>
          </div>

          {productsSold.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">এখনো কোনো বিক্রয় রেকর্ড নেই</p>
          ) : (
            <div className="space-y-3.5">
              {productsSold.map((p) => {
                const pct = (p.sold / maxSold) * 100;
                return (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                          {p.image ? (
                            <Image src={p.image} alt={p.name} fill sizes="36px" className="object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center font-bold text-[#f47920]">
                              {p.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-gray-900 truncate max-w-[140px]">{p.name}</p>
                      </div>
                      <span className="font-bold text-[#f47920] shrink-0 bg-orange-50 px-2 py-0.5 rounded-md text-[11px]">
                        {p.sold}টি বিক্রিত
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#f47920] to-[#fb923c] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* BOTTOM ROW: Recent Orders (60%) + Customer Growth (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
        
        {/* Recent Orders Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900" lang="bn">
              সাম্প্রতিক অর্ডারসমূহ
            </h2>
            <Link href="/admin/orders" className="text-xs font-bold text-[#f47920] hover:underline">
              সকল অর্ডার দেখুন →
            </Link>
          </div>

          {recentFive.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">এখনো কোনো অর্ডার আসেনি</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentFive.map((order: Order) => (
                <div
                  key={order.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-gray-50/50 rounded-xl px-2 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono font-bold text-[#f47920] hover:underline block truncate"
                    >
                      {order.order_number}
                    </Link>
                    <p className="text-muted-foreground text-[11px]">
                      {order.shipping_name} • {new Date(order.created_at).toLocaleDateString("bn-BD")}
                    </p>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <p className="font-extrabold text-gray-900">{formatTaka(Number(order.total))}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${ORDER_STATUS_CLASS[order.order_status] ?? ""}`}
                      lang="bn"
                    >
                      {ORDER_STATUS_BN[order.order_status] ?? order.order_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Growth Pie Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900" lang="bn">
              গ্রাহক পরিসংখ্যান
            </h2>
            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold">
              মোট: {growthTotal}
            </Badge>
          </div>

          <div className="relative h-44 w-full">
            {growthTotal === 0 ? (
              <EmptyChart message="এখনো কোনো গ্রাহক ডাটা নেই" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerGrowth}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {customerGrowth.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-2xl font-black text-gray-900">{growthTotal}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">মোট গ্রাহক</p>
                </div>
              </>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            {customerGrowth.map((seg) => {
              const pct = growthTotal > 0 ? Math.round((seg.value / growthTotal) * 100) : 0;
              return (
                <div key={seg.name} className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                    <span className="font-medium">{seg.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{seg.value} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
