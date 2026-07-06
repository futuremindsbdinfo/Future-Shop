"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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

/** Own-data only: the backend scopes everything to the bearer token's user —
 *  this page never sends any user id. */
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const periods: { value: Period; label: string }[] = [
    { value: "today", label: "আজ" },
    { value: "week", label: "এই সপ্তাহ" },
    { value: "month", label: "এই মাস" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" lang="bn">আমার ডেলিভারি রিপোর্ট</h1>
      </div>

      {/* Period Toggles */}
      <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
        {periods.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPeriod(p.value)}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all ${
              period === p.value
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            lang="bn"
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : data ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-xl border border-slate-100 shadow-sm bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-medium text-slate-500" lang="bn">মোট ডেলিভারি</span>
                <p className="mt-1 text-3xl font-extrabold text-[#f47920]">
                  {data.delivered_count}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-slate-100 shadow-sm bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-medium text-slate-500" lang="bn">নগদ সংগ্রহ (COD)</span>
                <p className="mt-1 text-3xl font-extrabold text-green-600">
                  {formatTaka(data.collected_cash)}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-slate-100 shadow-sm">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-medium text-slate-500" lang="bn">অ্যাসাইন করা</span>
                <p className="mt-1 text-2xl font-extrabold text-blue-600">{data.assigned_count}</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-slate-100 shadow-sm">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-medium text-slate-500" lang="bn">চলমান</span>
                <p className="mt-1 text-2xl font-extrabold text-[#f47920]">{data.pending_count}</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-slate-100 shadow-sm">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-medium text-slate-500" lang="bn">বাতিল</span>
                <p className="mt-1 text-2xl font-extrabold text-red-600">{data.cancelled_count}</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-slate-100 shadow-sm">
              <CardContent className="p-4 text-center">
                <span className="text-xs font-medium text-slate-500" lang="bn">সাফল্যের হার</span>
                <p className="mt-1 text-2xl font-extrabold text-purple-600">
                  {Math.min(100, data.success_rate).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Per-day breakdown (Dhaka-local dates from the backend) */}
          <Card className="rounded-xl border border-slate-100 shadow-sm">
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-800" lang="bn">
                দিনভিত্তিক হিসাব
              </h3>
              {data.daily.length === 0 ? (
                <p className="text-sm text-muted-foreground" lang="bn">
                  এই সময়ে কোনো ডেলিভারি নেই।
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 font-medium" lang="bn">তারিখ</th>
                      <th className="py-2 text-center font-medium" lang="bn">ডেলিভারি</th>
                      <th className="py-2 text-right font-medium" lang="bn">ক্যাশ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily.map((d) => (
                      <tr key={d.date} className="border-b last:border-0">
                        <td className="py-2 font-mono text-xs">
                          {new Date(`${d.date}T00:00:00`).toLocaleDateString("en-GB")}
                        </td>
                        <td className="py-2 text-center font-medium">{d.delivered_count}</td>
                        <td className="py-2 text-right font-semibold text-green-700">
                          {formatTaka(d.collected_cash)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Deliveries List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-slate-800" lang="bn">ডেলিভারিকৃত অর্ডারসমূহ ({data.orders.length})</h3>
            {data.orders.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground" lang="bn">এই সময়ে কোনো ডেলিভারি নেই।</p>
            ) : (
              <div className="space-y-3">
                {data.orders.map((order) => (
                  <Card key={order.id} className="rounded-xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all">
                    <CardContent className="p-4 flex justify-between items-center text-sm">
                      <div className="space-y-1">
                        <p className="font-mono font-bold text-slate-700">{order.order_number}</p>
                        <p className="text-xs text-slate-500">
                          {order.user?.name ?? "—"} • {order.payment_method === "cod" ? "ক্যাশ অন ডেলিভারি" : "অনলাইন পেমেন্ট"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {order.delivered_at ? new Date(order.delivered_at).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }) : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">{formatTaka(Number(order.total))}</p>
                        <Badge
                          className={`mt-1 font-normal text-[10px] ${
                            order.payment_status === "paid"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {order.payment_status === "paid" ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">ডাটা পাওয়া যায়নি।</p>
      )}
    </div>
  );
}

// Badge helper
function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${className}`}>
      {children}
    </span>
  );
}
