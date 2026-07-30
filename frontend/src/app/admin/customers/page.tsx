"use client";

import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSackDollar, faUserCheck, faUsers } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { AdminCustomerRow, CustomerDetail, Order, PaginatedResponse } from "@/types";

function getErrorMessage(e: unknown, fallback: string): string {
  if (typeof e === "object" && e !== null && "response" in e) {
    const r = (e as { response?: { data?: { message?: string } } }).response;
    return r?.data?.message ?? fallback;
  }
  return fallback;
}

export default function AdminCustomersPage() {
  const [data, setData] = useState<PaginatedResponse<AdminCustomerRow> | null>(null);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Detail dialog state
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    const sp = new URLSearchParams({ page: String(page), per_page: "15" });
    if (searchDebounced) sp.set("search", searchDebounced);
    api
      .get<PaginatedResponse<AdminCustomerRow>>(`/admin/customers?${sp.toString()}`)
      .then((r) => setData(r.data))
      .catch((e) => toast.error(getErrorMessage(e, "Failed to load customers")))
      .finally(() => setLoading(false));
  }, [page, searchDebounced]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (c: AdminCustomerRow) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const r = await api.get<{ data: CustomerDetail }>(`/admin/customers/${c.id}`);
      setDetail(r.data.data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to load customer detail"));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Summary aggregates from the current page (best signal without an extra endpoint).
  const totalCustomers = data?.total ?? 0;
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const activeThisMonth = (data?.data ?? []).filter((c) => {
    if (!c.last_order_date) return false;
    const last = new Date(c.last_order_date).getTime();
    return now - last <= 30 * 86_400_000;
  }).length;
  const totalSpending = (data?.data ?? []).reduce((s, c) => s + Number(c.total_spent ?? 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-[#6b7280]">Total Customers</p>
              <p className="text-2xl font-bold">{totalCustomers.toLocaleString("en-US")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
              <FontAwesomeIcon icon={faUserCheck} className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-[#6b7280]">Active This Month</p>
              <p className="text-2xl font-bold">{activeThisMonth}</p>
              <p className="text-[11px] text-[#9ca3af]">on this page</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-[#f47920]">
              <FontAwesomeIcon icon={faSackDollar} className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-[#6b7280]">Total Spending</p>
              <p className="text-2xl font-bold">{formatTaka(totalSpending)}</p>
              <p className="text-[11px] text-[#9ca3af]">on this page</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Input
        className="h-11 max-w-md"
        placeholder="Search by name or phone…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : !data || data.data.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No customers found.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#f3f4f6] text-left text-[11px] uppercase tracking-wide text-[#9ca3af]">
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Phone</th>
                        <th className="px-4 py-3 font-medium">Orders</th>
                        <th className="px-4 py-3 font-medium">Spent</th>
                        <th className="px-4 py-3 font-medium">Last Order</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.map((c) => (
                        <tr key={c.id} className="cursor-pointer border-b border-[#f3f4f6] last:border-0 hover:bg-[#fff7ed]" onClick={() => openDetail(c)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f47920] text-sm font-semibold text-white">
                                {c.name.charAt(0).toUpperCase()}
                              </span>
                              <span className="font-medium">{c.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#374151]">{c.phone ?? "—"}</td>
                          <td className="px-4 py-3">{c.total_orders ?? 0}</td>
                          <td className="px-4 py-3 font-semibold text-[#f47920]">{formatTaka(c.total_spent ?? 0)}</td>
                          <td className="px-4 py-3 text-xs text-[#6b7280]">
                            {c.last_order_date ? new Date(c.last_order_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={c.is_active ? "border-green-300 text-green-700" : "border-gray-300 text-gray-500"}>
                              {c.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <ul className="md:hidden divide-y divide-[#f3f4f6]">
                {data.data.map((c) => (
                  <li key={c.id} className="cursor-pointer p-4 hover:bg-[#fff7ed]" onClick={() => openDetail(c)}>
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f47920] text-sm font-semibold text-white">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{c.name}</p>
                        <p className="truncate text-xs text-[#6b7280]">{c.phone ?? "—"}</p>
                        <p className="mt-1 text-[11px] text-[#9ca3af]">
                          {c.total_orders ?? 0} orders · last {c.last_order_date ? new Date(c.last_order_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#f47920]">{formatTaka(c.total_spent ?? 0)}</p>
                        <Badge variant="outline" className={c.is_active ? "mt-1 border-green-300 text-green-700" : "mt-1 border-gray-300 text-gray-500"}>
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {data && data.last_page > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" className="h-11" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {data.current_page} of {data.last_page}</span>
          <Button variant="outline" className="h-11" disabled={page >= data.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Customer Detail</DialogTitle>
          </DialogHeader>
          {detailLoading || !detail ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f47920] text-xl font-bold text-white">
                  {detail.user.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-base font-semibold">{detail.user.name}</p>
                  <p className="text-xs text-[#6b7280]">{detail.user.phone ?? "—"} · {detail.user.email ?? "—"}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 rounded-lg bg-[#f9fafb] p-3 text-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Orders</p>
                  <p className="text-lg font-bold">{detail.stats.total_orders}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Spent</p>
                  <p className="text-lg font-bold text-[#f47920]">{formatTaka(detail.stats.total_spent)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#9ca3af]">Last Order</p>
                  <p className="text-xs">
                    {detail.stats.last_order_date ? new Date(detail.stats.last_order_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </p>
                </div>
              </div>

              {/* Order history */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Recent Orders</h3>
                {detail.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                ) : (
                  <ul className="max-h-60 space-y-2 overflow-y-auto">
                    {detail.orders.map((o: Order) => (
                      <li key={o.id} className="flex items-center justify-between rounded-md border border-[#f3f4f6] p-2 text-xs">
                        <div>
                          <p className="font-mono font-semibold">{o.order_number}</p>
                          <p className="text-[10px] text-[#9ca3af]">
                            {new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatTaka(o.total)}</p>
                          <p className="text-[10px] text-[#6b7280]">{o.order_status}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
