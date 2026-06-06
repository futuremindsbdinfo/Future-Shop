"use client";

import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faCartShopping,
  faCircleDollarToSlot,
  faShoppingBag,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
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
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { AnalyticsData } from "@/types";

const TK = "৳";
const fmtTk = (v: number | string) => `${TK}${Number(v).toLocaleString("en-US")}`;
const fmtNum = (n: number) => n.toLocaleString("en-US");

const STATUS_COLORS: Record<string, string> = {
  pending: "#9ca3af",
  confirmed: "#3b82f6",
  processing: "#f97316",
  shipped: "#0ea5e9",
  delivered: "#22c55e",
  cancelled: "#dc2626",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const PIE_COLORS = ["#f47920", "#fb923c", "#3b82f6", "#22c55e", "#a855f7"];

type Range = "7" | "30" | "90";

function MetricCard({
  label, value, icon, iconBg, iconColor, growthPct,
}: {
  label: string;
  value: string;
  icon: typeof faShoppingBag;
  iconBg: string;
  iconColor: string;
  growthPct: number | null;
}) {
  const positive = (growthPct ?? 0) >= 0;
  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#6b7280]">{label}</p>
            <p className="mt-2 truncate text-[22px] font-bold">{value}</p>
            {growthPct !== null && (
              <span
                className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}
              >
                <FontAwesomeIcon icon={positive ? faArrowUp : faArrowDown} className="h-2.5 w-2.5" />
                {Math.abs(growthPct).toFixed(1)}%
              </span>
            )}
          </div>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
            <FontAwesomeIcon icon={icon} className={`h-4 w-4 ${iconColor}`} />
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
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
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
  if (!data) return <p className="text-sm text-muted-foreground">No data.</p>;

  // Recharts data shapes.
  const sales = data.sales_by_day.map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: p.revenue,
    orders: p.orders,
  }));
  const statusBars = Object.entries(data.orders_by_status).map(([key, value]) => ({
    name: STATUS_LABEL[key] ?? key,
    value,
    key,
  }));
  const pie = data.top_categories.map((c) => ({ name: c.name, value: c.sales }));

  return (
    <div className="space-y-6">
      {/* Header + range selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-2">
          {(["7", "30", "90"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`h-9 rounded-md px-3 text-xs font-medium transition-colors ${
                range === r ? "bg-[#f47920] text-white" : "border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb]"
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Total Revenue"
          value={fmtTk(data.revenue_total)}
          icon={faCircleDollarToSlot}
          iconBg="bg-orange-100"
          iconColor="text-[#f47920]"
          growthPct={data.revenue_growth}
        />
        <MetricCard
          label="Total Orders"
          value={fmtNum(data.orders_total)}
          icon={faShoppingBag}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          growthPct={null}
        />
        <MetricCard
          label="Avg Order Value"
          value={fmtTk(data.avg_order_value)}
          icon={faCartShopping}
          iconBg="bg-green-100"
          iconColor="text-green-700"
          growthPct={null}
        />
        <MetricCard
          label="New Customers"
          value={fmtNum(data.new_customers_count)}
          icon={faUsers}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          growthPct={null}
        />
      </div>

      {/* Sales trend */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-6">
          <h2 className="mb-4 text-base font-semibold">Sales Trend</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sales} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f47920" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f47920" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${TK}${Math.round(Number(v) / 1000)}k`}
                  width={50}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }}
                  formatter={(value) => fmtTk(value as number)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f47920" strokeWidth={2.5} fill="url(#salesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Orders by status (horizontal bars) */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold">Orders by Status</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={statusBars} margin={{ top: 8, right: 16, left: 16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusBars.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.key] ?? "#9ca3af"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top categories donut */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold">Top Categories</h2>
            {pie.length === 0 ? (
              <p className="text-sm text-muted-foreground">No paid sales yet — categories appear after first paid order.</p>
            ) : (
              <>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={2} stroke="none">
                        {pie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v) => fmtTk(v as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-4 space-y-2 text-xs">
                  {data.top_categories.map((c, i) => (
                    <li key={c.name} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="font-medium">{fmtTk(c.sales)}</span>
                      <span className="text-[#9ca3af]">({c.count})</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
