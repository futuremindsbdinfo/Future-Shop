"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { InvoiceDetail } from "@/types";

const STATUS_BADGE: Record<string, string> = {
  pending: "border-amber-300 text-amber-700",
  paid: "border-green-300 text-green-700",
  failed: "border-red-300 text-red-600",
  refunded: "border-blue-300 text-blue-700",
};

export default function AdminInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ data: InvoiceDetail }>(`/admin/invoices/${id}`)
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ?autoprint=1 → fire window.print() after content renders.
  useEffect(() => {
    if (!data) return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("autoprint") === "1") {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [data]);

  if (loading) return <LoadingSpinner fullHeight />;
  if (!data) return <p className="text-sm text-muted-foreground">Invoice not found.</p>;

  return (
    <>
      {/* Print stylesheet: hide admin chrome and styling utilities when printing. */}
      <style>{`
        @media print {
          /* Hide every sibling/ancestor element on the page, then re-show the invoice. */
          body * { visibility: hidden !important; }
          #invoice-print, #invoice-print * { visibility: visible !important; }
          #invoice-print { position: absolute !important; left: 0; top: 0; width: 100%; padding: 24px; }
          .no-print { display: none !important; }
          aside, header, nav, .sidebar, button { display: none !important; }
          @page { size: A4; margin: 14mm; }
        }
      `}</style>

      {/* Top toolbar (hidden when printing) */}
      <div className="no-print mb-4 flex items-center justify-between gap-3">
        <Button variant="outline" className="h-11" nativeButton={false} render={<Link href="/admin/invoices" />}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={() => window.print()} className="h-11 bg-gradient-to-r from-[#f47920] to-[#fb923c] text-white hover:opacity-90">
          <Printer className="mr-2 h-4 w-4" /> Print Invoice
        </Button>
      </div>

      <div id="invoice-print" className="mx-auto max-w-3xl rounded-xl border bg-white p-6 sm:p-10 shadow-sm">
        {/* Header: company + invoice meta */}
        <div className="flex flex-col gap-6 border-b border-[#e5e7eb] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-[#f47920] to-[#fb923c] text-lg font-bold text-white">
                {data.company.name.charAt(0)}
              </span>
              <div>
                <p className="text-xl font-bold text-[#111827]">{data.company.name}</p>
                {data.company.address && <p className="text-xs text-[#6b7280]">{data.company.address}</p>}
              </div>
            </div>
            <div className="mt-3 space-y-0.5 text-xs text-[#6b7280]">
              {data.company.phone && <p>Phone: {data.company.phone}</p>}
              {data.company.email && <p>Email: {data.company.email}</p>}
            </div>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Invoice</p>
            <p className="font-mono text-base font-semibold">{data.invoice_number}</p>
            <p className="mt-1 text-xs text-[#6b7280]">
              {new Date(data.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <Badge variant="outline" className={`mt-2 ${STATUS_BADGE[data.payment_status] ?? ""}`}>
              {data.payment_status}
            </Badge>
          </div>
        </div>

        {/* Bill to */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Bill To</h3>
            <p className="mt-1 font-semibold">{data.customer.name}</p>
            {data.customer.phone && <p className="text-sm">{data.customer.phone}</p>}
            {data.customer.email && <p className="text-sm text-[#6b7280]">{data.customer.email}</p>}
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Delivery Address</h3>
            <p className="mt-1 font-semibold">{data.delivery_address.name}</p>
            <p className="text-sm">{data.delivery_address.phone}</p>
            <p className="text-sm text-[#6b7280]">{data.delivery_address.address}</p>
            {data.delivery_address.district && (
              <p className="text-sm text-[#6b7280]">{data.delivery_address.district}{data.delivery_address.division ? `, ${data.delivery_address.division}` : ""}</p>
            )}
            {data.delivery_address.zone && (
              <p className="mt-1 text-xs text-[#9ca3af]">Zone: {data.delivery_address.zone}</p>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="mt-6">
          <h3 className="mb-2 text-[11px] uppercase tracking-wide text-[#9ca3af]">Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] text-left">
                  <th className="py-2 font-medium">Product</th>
                  <th className="py-2 text-center font-medium">Qty</th>
                  <th className="py-2 text-right font-medium">Unit Price</th>
                  <th className="py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, i) => (
                  <tr key={i} className="border-b border-[#f3f4f6]">
                    <td className="py-2 pr-2">{item.product_name}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">{formatTaka(item.price)}</td>
                    <td className="py-2 text-right">{formatTaka(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#6b7280]">Subtotal</span><span>{formatTaka(data.totals.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-[#6b7280]">Delivery</span><span>{formatTaka(data.totals.delivery_charge)}</span></div>
          <div className="flex justify-between"><span className="text-[#6b7280]">Discount</span><span>−{formatTaka(data.totals.discount)}</span></div>
          <div className="flex justify-between border-t border-[#e5e7eb] pt-2 text-base font-bold">
            <span>Grand Total</span>
            <span className="text-[#f47920]">{formatTaka(data.totals.total)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#e5e7eb] pt-4 text-xs text-[#6b7280]">
          <span>Payment Method: <span className="font-semibold uppercase text-[#111827]">{data.payment_method}</span></span>
          <span>·</span>
          <span>Order Status: <span className="font-semibold text-[#111827]">{data.order_status}</span></span>
        </div>

        <p className="mt-6 text-center text-[11px] text-[#9ca3af]">
          Thank you for shopping with {data.company.name}.
        </p>
      </div>
    </>
  );
}
