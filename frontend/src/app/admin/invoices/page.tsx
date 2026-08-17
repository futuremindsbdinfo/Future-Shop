"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  FileText,
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Receipt,
  Phone,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { InvoiceRow, PaginatedResponse } from "@/types";

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

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
    const sp = new URLSearchParams({ page: String(page), per_page: "20" });
    if (searchDebounced.trim()) sp.set("search", searchDebounced.trim());
    if (status) sp.set("status", status);
    api
      .get<PaginatedResponse<InvoiceRow>>(`/admin/invoices?${sp.toString()}`)
      .then((r) => setData(r.data))
      .catch(() => toast.error("ইনভয়েস তালিকা লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, [page, searchDebounced, status]);

  useEffect(() => {
    load();
  }, [load]);

  const openPrint = (id: number) => {
    const w = window.open(`/admin/invoices/${id}?autoprint=1`, "_blank");
    if (!w) toast.error("প্রিন্ট করতে পপআপ অনুমোদন দিন (Allow Popups)");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              ইনভয়েস সেন্টার (Invoices & Memos)
            </h1>
            {data && (
              <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
                মোট {data.total}টি ইনভয়েস
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            কাস্টমার অর্ডারের অফিসিয়াল ক্যাশ মেমো, পেমেন্ট স্লিপ ও এ৪ প্রিন্ট
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ইনভয়েস নম্বর বা গ্রাহকের নাম দিয়ে খুঁজুন..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-xs outline-none focus:border-[#f47920] focus:bg-white focus:ring-2 focus:ring-[#f47920]/20 transition-all font-mono"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-[#f47920]"
        >
          <option value="">সকল পেমেন্ট স্ট্যাটাস</option>
          <option value="pending">পেন্ডিং (Pending)</option>
          <option value="paid">পরিশোধিত (Paid)</option>
          <option value="failed">ব্যর্থ (Failed)</option>
          <option value="refunded">রিফান্ড (Refunded)</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="font-bold text-xs min-w-[150px]">ইনভয়েস নম্বর</TableHead>
                <TableHead className="font-bold text-xs min-w-[180px]">গ্রাহক ও মোবাইল</TableHead>
                <TableHead className="font-bold text-xs">তারিখ</TableHead>
                <TableHead className="font-bold text-xs text-center">মোট আইটেম</TableHead>
                <TableHead className="font-bold text-xs">সর্বমোট প্রদেয়</TableHead>
                <TableHead className="font-bold text-xs text-center">পেমেন্ট স্ট্যাটাস</TableHead>
                <TableHead className="text-right font-bold text-xs">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                    কোনো ইনভয়েস খুঁজে পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-orange-50/20 transition-colors">
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#f47920]">
                          <Receipt className="h-4 w-4" />
                        </span>
                        <span className="font-mono font-bold text-gray-900 text-xs">
                          {inv.invoice_number}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900">{inv.customer_name}</p>
                        {inv.customer_phone ? (
                          <a
                            href={`tel:${inv.customer_phone}`}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded hover:bg-emerald-100"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            <span>{inv.customer_phone}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">—</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-[11px] whitespace-nowrap">
                      {new Date(inv.date).toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>

                    <TableCell className="text-center font-bold text-gray-900">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[11px]">
                        {inv.items_count}টি
                      </span>
                    </TableCell>

                    <TableCell className="font-bold text-gray-900 font-mono text-sm">
                      {formatTaka(inv.total)}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[10px] font-bold ${
                          inv.payment_status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : inv.payment_status === "refunded"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : inv.payment_status === "failed"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {inv.payment_status === "paid"
                          ? "পরিশোধিত (Paid)"
                          : inv.payment_status === "refunded"
                          ? "রিফান্ডেড"
                          : inv.payment_status === "failed"
                          ? "ব্যর্থ"
                          : "বাকি / পেন্ডিং"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 rounded-xl text-gray-600 hover:text-[#f47920] hover:bg-orange-50 text-xs font-bold"
                          nativeButton={false}
                          render={<Link href={`/admin/invoices/${inv.id}`} />}
                          title="ইনভয়েস দেখুন"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span>ভিউ</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 rounded-xl border-orange-200 bg-orange-50 text-[#f47920] hover:bg-orange-100 text-xs font-bold shadow-2xs"
                          onClick={() => openPrint(inv.id)}
                          title="ক্যাশ মেমো প্রিন্ট করুন"
                        >
                          <Printer className="h-3.5 w-3.5 mr-1" />
                          <span>প্রিন্ট</span>
                        </Button>
                      </div>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 py-2">
          <span className="text-xs text-muted-foreground font-semibold" lang="bn">
            দেখানো হচ্ছে {(data.from ?? 1)} থেকে {(data.to ?? data.data.length)} (মোট {data.total}টি ইনভয়েস)
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl text-xs font-bold"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              <span>আগের পৃষ্ঠা</span>
            </Button>

            {getPageNumbers(data.current_page, data.last_page).map((item, idx) => {
              if (item === "...") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground select-none">
                    ...
                  </span>
                );
              }
              const isCurrent = item === data.current_page;
              return (
                <Button
                  key={item}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  className={`h-9 min-w-[36px] px-2.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-[#f47920] text-white hover:bg-[#d46212] shadow-xs"
                      : "text-gray-700 hover:text-[#f47920]"
                  }`}
                  onClick={() => {
                    if (item !== page) setPage(item as number);
                  }}
                >
                  {item}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl text-xs font-bold"
              disabled={page >= data.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              <span>পরের পৃষ্ঠা</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
