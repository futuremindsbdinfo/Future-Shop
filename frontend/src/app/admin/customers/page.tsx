"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Phone,
  Mail,
  ShoppingBag,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  BadgeCheck,
  Search,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ORDER_STATUS_BN } from "@/lib/order-status";
import type { AdminCustomerRow, CustomerDetail, Order, PaginatedResponse } from "@/types";

function getErrorMessage(e: unknown, fallback: string): string {
  if (typeof e === "object" && e !== null && "response" in e) {
    const r = (e as { response?: { data?: { message?: string } } }).response;
    return r?.data?.message ?? fallback;
  }
  return fallback;
}

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
    const sp = new URLSearchParams({ page: String(page), per_page: "20" });
    if (searchDebounced.trim()) sp.set("search", searchDebounced.trim());
    api
      .get<PaginatedResponse<AdminCustomerRow>>(`/admin/customers?${sp.toString()}`)
      .then((r) => setData(r.data))
      .catch((e) => toast.error(getErrorMessage(e, "গ্রাহক তালিকা লোড করা যায়নি")))
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
      toast.error(getErrorMessage(e, "গ্রাহকের বিস্তারিত তথ্য পাওয়া যায়নি"));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const totalCustomers = data?.total ?? 0;
  const now = Date.now();
  const activeThisMonth = (data?.data ?? []).filter((c) => {
    if (!c.last_order_date) return false;
    const last = new Date(c.last_order_date).getTime();
    return now - last <= 30 * 86_400_000;
  }).length;
  const totalSpending = (data?.data ?? []).reduce((s, c) => s + Number(c.total_spent ?? 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              গ্রাহক তালিকা (Customer Directory)
            </h1>
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
              মোট {totalCustomers} জন গ্রাহক
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            রেজিস্টার্ড কাস্টমারদের প্রোফাইল, অর্ডার হিস্টোরি ও মোট কেনাকাটার হিসাব
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#f47920] shadow-2xs">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold text-gray-500" lang="bn">মোট নিবন্ধিত গ্রাহক</p>
              <p className="text-2xl font-black text-gray-900 font-mono mt-0.5">{totalCustomers.toLocaleString("en-US")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-2xs">
              <UserCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold text-gray-500" lang="bn">এই মাসে সক্রিয়</p>
              <p className="text-2xl font-black text-gray-900 font-mono mt-0.5">{activeThisMonth} জন</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
              <Wallet className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold text-gray-500" lang="bn">মোট কেনাকাটা (পেজ হিসাব)</p>
              <p className="text-2xl font-black text-gray-900 font-mono mt-0.5">{formatTaka(totalSpending)}</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Quick Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="গ্রাহকের নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-xs outline-none focus:border-[#f47920] focus:bg-white focus:ring-2 focus:ring-[#f47920]/20 transition-all"
          />
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="font-bold text-xs min-w-[200px]">গ্রাহকের নাম ও ইমেইল</TableHead>
                <TableHead className="font-bold text-xs">মোবাইল নম্বর</TableHead>
                <TableHead className="font-bold text-xs text-center">মোট অর্ডার</TableHead>
                <TableHead className="font-bold text-xs">সর্বমোট কেনাকাটা</TableHead>
                <TableHead className="font-bold text-xs">সর্বশেষ অর্ডার</TableHead>
                <TableHead className="font-bold text-xs text-center">স্ট্যাটাস</TableHead>
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
                    কোনো গ্রাহক খুঁজে পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((c) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-orange-50/20 transition-colors cursor-pointer"
                    onClick={() => openDetail(c)}
                  >
                    
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#f47920] font-bold text-xs shadow-2xs">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-bold text-gray-900">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{c.email || "ইমেইল নেই"}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {c.phone ? (
                        <a
                          href={`tel:${c.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>{c.phone}</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center font-bold text-gray-900">
                      <span className="bg-orange-50 text-[#f47920] px-2 py-0.5 rounded-md text-[11px]">
                        {c.total_orders ?? 0}টি
                      </span>
                    </TableCell>

                    <TableCell className="font-bold text-gray-900 font-mono">
                      {formatTaka(c.total_spent ?? 0)}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-[11px]">
                      {c.last_order_date ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{new Date(c.last_order_date).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[10px] font-bold ${
                          c.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {c.is_active ? "সক্রিয় (Active)" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 rounded-xl text-gray-600 hover:text-[#f47920] hover:bg-orange-50 text-xs font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(c);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span>প্রোফাইল</span>
                      </Button>
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
            দেখানো হচ্ছে {(data.from ?? 1)} থেকে {(data.to ?? data.data.length)} (মোট {data.total} জন গ্রাহক)
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

      {/* Customer Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">গ্রাহকের প্রোফাইল ও বিবরণ</DialogTitle>
          </DialogHeader>

          {detailLoading || !detail ? (
            <div className="py-12 text-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4 pt-2 text-xs">
              
              {/* Profile Banner */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f47920] text-xl font-bold text-white shadow-xs">
                  {detail.user.name.charAt(0).toUpperCase()}
                </span>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-gray-900 truncate">{detail.user.name}</p>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      {detail.user.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-gray-600 text-[11px]">
                    {detail.user.phone && (
                      <a href={`tel:${detail.user.phone}`} className="flex items-center gap-1 font-bold text-emerald-700 hover:underline">
                        <Phone className="w-3 h-3" />
                        <span>{detail.user.phone}</span>
                      </a>
                    )}
                    {detail.user.email && (
                      <span className="flex items-center gap-1 text-muted-foreground truncate">
                        <Mail className="w-3 h-3" />
                        <span>{detail.user.email}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Summary Stats */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3 text-center">
                  <p className="text-[10px] font-bold text-gray-500" lang="bn">মোট অর্ডার</p>
                  <p className="text-lg font-black text-gray-900 font-mono mt-0.5">{detail.stats.total_orders}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3 text-center">
                  <p className="text-[10px] font-bold text-gray-500" lang="bn">সর্বমোট খরচ</p>
                  <p className="text-lg font-black text-[#f47920] font-mono mt-0.5">{formatTaka(detail.stats.total_spent)}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3 text-center">
                  <p className="text-[10px] font-bold text-gray-500" lang="bn">সর্বশেষ অর্ডার</p>
                  <p className="text-[11px] font-bold text-gray-800 mt-1">
                    {detail.stats.last_order_date
                      ? new Date(detail.stats.last_order_date).toLocaleDateString("bn-BD", { day: "numeric", month: "short" })
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Recent Orders History */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="font-extrabold text-xs text-gray-900 flex items-center justify-between" lang="bn">
                  <span>সাম্প্রতিক অর্ডার হিস্টোরি:</span>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    {detail.orders.length}টি অর্ডার পাওয়া গেছে
                  </span>
                </h4>

                {detail.orders.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center" lang="bn">এখনো কোনো অর্ডার করা হয়নি।</p>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {detail.orders.map((o: Order) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-2xs hover:border-orange-200 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <p className="font-mono font-bold text-gray-900 text-xs">#{o.order_number}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{new Date(o.created_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="font-bold text-gray-900 font-mono">{formatTaka(o.total)}</p>
                          <Badge className="bg-orange-50 text-[#f47920] border-orange-200 text-[9px] font-bold">
                            {ORDER_STATUS_BN[o.order_status] ?? o.order_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
