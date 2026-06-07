"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { InvoiceRow, PaginatedResponse } from "@/types";

const STATUS_BADGE: Record<string, string> = {
  pending: "border-amber-300 text-amber-700",
  paid: "border-green-300 text-green-700",
  failed: "border-red-300 text-red-600",
  refunded: "border-blue-300 text-blue-700",
};

export default function AdminInvoicesPage() {
  const [data, setData] = useState<PaginatedResponse<InvoiceRow> | null>(null);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    const sp = new URLSearchParams({ page: String(page), per_page: "15" });
    if (searchDebounced) sp.set("search", searchDebounced);
    if (status) sp.set("status", status);
    api
      .get<PaginatedResponse<InvoiceRow>>(`/admin/invoices?${sp.toString()}`)
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, [page, searchDebounced, status]);

  useEffect(() => { load(); }, [load]);

  const openPrint = (id: number) => {
    // Open the invoice detail page in a new tab — user can hit Print Invoice there.
    const w = window.open(`/admin/invoices/${id}?autoprint=1`, "_blank");
    if (!w) toast.error("Allow popups to print");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Invoices</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          className="h-11 max-w-md"
          placeholder="Search by invoice # or customer…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-11 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All payment statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Result count */}
      {!loading && data && data.total > 0 && (
        <p className="text-sm text-[#6b7280]">
          Showing {data.from ?? 0}–{data.to ?? 0} of <span className="font-semibold text-[#374151]">{data.total}</span>{" "}
          {data.total === 1 ? "invoice" : "invoices"}
        </p>
      )}

      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : !data || data.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff7ed] text-[#f47920]">
                <FileText className="h-6 w-6" />
              </span>
              <p className="text-base font-medium text-[#111827]">No invoices yet</p>
              <p className="max-w-xs text-sm text-[#6b7280]">
                Once orders start coming in, their invoices will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#f3f4f6] text-left text-[11px] uppercase tracking-wide text-[#9ca3af]">
                        <th className="px-4 py-3 font-medium">Invoice #</th>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Items</th>
                        <th className="px-4 py-3 font-medium">Total</th>
                        <th className="px-4 py-3 font-medium">Payment</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.map((inv) => (
                        <tr key={inv.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fff7ed]">
                          <td className="px-4 py-3 font-mono text-xs">{inv.invoice_number}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{inv.customer_name}</p>
                            <p className="text-[11px] text-[#9ca3af]">{inv.customer_phone ?? "—"}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#6b7280]">
                            {new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3">{inv.items_count}</td>
                          <td className="px-4 py-3 font-semibold">{formatTaka(inv.total)}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={STATUS_BADGE[inv.payment_status] ?? ""}>
                              {inv.payment_status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" className="h-11 w-11" nativeButton={false} render={<Link href={`/admin/invoices/${inv.id}`} />} aria-label="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => openPrint(inv.id)} aria-label="Print">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <ul className="md:hidden divide-y divide-[#f3f4f6]">
                {data.data.map((inv) => (
                  <li key={inv.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold">{inv.invoice_number}</p>
                        <p className="mt-1 truncate text-sm font-medium">{inv.customer_name}</p>
                        <p className="text-[11px] text-[#9ca3af]">
                          {new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {inv.items_count} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatTaka(inv.total)}</p>
                        <Badge variant="outline" className={STATUS_BADGE[inv.payment_status] ?? ""}>
                          {inv.payment_status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" className="h-11 flex-1" nativeButton={false} render={<Link href={`/admin/invoices/${inv.id}`} />}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                      <Button variant="outline" className="h-11 flex-1" onClick={() => openPrint(inv.id)}>
                        <Printer className="mr-2 h-4 w-4" /> Print
                      </Button>
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
    </div>
  );
}
