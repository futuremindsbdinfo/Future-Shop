"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp,
  CircleDollarSign,
  ShoppingBag,
  ShoppingCart,
  Download,
  Calendar,
  Layers,
  Truck,
  Store,
  FileSpreadsheet,
  CheckCircle2,
  Percent,
  Wallet,
  Phone,
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
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyChart } from "@/components/shared/EmptyChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { ProductsReportRow, SalesReport, VendorsReportRow } from "@/types";

interface DeliveryReportRow {
  id: number;
  name: string;
  phone: string | null;
  assigned_count: number;
  delivered_count: number;
  pending_count: number;
  cancelled_count: number;
  success_rate: number;
  collected_cash: number;
  today_count: number;
  week_count: number;
  month_count: number;
}

function getLocalDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayStr(): string {
  return getLocalDateString(new Date());
}

function daysAgoStr(d: number): string {
  const date = new Date(Date.now() - d * 86_400_000);
  return getLocalDateString(date);
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#f97316",
  shipped: "#0ea5e9",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const STATUS_LABEL_BN: Record<string, string> = {
  pending: "পেন্ডিং",
  confirmed: "কনফার্মড",
  processing: "প্রসেসিং",
  shipped: "শিপড",
  delivered: "ডেলিভার্ড",
  cancelled: "বাতিল",
};

type TabKey = "sales" | "products" | "vendors" | "delivery";
const TAB_KEYS: TabKey[] = ["sales", "products", "vendors", "delivery"];

function MarginBar({ pct }: { pct: number }) {
  const clamped = Math.max(-100, Math.min(100, pct));
  const positive = clamped >= 0;
  const width = Math.min(Math.abs(clamped), 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full ${positive ? "bg-emerald-500" : "bg-red-500"}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span
        className={`text-[11px] font-bold font-mono ${
          positive ? "text-emerald-700" : "text-red-600"
        }`}
      >
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  color = "text-[#f47920]",
  bg = "bg-orange-50",
}: {
  label: string;
  value: string;
  icon: typeof CircleDollarSign;
  color?: string;
  bg?: string;
}) {
  return (
    <Card className="rounded-2xl border border-gray-200 shadow-xs bg-white">
      <CardContent className="flex items-center gap-3 p-3.5 sm:p-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} shadow-2xs`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-gray-500 truncate" lang="bn">{label}</p>
          <p className="truncate text-base sm:text-lg font-black text-gray-900 font-mono mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminReportsContent() {
  const searchParams = useSearchParams();
  const initialTab = TAB_KEYS.includes(searchParams.get("tab") as TabKey)
    ? (searchParams.get("tab") as TabKey)
    : "sales";

  const [from, setFrom] = useState(daysAgoStr(29));
  const [to, setTo] = useState(todayStr());
  const [tab, setTab] = useState<TabKey>(initialTab);

  const [sales, setSales] = useState<SalesReport | null>(null);
  const [products, setProducts] = useState<ProductsReportRow[] | null>(null);
  const [vendors, setVendors] = useState<VendorsReportRow[] | null>(null);
  const [delivery, setDelivery] = useState<DeliveryReportRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

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
      } else if (tab === "vendors") {
        const r = await api.get<{ data: { rows: VendorsReportRow[] } }>(`/admin/reports/vendors?${sp}`);
        setVendors(r.data.data.rows);
      } else {
        const r = await api.get<{ data: { rows: DeliveryReportRow[] } }>(`/admin/reports/delivery?${sp}`);
        setDelivery(r.data.data.rows);
      }
    } finally {
      setLoading(false);
    }
  }, [from, to, tab]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/admin/reports/export?type=${tab}&from=${from}&to=${to}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `futureshop-report-${tab}-${from}-to-${to}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    } finally {
      setExporting(false);
    }
  };

  const setPreset = (days: number) => {
    setFrom(daysAgoStr(days));
    setTo(todayStr());
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Date Range Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              ব্যবসা ও বিক্রয় রিপোর্ট (Business Reports)
            </h1>
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
              এক্সপোর্ট সেন্টার
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            তারিখভিত্তিক বিক্রয় লাভ-ক্ষতি, পণ্য বিক্রি, ভেন্ডর কমিশন ও ডেলিভারি রিপোর্ট
          </p>
        </div>

        {/* Date Filter & Export Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 p-1 rounded-2xl">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-8 w-32 rounded-xl text-xs bg-white border-gray-200"
            />
            <span className="text-xs text-gray-400 font-bold">থেকে</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-8 w-32 rounded-xl text-xs bg-white border-gray-200"
            />
          </div>

          {tab !== "delivery" && (
            <Button
              onClick={exportCsv}
              disabled={exporting}
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{exporting ? "ডাউনলোড হচ্ছে..." : "CSV এক্সপোর্ট"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: "sales", label: "বিক্রয় ও লাভ (Sales)", icon: TrendingUp },
            { id: "products", label: "পণ্য বিক্রি (Products)", icon: Layers },
            { id: "vendors", label: "ভেন্ডর কমিশন (Vendors)", icon: Store },
            { id: "delivery", label: "ডেলিভারি রিপোর্ট (Delivery)", icon: Truck },
          ] as const
        ).map((t) => {
          const isCurrent = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isCurrent
                  ? "bg-[#f47920] text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-[#f47920]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      ) : tab === "sales" && sales ? (
        <SalesTabContent sales={sales} />
      ) : tab === "products" && products ? (
        <ProductsTab rows={products} />
      ) : tab === "vendors" && vendors ? (
        <VendorsTab rows={vendors} />
      ) : tab === "delivery" && delivery ? (
        <DeliveryTab rows={delivery} />
      ) : (
        <p className="text-xs text-muted-foreground py-16 text-center" lang="bn">কোনো ডেটা পাওয়া যায়নি।</p>
      )}

    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullHeight />}>
      <AdminReportsContent />
    </Suspense>
  );
}

/* --------------------------- Sales tab --------------------------- */
function SalesTabContent({ sales }: { sales: SalesReport }) {
  const daily = sales.daily_breakdown.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("bn-BD", { month: "short", day: "numeric" }),
  }));

  const pay = [
    { name: "ক্যাশ অন ডেলিভারি (COD)", value: sales.payment_breakdown.cod, color: "#f47920" },
    { name: "অনলাইন পেমেন্ট (SSLCommerz)", value: sales.payment_breakdown.sslcommerz, color: "#3b82f6" },
  ].filter((s) => s.value > 0);

  const statusBars = Object.entries(sales.status_breakdown).map(([key, value]) => ({
    name: STATUS_LABEL_BN[key] ?? key,
    value,
    key,
  }));

  return (
    <div className="space-y-6">
      
      {/* 6 summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatTile label="মোট বিক্রয়" value={formatTaka(sales.summary.total_revenue)} icon={CircleDollarSign} />
        <StatTile label="মোট অর্ডার" value={`${sales.summary.total_orders.toLocaleString("en-US")}টি`} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-50" />
        <StatTile label="পণ্য খরচ (Cost)" value={formatTaka(sales.summary.total_cost)} icon={Wallet} color="text-rose-600" bg="bg-rose-50" />
        <StatTile label="গ্রস লাভ (Profit)" value={formatTaka(sales.summary.gross_profit)} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
        <StatTile label="প্রফিট মার্জিন" value={`${Number(sales.summary.profit_margin).toFixed(1)}%`} icon={Percent} color="text-purple-600" bg="bg-purple-50" />
        <StatTile label="গড় অর্ডার মূল্য" value={formatTaka(sales.summary.avg_order_value)} icon={ShoppingCart} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Daily revenue/profit chart */}
      <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
              <TrendingUp className="w-4 h-4 text-[#f47920]" />
              <span>দৈনিক বিক্রয় ও লাভ গ্রাফ (Revenue vs Profit)</span>
            </h2>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f47920]" /> বিক্রয়
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> লাভ
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            {sales.summary.total_orders === 0 ? (
              <EmptyChart message="এই সময়সীমায় কোনো বিক্রয় তথ্য নেই" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f47920" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f47920" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `৳${Math.round(Number(v) / 1000)}k`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "14px", fontSize: "12px", border: "1px solid #e5e7eb" }}
                    formatter={(v) => formatTaka(v as number)}
                  />
                  <Area type="monotone" dataKey="revenue" name="বিক্রয়" stroke="#f47920" strokeWidth={2.5} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="profit" name="লাভ" stroke="#10b981" strokeWidth={2} fill="url(#profitGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment methods & Order status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Payment Methods */}
        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white">
          <CardContent className="p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-extrabold text-gray-900" lang="bn">পেমেন্ট মেথড বণ্টন</h2>
            <div className="h-52 w-full">
              {pay.length === 0 ? (
                <EmptyChart message="কোনো পেমেন্ট ডেটা নেই" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pay} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} stroke="none">
                      {pay.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} formatter={(v) => formatTaka(v as number)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-orange-50/60 border border-orange-100">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f47920]" />
                <span className="font-bold text-gray-700">COD</span>
                <span className="ml-auto font-bold font-mono text-[#f47920]">{formatTaka(sales.payment_breakdown.cod)}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="font-bold text-gray-700">অনলাইন</span>
                <span className="ml-auto font-bold font-mono text-blue-600">{formatTaka(sales.payment_breakdown.sslcommerz)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white">
          <CardContent className="p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-extrabold text-gray-900" lang="bn">অর্ডারের স্ট্যাটাস বণ্টন</h2>
            <div className="h-52 w-full">
              {statusBars.every((s) => s.value === 0) ? (
                <EmptyChart message="এই সময়ে কোনো অর্ডার নেই" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={statusBars} margin={{ top: 8, right: 16, left: 24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "#374151", fontSize: 11, fontWeight: "600" }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {statusBars.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.key] ?? "#9ca3af"} />
                      ))}
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

/* --------------------------- Products Tab --------------------------- */
function ProductsTab({ rows }: { rows: ProductsReportRow[] }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="font-bold text-xs min-w-[200px]">পণ্যের নাম</TableHead>
              <TableHead className="font-bold text-xs text-center">বিক্রিত সংখ্যা</TableHead>
              <TableHead className="font-bold text-xs">মোট বিক্রয়</TableHead>
              <TableHead className="font-bold text-xs">পণ্য ক্রয়মূল্য (Cost)</TableHead>
              <TableHead className="font-bold text-xs">অর্জিত লাভ (Profit)</TableHead>
              <TableHead className="font-bold text-xs">প্রফিট মার্জিন (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 text-xs">
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                  এই সময়ে কোনো পণ্য বিক্রয় হয়নি।
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.product_name} className="hover:bg-orange-50/20 transition-colors">
                  <TableCell className="font-bold text-gray-900 line-clamp-1">{r.product_name}</TableCell>
                  <TableCell className="text-center font-bold font-mono">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[11px]">
                      {r.units_sold}টি
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-gray-900 font-mono">{formatTaka(r.revenue)}</TableCell>
                  <TableCell className="text-rose-600 font-mono font-semibold">{formatTaka(r.cost)}</TableCell>
                  <TableCell className={`font-bold font-mono ${r.profit >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    {formatTaka(r.profit)}
                  </TableCell>
                  <TableCell>
                    <MarginBar pct={r.margin} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* --------------------------- Vendors Tab --------------------------- */
function VendorsTab({ rows }: { rows: VendorsReportRow[] }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="font-bold text-xs min-w-[180px]">ভেন্ডরের নাম</TableHead>
              <TableHead className="font-bold text-xs text-center">মোট অর্ডার</TableHead>
              <TableHead className="font-bold text-xs">মোট বিক্রয়</TableHead>
              <TableHead className="font-bold text-xs">অর্জিত কমিশন</TableHead>
              <TableHead className="font-bold text-xs text-center">পণ্য সংখ্যা</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 text-xs">
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                  এই সময়ে কোনো ভেন্ডর সেলস তথ্য পাওয়া যায়নি।
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.vendor_name} className="hover:bg-orange-50/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-[#f47920] font-bold text-xs">
                        {r.vendor_name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-bold text-gray-900">{r.vendor_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold font-mono">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[11px]">
                      {r.orders_count}টি
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-gray-900 font-mono">{formatTaka(r.revenue)}</TableCell>
                  <TableCell className="font-bold text-emerald-700 font-mono">{formatTaka(r.commission_earned)}</TableCell>
                  <TableCell className="text-center font-semibold text-gray-700">{r.products_count}টি পণ্য</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* --------------------------- Delivery Tab --------------------------- */
function DeliveryTab({ rows }: { rows: DeliveryReportRow[] }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="font-bold text-xs min-w-[150px]">রাইডারের নাম</TableHead>
              <TableHead className="font-bold text-xs">মোবাইল নম্বর</TableHead>
              <TableHead className="font-bold text-xs text-center">অ্যাসাইনড</TableHead>
              <TableHead className="font-bold text-xs text-center">ডেলিভার্ড</TableHead>
              <TableHead className="font-bold text-xs text-center">পেন্ডিং</TableHead>
              <TableHead className="font-bold text-xs text-center">সফলতার হার</TableHead>
              <TableHead className="font-bold text-xs text-center">আজ / সপ্তাহ / মাস</TableHead>
              <TableHead className="text-right font-bold text-xs">সংগৃহীত ক্যাশ (COD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 text-xs">
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                  কোনো ডেলিভারি ডেটা পাওয়া যায়নি।
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id} className="hover:bg-orange-50/20 transition-colors">
                  <TableCell className="font-bold text-gray-900">{r.name}</TableCell>
                  <TableCell>
                    {r.phone ? (
                      <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 text-[11px]">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{r.phone}</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-gray-700">{r.assigned_count}</TableCell>
                  <TableCell className="text-center font-mono font-bold text-emerald-700">{r.delivered_count}</TableCell>
                  <TableCell className="text-center font-mono font-bold text-amber-600">{r.pending_count}</TableCell>
                  <TableCell className="text-center font-bold font-mono">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] ${r.success_rate >= 80 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {Math.min(100, r.success_rate).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-[11px] font-mono text-muted-foreground">
                    {r.today_count} / {r.week_count} / {r.month_count}
                  </TableCell>
                  <TableCell className="text-right font-black font-mono text-emerald-700">
                    {formatTaka(r.collected_cash)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
