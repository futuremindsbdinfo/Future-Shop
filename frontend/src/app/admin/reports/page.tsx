"use client";

import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faChartBar,
  faCircleDollarToSlot,
  faDownload,
  faPercent,
  faSackDollar,
  faShoppingBag,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyChart } from "@/components/shared/EmptyChart";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { ProductsReportRow, SalesReport, VendorsReportRow } from "@/types";

const TK = "৳";
const fmtNum = (n: number) => n.toLocaleString("en-US");

function todayStr(): string { return new Date().toISOString().slice(0, 10); }
function daysAgoStr(d: number): string {
  return new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10);
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#9ca3af",
  confirmed: "#3b82f6",
  processing: "#f97316",
  shipped: "#0ea5e9",
  delivered: "#22c55e",
  cancelled: "#dc2626",
};

type TabKey = "sales" | "products" | "vendors";

function MarginBar({ pct }: { pct: number }) {
  const clamped = Math.max(-100, Math.min(100, pct));
  const positive = clamped >= 0;
  const width = Math.min(Math.abs(clamped), 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#f3f4f6]">
        <div className={`h-full ${positive ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${width}%` }} />
      </div>
      <span className={`text-xs font-medium ${positive ? "text-green-700" : "text-red-600"}`}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

function StatTile({ label, value, icon, color = "text-[#f47920]", bg = "bg-orange-100" }: {
  label: string; value: string; icon: typeof faChartBar; color?: string; bg?: string;
}) {
  return (
    <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg}`}>
          <FontAwesomeIcon icon={icon} className={`h-4 w-4 ${color}`} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#6b7280]">{label}</p>
          <p className="truncate text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminReportsPage() {
  const [from, setFrom] = useState(daysAgoStr(29));
  const [to, setTo] = useState(todayStr());
  const [tab, setTab] = useState<TabKey>("sales");

  const [sales, setSales] = useState<SalesReport | null>(null);
  const [products, setProducts] = useState<ProductsReportRow[] | null>(null);
  const [vendors, setVendors] = useState<VendorsReportRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sp = `from=${from}&to=${to}`;
      if (tab === "sales") {
        const r = await api.get<{ data: SalesReport }>(`/admin/reports/sales?${sp}`);
        setSales(r.data.data);
      } else if (tab === "products") {
        const r = await api.get<{ data: { rows: ProductsReportRow[] } }>(`/admin/reports/products?${sp}`);
        setProducts(r.data.data.rows);
      } else {
        const r = await api.get<{ data: { rows: VendorsReportRow[] } }>(`/admin/reports/vendors?${sp}`);
        setVendors(r.data.data.rows);
      }
    } finally {
      setLoading(false);
    }
  }, [from, to, tab]);

  useEffect(() => { load(); }, [load]);

  const exportCsv = async () => {
    try {
      const res = await api.get(`/admin/reports/export?type=${tab}&from=${from}&to=${to}`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${tab}-${from}-to-${to}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-[11px] text-[#6b7280]">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 w-40" />
          </div>
          <div>
            <label className="block text-[11px] text-[#6b7280]">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-11 w-40" />
          </div>
          <Button onClick={exportCsv} className="h-11 bg-gradient-to-r from-[#f47920] to-[#fb923c] text-white hover:opacity-90">
            <FontAwesomeIcon icon={faDownload} className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["sales", "products", "vendors"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-11 rounded-md px-4 text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-[#f47920] text-white" : "border border-[#e5e7eb] text-[#374151] hover:bg-[#fff7ed]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : tab === "sales" && sales ? (
        <SalesTabContent sales={sales} />
      ) : tab === "products" && products ? (
        <ProductsTab rows={products} />
      ) : tab === "vendors" && vendors ? (
        <VendorsTab rows={vendors} />
      ) : (
        <p className="text-sm text-muted-foreground">No data.</p>
      )}
    </div>
  );
}

/* --------------------------- Sales tab --------------------------- */
function SalesTabContent({ sales }: { sales: SalesReport }) {
  const daily = sales.daily_breakdown.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  const pay = [
    { name: "COD", value: sales.payment_breakdown.cod, color: "#f47920" },
    { name: "Online", value: sales.payment_breakdown.sslcommerz, color: "#3b82f6" },
  ].filter((s) => s.value > 0);
  const payDisplay = pay.length === 0 ? [{ name: "—", value: 1, color: "#e5e7eb" }] : pay;

  const statusBars = Object.entries(sales.status_breakdown).map(([key, value]) => ({ name: key, value, key }));

  return (
    <div className="space-y-6">
      {/* 6 summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatTile label="Revenue" value={formatTaka(sales.summary.total_revenue)} icon={faCircleDollarToSlot} />
        <StatTile label="Orders" value={fmtNum(sales.summary.total_orders)} icon={faShoppingBag} color="text-blue-600" bg="bg-blue-100" />
        <StatTile label="Cost" value={formatTaka(sales.summary.total_cost)} icon={faSackDollar} color="text-red-600" bg="bg-red-100" />
        <StatTile label="Gross Profit" value={formatTaka(sales.summary.gross_profit)} icon={faChartBar} color="text-green-700" bg="bg-green-100" />
        <StatTile label="Profit Margin" value={`${Number(sales.summary.profit_margin).toFixed(1)}%`} icon={faPercent} color="text-purple-600" bg="bg-purple-100" />
        <StatTile label="Avg Order Value" value={formatTaka(sales.summary.avg_order_value)} icon={faCartShopping} />
      </div>

      {/* Daily revenue/profit chart */}
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="p-6">
          <h2 className="mb-4 text-base font-semibold">Daily Revenue & Profit</h2>
          <div className="h-72 w-full">
            {sales.summary.total_orders === 0 ? (
              <EmptyChart message="No sales in this period" />
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f47920" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f47920" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${TK}${Math.round(Number(v) / 1000)}k`}
                  width={50}
                />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v) => formatTaka(v as number)} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f47920" strokeWidth={2.5} fill="url(#revFill)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#16a34a" strokeWidth={2} fill="url(#profitFill)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Payment method donut */}
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold">Payment Methods</h2>
            <div className="h-56 w-full">
              {pay.length === 0 ? (
                <EmptyChart message="No payment data yet" />
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={payDisplay} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="none">
                    {payDisplay.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v) => formatTaka(v as number)} />
                </PieChart>
              </ResponsiveContainer>
              )}
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#f47920]" />COD <span className="ml-auto font-medium">{formatTaka(sales.payment_breakdown.cod)}</span></li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Online <span className="ml-auto font-medium">{formatTaka(sales.payment_breakdown.sslcommerz)}</span></li>
            </ul>
          </CardContent>
        </Card>

        {/* Order status horizontal bars */}
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold">Order Status</h2>
            <div className="h-56 w-full">
              {statusBars.every((s) => s.value === 0) ? (
                <EmptyChart message="No orders in this period" />
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={statusBars} margin={{ top: 8, right: 16, left: 16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusBars.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.key] ?? "#9ca3af"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProductsTab({ rows }: { rows: ProductsReportRow[] }) {
  return (
    <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No products sold in this range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f3f4f6] text-left text-[11px] uppercase tracking-wide text-[#9ca3af]">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Units Sold</th>
                  <th className="px-4 py-3 font-medium">Revenue</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Profit</th>
                  <th className="px-4 py-3 font-medium">Margin</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.product_name} className="border-b border-[#f3f4f6] last:border-0">
                    <td className="max-w-[220px] truncate px-4 py-3 font-medium">{r.product_name}</td>
                    <td className="px-4 py-3">{r.units_sold}</td>
                    <td className="px-4 py-3">{formatTaka(r.revenue)}</td>
                    <td className="px-4 py-3 text-red-600">{formatTaka(r.cost)}</td>
                    <td className={`px-4 py-3 font-medium ${r.profit >= 0 ? "text-green-700" : "text-red-600"}`}>{formatTaka(r.profit)}</td>
                    <td className="px-4 py-3"><MarginBar pct={r.margin} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VendorsTab({ rows }: { rows: VendorsReportRow[] }) {
  return (
    <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No vendor activity in this range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f3f4f6] text-left text-[11px] uppercase tracking-wide text-[#9ca3af]">
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Orders</th>
                  <th className="px-4 py-3 font-medium">Revenue</th>
                  <th className="px-4 py-3 font-medium">Commission Earned</th>
                  <th className="px-4 py-3 font-medium">Products</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.vendor_name} className="border-b border-[#f3f4f6] last:border-0">
                    <td className="px-4 py-3 font-medium">{r.vendor_name}</td>
                    <td className="px-4 py-3">{r.orders_count}</td>
                    <td className="px-4 py-3">{formatTaka(r.revenue)}</td>
                    <td className="px-4 py-3 text-[#f47920]">{formatTaka(r.commission_earned)}</td>
                    <td className="px-4 py-3">{r.products_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
