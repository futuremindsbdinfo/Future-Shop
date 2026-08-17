"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  ShoppingBag,
  ShoppingCart,
  Users,
  Calendar,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { AnalyticsData } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#f97316",
  shipped: "#0ea5e9",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const STATUS_LABEL_BN: Record<string, string> = {
  pending: "পেন্ডিং (Pending)",
  confirmed: "কনফার্মড (Confirmed)",
  processing: "প্রসেসিং (Processing)",
  shipped: "শিপড (Shipped)",
  delivered: "ডেলিভার্ড (Delivered)",
  cancelled: "বাতিল (Cancelled)",
};

const PIE_COLORS = ["#f47920", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#6366f1"];

type Range = "7" | "30" | "90";

function MetricCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  growthPct,
  subLabel,
}: {
  label: string;
  value: string;
  icon: typeof CircleDollarSign;
  iconBg: string;
  iconColor: string;
  growthPct?: number | null;
  subLabel?: string;
}) {
  const positive = (growthPct ?? 0) >= 0;

  return (
    <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-500" lang="bn">{label}</p>
            <p className="mt-1.5 truncate text-xl sm:text-2xl font-black text-gray-900 font-mono tracking-tight">{value}</p>
            
            {growthPct !== undefined && growthPct !== null && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold font-mono" style={{
                backgroundColor: positive ? "#ecfdf5" : "#fef2f2",
                color: positive ? "#059669" : "#dc2626",
              }}>
                {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span>{Math.abs(growthPct).toFixed(1)}% বিগত সময়ের তুলনায়</span>
              </div>
            )}

            {subLabel && (
              <p className="mt-1 text-[11px] text-muted-foreground font-semibold">{subLabel}</p>
            )}
          </div>

          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg} shadow-2xs`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-3xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-3xl" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("30");

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ data: AnalyticsData }>(`/admin/analytics?days=${range}`)
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <AnalyticsSkeleton />;
  if (!data) return <p className="text-xs text-muted-foreground py-12 text-center" lang="bn">কোনো অ্যানালিটিক্স ডেটা পাওয়া যায়নি।</p>;

  const sales = data.sales_by_day.map((p) => ({
    date: new Date(p.date).toLocaleDateString("bn-BD", { month: "short", day: "numeric" }),
    revenue: p.revenue,
    orders: p.orders,
  }));

  const statusBars = Object.entries(data.orders_by_status).map(([key, value]) => ({
    name: STATUS_LABEL_BN[key] ?? key,
    value,
    key,
  }));

  const pie = data.top_categories.map((c) => ({ name: c.name, value: c.sales }));

  return (
    <div className="space-y-6">
      
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              বিজনেস অ্যানালিটিক্স (Business Analytics)
            </h1>
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
              লাইভ ডেটা
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            বিক্রয় আয়, প্রবৃদ্ধি, অর্ডারের ট্রেন্ড ও ক্যাটাগরিভিত্তিক পারফরম্যান্স মেট্রিক্স
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-gray-50 p-1 self-start sm:self-auto">
          {(
            [
              { id: "7", label: "গত ৭ দিন" },
              { id: "30", label: "গত ৩০ দিন" },
              { id: "90", label: "গত ৯০ দিন" },
            ] as const
          ).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`h-8 px-3 rounded-xl text-xs font-bold transition-all ${
                range === r.id
                  ? "bg-[#f47920] text-white shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="সর্বমোট বিক্রয় রাজস্ব"
          value={formatTaka(data.revenue_total)}
          icon={CircleDollarSign}
          iconBg="bg-orange-50"
          iconColor="text-[#f47920]"
          growthPct={data.revenue_growth}
        />
        <MetricCard
          label="মোট সম্পন্ন অর্ডার"
          value={`${data.orders_total.toLocaleString("en-US")}টি`}
          icon={ShoppingBag}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          subLabel="সকল স্ট্যাটাস মিলিয়ে"
        />
        <MetricCard
          label="গড় অর্ডার মূল্য (AOV)"
          value={formatTaka(data.avg_order_value)}
          icon={ShoppingCart}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          subLabel="প্রতি অর্ডারে গড় আয়"
        />
        <MetricCard
          label="নতুন নিবন্ধিত গ্রাহক"
          value={`${data.new_customers_count.toLocaleString("en-US")} জন`}
          icon={Users}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          subLabel="এই সময়সীমায় যুক্ত হয়েছেন"
        />
      </div>

      {/* Sales Trend Chart */}
      <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
              <TrendingUp className="w-4 h-4 text-[#f47920]" />
              <span>দৈনিক বিক্রয় ও রেভিনিউ ট্রেন্ড (Sales Curve)</span>
            </h2>
            <span className="text-[11px] text-muted-foreground font-semibold">
              নির্বাচিত সময়সীমা: গত {range} দিন
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sales} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f47920" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f47920" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `৳${Math.round(Number(v) / 1000)}k`}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #fed7aa",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [formatTaka(value as number), "মোট বিক্রয়"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f47920"
                  strokeWidth={3}
                  fill="url(#salesGrad)"
                  dot={{ r: 3, fill: "#f47920" }}
                  activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Grid for Orders by Status & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Orders by Status */}
        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white">
          <CardContent className="p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>স্ট্যাটাস অনুযায়ী অর্ডার বণ্টন</span>
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={statusBars} margin={{ top: 8, right: 16, left: 24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#374151", fontSize: 11, fontWeight: "600" }} axisLine={false} tickLine={false} width={130} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                    formatter={(v) => [`${v}টি অর্ডার`, "সংখ্যা"]}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {statusBars.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.key] ?? "#9ca3af"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white">
          <CardContent className="p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>শীর্ষ বিক্রিত ক্যাটাগরি (Top Categories)</span>
            </h2>
            {pie.length === 0 ? (
              <p className="text-xs text-muted-foreground py-16 text-center" lang="bn">
                পরিশোধিত কোনো ক্যাটাগরি বিক্রয় তথ্য পাওয়া যায়নি।
              </p>
            ) : (
              <>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {pie.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #e5e7eb" }}
                        formatter={(v) => formatTaka(v as number)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {data.top_categories.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-gray-900 text-[11px]">{c.name}</p>
                        <p className="font-mono text-[10px] text-[#f47920] font-bold">{formatTaka(c.sales)} ({c.count}টি)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
