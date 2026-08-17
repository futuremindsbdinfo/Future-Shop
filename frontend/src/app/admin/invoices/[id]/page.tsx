"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { InvoiceDetail } from "@/types";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  failed: "bg-red-50 text-red-800 border-red-200",
  refunded: "bg-blue-50 text-blue-800 border-blue-200",
};

export default function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  useEffect(() => {
    load();
  }, [load]);

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
  if (!data) return <p className="text-xs text-muted-foreground py-16 text-center" lang="bn">ইনভয়েস খুঁজে পাওয়া যায়নি।</p>;

  return (
    <div className="space-y-6">
      
      {/* Print stylesheet: isolates #invoice-print for A4 paper print */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-print, #invoice-print * { visibility: visible !important; }
          #invoice-print {
            position: absolute !important;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { display: none !important; }
          aside, header, nav, .sidebar, button, footer { display: none !important; }
          @page { size: A4 portrait; margin: 12mm; }
        }
      `}</style>

      {/* Top Toolbar (Hidden during Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <Button
          variant="outline"
          className="h-10 px-4 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 border-gray-200"
          nativeButton={false}
          render={<Link href="/admin/invoices" />}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          <span>সকল ইনভয়েস তালিকা</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.print()}
            className="h-10 px-5 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>ক্যাশ মেমো প্রিন্ট করুন (Print A4)</span>
          </Button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="invoice-print"
        className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-xs text-gray-900"
      >
        
        {/* Header: Company + Invoice Meta */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f47920] text-xl font-black text-white shadow-2xs">
                FS
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">FUTURE SHOP</h1>
                <p className="text-xs font-bold text-[#f47920]">ফিউচার শপ — শেরপুর, বগুড়া</p>
              </div>
            </div>
            
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>শেরপুর বাসস্ট্যান্ড সংলগ্ন, শেরপুর, বগুড়া-৫৮৪০</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>হেল্পলাইন: +880 1888-060447</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>ইমেইল: info@futureshop.com.bd</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 text-xs font-bold">
              ক্যাশ মেমো / ইনভয়েস
            </Badge>
            <p className="font-mono font-extrabold text-sm text-gray-900 pt-1">
              #{data.invoice_number}
            </p>
            <p className="text-xs text-gray-500 flex sm:justify-end items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>{new Date(data.date).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}</span>
            </p>
            <div className="pt-1">
              <Badge className={`text-[10px] font-bold ${STATUS_BADGE[data.payment_status] ?? ""}`}>
                {data.payment_status === "paid" ? "✓ পরিশোধিত (PAID)" : "বাকি / ক্যাশ অন ডেলিভারি"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-gray-100 text-xs">
          
          <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1.5">
            <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5" lang="bn">
              <span>গ্রাহকের বিবরণ (Bill To):</span>
            </h3>
            <p className="text-sm font-bold text-gray-900">{data.customer.name}</p>
            {data.customer.phone && (
              <p className="text-gray-700 flex items-center gap-1">
                <Phone className="w-3 h-3 text-gray-400" />
                <span>{data.customer.phone}</span>
              </p>
            )}
            {data.customer.email && (
              <p className="text-gray-500 flex items-center gap-1">
                <Mail className="w-3 h-3 text-gray-400" />
                <span>{data.customer.email}</span>
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-100/80 space-y-1.5">
            <h3 className="font-extrabold text-[#f47920] text-xs uppercase tracking-wider flex items-center gap-1.5" lang="bn">
              <span>ডেলিভারি গন্তব্য (Delivery Address):</span>
            </h3>
            <p className="text-sm font-bold text-gray-900">{data.delivery_address.name}</p>
            <p className="text-gray-700 flex items-center gap-1">
              <Phone className="w-3 h-3 text-gray-400" />
              <span>{data.delivery_address.phone}</span>
            </p>
            <p className="text-gray-700 flex items-start gap-1">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
              <span>{data.delivery_address.address}</span>
            </p>
            {data.delivery_address.zone && (
              <p className="text-[11px] font-bold text-[#f47920]">
                জোন: {data.delivery_address.zone}
              </p>
            )}
          </div>

        </div>

        {/* Itemized Products Table */}
        <div className="py-6">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="py-3 px-3 font-bold text-gray-800" lang="bn">পণ্যের বিবরণ</th>
                <th className="py-3 px-3 text-center font-bold text-gray-800" lang="bn">পরিমাণ</th>
                <th className="py-3 px-3 text-right font-bold text-gray-800" lang="bn">একক মূল্য</th>
                <th className="py-3 px-3 text-right font-bold text-gray-800" lang="bn">উপমোট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="py-3 px-3 font-semibold text-gray-900">{item.product_name}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-gray-800">{item.quantity}টি</td>
                  <td className="py-3 px-3 text-right font-mono text-gray-700">{formatTaka(item.price)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">{formatTaka(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Calculation Card */}
        <div className="pt-2 pb-6 border-t border-gray-200">
          <div className="ml-auto max-w-xs space-y-2 text-xs">
            <div className="flex justify-between text-gray-600 font-semibold">
              <span lang="bn">পণ্যের উপমোট:</span>
              <span className="font-mono text-gray-900">{formatTaka(data.totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-semibold">
              <span lang="bn">ডেলিভারি চার্জ:</span>
              <span className="font-mono text-gray-900">{formatTaka(data.totals.delivery_charge)}</span>
            </div>
            {Number(data.totals.discount) > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span lang="bn">কুপন / অফার ছাড়:</span>
                <span className="font-mono">−{formatTaka(data.totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-sm font-black text-gray-900">
              <span lang="bn">সর্বমোট প্রদেয়:</span>
              <span className="font-mono text-base text-[#f47920]">{formatTaka(data.totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer & Signatures */}
        <div className="pt-8 mt-4 border-t border-dashed border-gray-300 grid grid-cols-2 items-end text-xs">
          <div className="space-y-1">
            <p className="font-bold text-gray-900">ফিউচার শপ-এর সাথে থাকার জন্য ধন্যবাদ!</p>
            <p className="text-[11px] text-gray-500">যেকোনো প্রয়োজনে আমাদের কল করুন: +880 1888-060447</p>
          </div>
          <div className="text-right">
            <div className="inline-block border-t border-gray-400 pt-1 px-4 text-center">
              <p className="font-bold text-gray-800 text-[11px]">কর্তৃপক্ষের স্বাক্ষর</p>
              <p className="text-[10px] text-muted-foreground">Future Shop Admin</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
