"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  Calendar,
  CreditCard,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn, formatTaka } from "@/lib/utils";
import { ORDER_STATUS_BN, ORDER_STATUS_CLASS, PAYMENT_METHOD_BN } from "@/lib/order-status";
import api from "@/lib/api";
import type { Order, PaginatedResponse } from "@/types";

const STATUSES = [
  { key: "all", label: "সকল অর্ডার", icon: Package },
  { key: "pending", label: "অপেক্ষমান", icon: Clock },
  { key: "processing", label: "প্রস্তুতি চলছে", icon: Package },
  { key: "shipped", label: "ডেলিভারির পথে", icon: Truck },
  { key: "delivered", label: "ডেলিভারি সম্পন্ন", icon: CheckCircle2 },
  { key: "cancelled", label: "বাতিল", icon: XCircle },
] as const;

interface Props {
  heading: string;
  defaultStatus?: string;
}

export function OrdersView({ heading, defaultStatus = "all" }: Props) {
  const [status, setStatus] = useState<string>(defaultStatus);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<Order> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), per_page: "10" });
      if (status !== "all") qs.set("status", status);
      const res = await api.get<PaginatedResponse<Order>>(`/orders?${qs.toString()}`);
      setData(res.data);
    } catch {
      /* 401 handled by axios interceptor */
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    const t = setTimeout(() => load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const handleStatusChange = (next: string) => {
    if (next === status) return;
    setStatus(next);
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
            {heading}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5" lang="bn">
            আপনার সকল অর্ডারের বর্তমান অবস্থা এবং অতীতের কেনাকাটার বিবরণ {!loading && data && `(মোট ${data.total}টি)`}
          </p>
        </div>

        <Button
          nativeButton={false}
          render={<Link href="/products" />}
          className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs self-start sm:self-auto"
          lang="bn"
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
          <span>নতুন অর্ডার করুন</span>
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUSES.map((s) => {
          const active = s.key === status;
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => handleStatusChange(s.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border",
                active
                  ? "bg-[#f47920] text-white border-[#f47920] shadow-xs"
                  : "border-gray-200 bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50/50 hover:text-[#f47920]"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", active ? "text-white" : "text-gray-400")} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#f47920]" />
          <p className="text-sm text-muted-foreground font-medium" lang="bn">
            অর্ডারের তথ্য লোড হচ্ছে...
          </p>
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-gray-100 shadow-sm text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-[#f47920]">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900" lang="bn">
            কোনো অর্ডার পাওয়া যায়নি
          </h2>
          <p className="text-xs text-muted-foreground" lang="bn">
            এই ক্যাটাগরিতে আপনার কোনো অর্ডার নেই। আমাদের সেরা অফারগুলো দেখে কেনাকাটা শুরু করুন।
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/products" />}
            className="h-11 px-6 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-md"
            lang="bn"
          >
            কেনাকাটা শুরু করুন
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map((order) => {
            const itemsCount = order.items?.reduce((sum, it) => sum + it.quantity, 0) || order.items?.length || 1;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-[#f47920]/40 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 bg-gray-50/60 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-extrabold text-[#f47920] bg-orange-50 border border-orange-200/60 px-2.5 py-0.5 rounded-lg">
                      {order.order_number}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(order.created_at).toLocaleDateString("bn-BD")}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-semibold px-2.5 py-0.5 rounded-md self-start sm:self-auto",
                      ORDER_STATUS_CLASS[order.order_status] ?? ""
                    )}
                    lang="bn"
                  >
                    {ORDER_STATUS_BN[order.order_status] ?? order.order_status}
                  </Badge>
                </div>

                {/* Order Summary & Products Preview */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Package className="w-3.5 h-3.5 text-[#f47920]" />
                      <span lang="bn">মোট <strong>{itemsCount}</strong>টি পণ্য</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                        <span lang="bn">{PAYMENT_METHOD_BN[order.payment_method] ?? "ক্যাশ অন ডেলিভারি"}</span>
                      </span>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1">
                        {order.items.map((i) => `${i.product_name} (${i.quantity}x)`).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-left md:text-right">
                      <p className="text-[11px] text-gray-400 font-medium" lang="bn">সর্বমোট মূল্য:</p>
                      <p className="text-base sm:text-lg font-extrabold text-gray-900">
                        {formatTaka(Number(order.total))}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        nativeButton={false}
                        render={<Link href={`/track-order?order=${encodeURIComponent(order.order_number)}`} />}
                        variant="outline"
                        className="h-9 px-3 rounded-xl text-xs font-bold border-gray-200 text-gray-700 hover:border-[#f47920] hover:text-[#f47920]"
                      >
                        <Truck className="w-3.5 h-3.5 mr-1" />
                        <span>ট্র্যাক</span>
                      </Button>
                      <Button
                        nativeButton={false}
                        render={<Link href={`/orders/${order.id}`} />}
                        className="h-9 px-3.5 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>বিস্তারিত</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {data.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl text-xs font-bold"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                আগের পৃষ্ঠা
              </Button>
              <span className="text-xs font-semibold text-muted-foreground" lang="bn">
                পৃষ্ঠা {data.current_page} / {data.last_page}
              </span>
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl text-xs font-bold"
                disabled={page >= data.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                পরের পৃষ্ঠা
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
