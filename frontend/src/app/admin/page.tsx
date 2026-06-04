"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faCartShopping,
  faClipboardList,
  faClock,
  faCreditCard,
  faDatabase,
  faGauge,
  faImage,
  faLocationDot,
  faMessage,
  faPlus,
  faServer,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import {
  Area,
  AreaChart,
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
import api from "@/lib/api";
import type { DashboardStats, Order, PaginatedResponse, Product, Vendor } from "@/types";

const TK = "৳";
const fmtTk = (v: number | string) => `${TK}${Number(v).toLocaleString("en-US")}`;

/* ------------------------------ Mock data ------------------------------ */
// Monthly sales for the line chart (mock data; replace with real API later).
const MONTHLY_SALES = [
  120000, 180000, 150000, 220000, 190000, 280000,
  240000, 310000, 270000, 350000, 290000, 420000,
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SALES_DATA = MONTHLY_SALES.map((v, i) => ({ month: MONTHS[i], sales: v }));

// Tiny sparkline arrays for the stat cards.
const sparkline = (vals: number[]) => vals.map((v, i) => ({ i, v }));
const SPARK_REVENUE = sparkline([20, 28, 24, 32, 30, 38, 36, 44]);
const SPARK_ORDERS = sparkline([5, 9, 7, 11, 9, 13, 12, 16]);
const SPARK_VENDORS = sparkline([2, 3, 3, 4, 5, 5, 6, 7]);
const SPARK_PENDING = sparkline([4, 5, 3, 6, 4, 5, 3, 2]);

/* --------------------- Order status (all English) ---------------------- */
type StatusKey = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
const STATUS_COLORS: Record<StatusKey, string> = {
  pending: "#9ca3af",      // gray
  confirmed: "#1a6bdf",    // blue
  processing: "#f97316",   // orange
  shipped: "#1a6bdf",      // blue (same family as confirmed)
  delivered: "#16a34a",    // green
  cancelled: "#dc2626",    // red
};
const STATUS_BADGE_CLASS: Record<StatusKey, string> = {
  pending: "border-gray-300 text-gray-700",
  confirmed: "border-blue-300 text-blue-700",
  processing: "border-orange-300 text-orange-700",
  shipped: "border-blue-300 text-blue-700",
  delivered: "border-green-300 text-green-700",
  cancelled: "border-red-300 text-red-700",
};
const STATUS_LABEL: Record<StatusKey, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const STATUS_ORDER: StatusKey[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

/* ----------------------------- Quick actions ---------------------------- */
const QUICK_ACTIONS = [
  { label: "Add Product", href: "/admin/products/new", icon: faPlus, color: "#1a6bdf" },
  { label: "View Orders", href: "/admin/orders", icon: faClipboardList, color: "#f97316" },
  { label: "Add Vendor", href: "/admin/vendors", icon: faStore, color: "#16a34a" },
  { label: "Zone Settings", href: "/admin/zones", icon: faLocationDot, color: "#7c3aed" },
] as const;

/* ----------------------------- System status ---------------------------- */
const SYSTEM_STATUS = [
  { label: "Database", value: "Active", icon: faDatabase, color: "bg-green-500" },
  { label: "Payment Gateway", value: "Sandbox", icon: faCreditCard, color: "bg-yellow-500" },
  { label: "SMS Service", value: "Not Connected", icon: faMessage, color: "bg-red-500" },
  { label: "Storage", value: "Local", icon: faServer, color: "bg-blue-500" },
  { label: "Cache", value: "Active", icon: faGauge, color: "bg-green-500" },
];

/* --------------------------- Helper components -------------------------- */
function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
  sparkData,
  sparkColor,
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
  icon: typeof faCartShopping;
  iconBg: string;
  iconColor: string;
  sparkData: { i: number; v: number }[];
  sparkColor: string;
}) {
  const gradientId = `spark-${sparkColor.replace("#", "")}`;
  return (
    <Card className="overflow-hidden rounded-xl border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#6b7280]">{label}</p>
            <p className="mt-1 truncate text-[22px] font-bold text-[#111827]">{value}</p>
            <div className="mt-1 text-[11px] text-[#6b7280]">{sub}</div>
          </div>
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
            <FontAwesomeIcon icon={icon} className={`h-4 w-4 ${iconColor}`} />
          </span>
        </div>
        <div className="-mx-2 -mb-2 mt-3 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparkColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ChangeBadge({ pct }: { pct: number }) {
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
      <FontAwesomeIcon icon={faArrowUp} className="h-2.5 w-2.5" />
      {pct}%
    </span>
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [recentVendors, setRecentVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("12"); // last 12 months

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, p, v] = await Promise.all([
        api.get<{ data: DashboardStats }>("/admin/dashboard"),
        api.get<PaginatedResponse<Product>>("/admin/products?per_page=5"),
        api.get<PaginatedResponse<Vendor>>("/admin/vendors?per_page=5"),
      ]);
      setStats(d.data.data);
      setTopProducts(p.data.data);
      setRecentVendors(v.data.data);
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
          <Button onClick={load} className="h-11 bg-[#1a6bdf] hover:bg-[#1559bd]">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  // Derive status counts from recent_orders.
  const statusCounts: Record<StatusKey, number> = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const order of stats.recent_orders) {
    const key = order.order_status as StatusKey;
    if (key in statusCounts) statusCounts[key]++;
  }
  const totalStatusCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const pieData =
    totalStatusCount > 0
      ? STATUS_ORDER.filter((k) => statusCounts[k] > 0).map((k) => ({
          name: STATUS_LABEL[k],
          value: statusCounts[k],
          key: k,
        }))
      : [{ name: STATUS_LABEL.pending, value: 1, key: "pending" as StatusKey }];

  const recentFive = stats.recent_orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Sales"
          value={fmtTk(stats.total_revenue)}
          sub={<>This Month<ChangeBadge pct={12} /></>}
          icon={faCartShopping}
          iconBg="bg-blue-100"
          iconColor="text-[#1a6bdf]"
          sparkData={SPARK_REVENUE}
          sparkColor="#1a6bdf"
        />
        <StatCard
          label="Total Orders"
          value={stats.total_orders.toLocaleString("en-US")}
          sub={<>{stats.pending_orders} pending</>}
          icon={faClipboardList}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          sparkData={SPARK_ORDERS}
          sparkColor="#f97316"
        />
        <StatCard
          label="Active Vendors"
          value={stats.active_vendors.toLocaleString("en-US")}
          sub="Active sellers"
          icon={faStore}
          iconBg="bg-green-100"
          iconColor="text-green-700"
          sparkData={SPARK_VENDORS}
          sparkColor="#16a34a"
        />
        <StatCard
          label="Pending Orders"
          value={stats.pending_orders.toLocaleString("en-US")}
          sub="Pending Delivery"
          icon={faClock}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          sparkData={SPARK_PENDING}
          sparkColor="#dc2626"
        />
      </div>

      {/* SECTION 2 — Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Sales line chart */}
        <Card className="rounded-xl shadow-sm lg:col-span-3">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Sales Overview</h2>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                aria-label="Select month range"
              >
                <option value="12">Last 12 months</option>
                <option value="6">Last 6 months</option>
                <option value="3">Last 3 months</option>
              </select>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SALES_DATA.slice(-Number(selectedMonth))} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a6bdf" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#1a6bdf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
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
                    labelStyle={{ color: "#374151" }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#1a6bdf" strokeWidth={2.5} fill="url(#salesFill)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order status donut */}
        <Card className="rounded-xl shadow-sm lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold">Order Status</h2>
            <div className="relative h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={STATUS_COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-2xl font-bold">{stats.total_orders}</p>
                <p className="text-[11px] text-[#6b7280]">Total Orders</p>
              </div>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              {STATUS_ORDER.map((k) => (
                <li key={k} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: STATUS_COLORS[k] }} />
                  <span className="truncate">{STATUS_LABEL[k]}</span>
                  <span className="ml-auto text-[#6b7280]">{statusCounts[k]}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3 — Tables */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent orders */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs font-medium text-[#1a6bdf] hover:underline">
                View All
              </Link>
            </div>
            {recentFive.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-[#9ca3af]">
                      <th className="pb-2 font-medium">Order</th>
                      <th className="pb-2 font-medium">Customer</th>
                      <th className="pb-2 font-medium">Total</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentFive.map((order: Order) => {
                      const sk = order.order_status as StatusKey;
                      return (
                        <tr
                          key={order.id}
                          className="cursor-pointer border-t border-[#f3f4f6] hover:bg-[#f9fafb]"
                          onClick={() => (window.location.href = "/admin/orders")}
                        >
                          <td className="py-2 font-mono text-xs">{order.order_number}</td>
                          <td className="py-2">{order.user?.name ?? "—"}</td>
                          <td className="py-2 font-medium">{fmtTk(order.total)}</td>
                          <td className="py-2">
                            <Badge variant="outline" className={STATUS_BADGE_CLASS[sk] ?? ""}>
                              {STATUS_LABEL[sk] ?? order.order_status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Top Products</h2>
              <Link href="/admin/products" className="text-xs font-medium text-[#1a6bdf] hover:underline">
                View All
              </Link>
            </div>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet</p>
            ) : (
              <div className="overflow-x-auto">
                <ul className="divide-y divide-[#f3f4f6]">
                  {topProducts.map((product) => {
                    const img = product.images?.[0]?.url ?? null;
                    const inStock = product.stock_quantity > 0;
                    return (
                      <li key={product.id} className="flex items-center gap-3 py-2">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                          {img ? (
                            <Image src={img} alt={product.name} fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <FontAwesomeIcon icon={faImage} className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <p className="truncate text-[11px] text-[#9ca3af]">{product.category?.name ?? "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{fmtTk(product.sale_price ?? product.price)}</p>
                          <Badge
                            variant="outline"
                            className={inStock ? "border-green-300 text-green-700" : "border-red-300 text-red-600"}
                          >
                            {inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION 4 — Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Quick actions */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-start gap-2 rounded-lg border border-[#e5e7eb] p-3 transition-colors hover:border-[#1a6bdf] hover:bg-[#eff6ff]"
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                    style={{ background: action.color }}
                  >
                    <FontAwesomeIcon icon={action.icon} className="h-4 w-4" />
                  </span>
                  <span className="text-[12px] font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent vendors */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold">Recent Vendors</h2>
            {recentVendors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No vendors yet</p>
            ) : (
              <ul className="space-y-3">
                {recentVendors.map((vendor) => (
                  <li key={vendor.id} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a6bdf] text-sm font-semibold text-white">
                      {vendor.shop_name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{vendor.shop_name}</p>
                      <p className="truncate text-[11px] text-[#9ca3af]">Commission {Number(vendor.commission_rate)}%</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        vendor.status === "approved"
                          ? "border-green-300 text-green-700"
                          : vendor.status === "suspended"
                            ? "border-red-300 text-red-600"
                            : "border-amber-300 text-amber-700"
                      }
                    >
                      {vendor.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* System status */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold">System Status</h2>
            <ul className="space-y-3">
              {SYSTEM_STATUS.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f3f4f6] text-[#6b7280]">
                    <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 text-sm">{item.label}</span>
                  <span className="flex items-center gap-1.5 text-[12px]">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span>{item.value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
