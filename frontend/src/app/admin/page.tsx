"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faBoxArchive,
  faCartShopping,
  faCircleInfo,
  faDownload,
  faEnvelope,
  faHeart,
  faLink,
  faShareNodes,
  faShoppingBag,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyChart } from "@/components/shared/EmptyChart";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { DashboardStats, Order, PaginatedResponse, Product } from "@/types";

const TK = "৳";
const fmtNum = (v: number) => v.toLocaleString("en-US");

/* ------------------------------ Mock data ------------------------------ */
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const THIS_WEEK = [42000, 51000, 38000, 64000, 58000, 78000, 95000];
const LAST_WEEK = [38000, 45000, 34000, 52000, 48000, 65000, 71000];
const WEEKLY_DATA = WEEK_DAYS.map((d, i) => ({ day: d, thisWeek: THIS_WEEK[i], lastWeek: LAST_WEEK[i] }));

const CUSTOMER_GROWTH = [
  { name: "New Customers", value: 42, color: "#3b82f6" },
  { name: "Returning Customers", value: 28, color: "#22c55e" },
  { name: "Inactive", value: 15, color: "#f47920" },
];

const TRAFFIC_SOURCES = [
  { name: "Google", icon: "G", iconBg: "bg-blue-500", pct: 45.2 },
  { name: "Direct", icon: faLink, iconBg: "bg-purple-500", pct: 24.6 },
  { name: "Referral", icon: faShareNodes, iconBg: "bg-orange-500", pct: 15.8 },
  { name: "Social Media", icon: faHeart, iconBg: "bg-pink-500", pct: 9.7 },
  { name: "Email", icon: faEnvelope, iconBg: "bg-cyan-500", pct: 4.7 },
] as const;

/* ----------------------- Order status configuration --------------------- */
type StatusKey = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
const STATUS_LABEL: Record<StatusKey, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Completed",
  cancelled: "Cancelled",
};
const STATUS_PILL_CLASS: Record<StatusKey, string> = {
  pending: "bg-gray-100 text-gray-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};
const STATUS_ICON_BG: Record<StatusKey, string> = {
  pending: "bg-gray-500",
  confirmed: "bg-blue-500",
  processing: "bg-blue-500",
  shipped: "bg-orange-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

/* --------------------------- Helper components -------------------------- */
function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  changePct,
  positive = true,
}: {
  label: string;
  value: string;
  icon: typeof faCartShopping;
  iconBg: string;
  iconColor: string;
  changePct: number;
  positive?: boolean;
}) {
  return (
    <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#6b7280]">{label}</p>
            <p className="mt-2 truncate text-[24px] font-bold text-[#111827]">{value}</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}
              >
                <FontAwesomeIcon icon={positive ? faArrowUp : faArrowDown} className="h-2.5 w-2.5" />
                {Math.abs(changePct).toFixed(1)}%
              </span>
              <span className="text-[11px] text-[#9ca3af]">vs last week</span>
            </div>
          </div>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
            <FontAwesomeIcon icon={icon} className={`h-4 w-4 ${iconColor}`} />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Skeleton className="h-80 rounded-xl lg:col-span-3" />
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Skeleton className="h-72 rounded-xl lg:col-span-5" />
        <Skeleton className="h-72 rounded-xl lg:col-span-4" />
        <Skeleton className="h-72 rounded-xl lg:col-span-3" />
      </div>
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */
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
      setError(e instanceof Error ? e.message : "Failed to load dashboard data");
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
      <Card className="rounded-xl">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={load} className="h-11 bg-gradient-to-r from-[#f47920] to-[#fb923c] text-white">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const recentFive = stats.recent_orders.slice(0, 5);
  // Mock "sold" data for the top products list (real data needs a sales aggregate).
  const productsSold = topProducts.map((p, i) => ({
    product: p,
    sold: [124, 87, 65, 52, 41][i] ?? 30,
  }));
  const maxSold = Math.max(1, ...productsSold.map((p) => p.sold));

  const growthTotal = CUSTOMER_GROWTH.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Welcome back, {user?.name ?? "Admin"}! 👋
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-[#6b7280] sm:inline">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <Button
            className="h-11 bg-gradient-to-r from-[#f47920] to-[#fb923c] text-white hover:opacity-90"
            onClick={() => {
              /* export placeholder */
            }}
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatTaka(stats.total_revenue)}
          icon={faCartShopping}
          iconBg="bg-orange-100"
          iconColor="text-[#f47920]"
          changePct={12.5}
          positive
        />
        <StatCard
          label="Total Orders"
          value={fmtNum(stats.total_orders)}
          icon={faShoppingBag}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          changePct={8.3}
          positive
        />
        <StatCard
          label="Total Customers"
          value={fmtNum(stats.total_customers ?? 0)}
          icon={faUsers}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          changePct={16.2}
          positive
        />
        <StatCard
          label="Total Products"
          value={fmtNum(stats.total_products ?? 0)}
          icon={faBoxArchive}
          iconBg="bg-orange-100"
          iconColor="text-[#f47920]"
          changePct={-2.4}
          positive={false}
        />
      </div>

      {/* CHARTS ROW — Sales Overview (65%) + Top Products (35%) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm lg:col-span-3">
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                Sales Overview
                <FontAwesomeIcon icon={faCircleInfo} className="h-3.5 w-3.5 text-[#9ca3af]" title="Sales for the selected week" />
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWeekToggle("thisWeek")}
                  className={`h-8 rounded-md px-3 text-xs font-medium transition-colors ${
                    weekToggle === "thisWeek"
                      ? "bg-[#f47920] text-white"
                      : "border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb]"
                  }`}
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => setWeekToggle("lastWeek")}
                  className={`h-8 rounded-md px-3 text-xs font-medium transition-colors ${
                    weekToggle === "lastWeek"
                      ? "bg-[#f47920] text-white"
                      : "border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb]"
                  }`}
                >
                  Last Week
                </button>
              </div>
            </div>
            <div className="h-72 w-full">
              {stats.total_orders === 0 ? (
                <EmptyChart message="No sales data yet" />
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEEKLY_DATA} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${TK}${Math.round(Number(v) / 1000)}k`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }}
                    formatter={(value, name) => [formatTaka(value as number), name === "thisWeek" ? "This Week" : "Last Week"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="thisWeek"
                    stroke="#f47920"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#f47920" }}
                    activeDot={{ r: 5 }}
                    strokeOpacity={weekToggle === "thisWeek" ? 1 : 0.35}
                  />
                  <Line
                    type="monotone"
                    dataKey="lastWeek"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: "#9ca3af" }}
                    strokeOpacity={weekToggle === "lastWeek" ? 1 : 0.35}
                  />
                </LineChart>
              </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Top Products</h2>
              <Link href="/admin/products" className="text-xs font-medium text-[#f47920] hover:underline">
                View all
              </Link>
            </div>
            {productsSold.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet</p>
            ) : (
              <ul className="space-y-4">
                {productsSold.map(({ product, sold }) => {
                  const img = product.images?.[0]?.url ?? null;
                  const pct = (sold / maxSold) * 100;
                  return (
                    <li key={product.id}>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-orange-100">
                          {img ? (
                            <Image src={img} alt={product.name} fill sizes="40px" className="object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#f47920]">
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#111827]">{product.name}</p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-[#6b7280]">{sold} Sold</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#f3f4f6]">
                        <div
                          className="h-full bg-gradient-to-r from-[#f47920] to-[#fb923c]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM ROW: Recent Orders (40%) + Customer Growth (35%) + Traffic Source (25%) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Recent Orders */}
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm lg:col-span-5">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs font-medium text-[#f47920] hover:underline">
                View all
              </Link>
            </div>
            {recentFive.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            ) : (
              <ul className="divide-y divide-[#f3f4f6]">
                {recentFive.map((order: Order) => {
                  const sk = order.order_status as StatusKey;
                  return (
                    <li
                      key={order.id}
                      onClick={() => (window.location.href = "/admin/orders")}
                      className="flex cursor-pointer items-center gap-3 py-3 hover:bg-[#f9fafb]"
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${STATUS_ICON_BG[sk] ?? "bg-gray-500"}`}>
                        <FontAwesomeIcon icon={faShoppingBag} className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-xs font-semibold">{order.order_number}</p>
                        <p className="truncate text-[11px] text-[#9ca3af]">
                          {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">{formatTaka(order.total)}</span>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_PILL_CLASS[sk] ?? "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABEL[sk] ?? order.order_status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm lg:col-span-4">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Customer Growth</h2>
              <select
                value={growthMonth}
                onChange={(e) => setGrowthMonth(e.target.value)}
                className="h-8 rounded-md border border-[#e5e7eb] bg-transparent px-2 text-xs"
                aria-label="Month range"
              >
                <option value="12">This Month</option>
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
              </select>
            </div>
            <div className="relative h-44 w-full">
              {growthTotal === 0 ? (
                <EmptyChart message="No customer data yet" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={CUSTOMER_GROWTH} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} stroke="none">
                        {CUSTOMER_GROWTH.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-2xl font-bold">{growthTotal}</p>
                    <p className="text-[11px] text-[#6b7280]">Total</p>
                  </div>
                </>
              )}
            </div>
            <ul className="mt-4 space-y-2 text-xs">
              {CUSTOMER_GROWTH.map((seg) => {
                const pct = growthTotal > 0 ? Math.round((seg.value / growthTotal) * 100) : 0;
                return (
                  <li key={seg.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: seg.color }} />
                    <span className="flex-1 text-[#374151]">{seg.name}</span>
                    <span className="font-medium">{seg.value}</span>
                    <span className="text-[#9ca3af]">({pct}%)</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        {/* Traffic Source */}
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm lg:col-span-3">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Traffic Source</h2>
              <button type="button" className="text-xs font-medium text-[#f47920] hover:underline">
                View report
              </button>
            </div>
            <ul className="space-y-4">
              {TRAFFIC_SOURCES.map((src) => (
                <li key={src.name}>
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white ${src.iconBg}`}>
                      {typeof src.icon === "string" ? (
                        <span className="text-[11px] font-bold">{src.icon}</span>
                      ) : (
                        <FontAwesomeIcon icon={src.icon} className="h-3 w-3" />
                      )}
                    </span>
                    <span className="flex-1 truncate text-sm">{src.name}</span>
                    <span className="shrink-0 text-xs font-semibold text-[#6b7280]">{src.pct.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#f3f4f6]">
                    <div
                      className="h-full bg-gradient-to-r from-[#f47920] to-[#fb923c]"
                      style={{ width: `${src.pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
