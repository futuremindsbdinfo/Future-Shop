"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  PackageCheck,
  Truck,
  PhoneCall,
  MapPin,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Package,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import { ORDER_STATUS_BN, ORDER_STATUS_CLASS, PAYMENT_METHOD_BN } from "@/lib/order-status";
import type { Order, OrderStatus } from "@/types";

export default function DeliveryHomePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "delivered">("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ data: Order[] }>("/delivery/orders")
      .then((r) => setOrders(r.data.data ?? []))
      .catch(() => toast.error("অর্ডার লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (order: Order, next: OrderStatus) => {
    setUpdatingId(order.id);
    try {
      await api.patch(`/delivery/orders/${order.id}`, { order_status: next });
      toast.success(`অর্ডার স্ট্যাটাস '${ORDER_STATUS_BN[next] ?? next}' আপডেট হয়েছে!`);
      load();
    } catch {
      toast.error("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner fullHeight />;

  // Calculate quick metrics for the rider
  const totalAssigned = orders.length;
  const pendingCount = orders.filter((o) => o.order_status !== "delivered" && o.order_status !== "cancelled").length;
  const deliveredCount = orders.filter((o) => o.order_status === "delivered").length;
  const totalCodToCollect = orders
    .filter((o) => o.payment_method === "cod" && o.payment_status !== "paid" && o.order_status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === "pending") return order.order_status !== "delivered" && order.order_status !== "cancelled";
    if (filter === "delivered") return order.order_status === "delivered";
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight" lang="bn">
            আজকের ডেলিভারি তালিকা
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            শেরপুর জোন • মোট {totalAssigned}টি পার্সেল
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={load}
          className="h-9 px-3 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:text-[#f47920] hover:border-[#f47920] shadow-2xs gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>রিফ্রেশ</span>
        </Button>
      </div>

      {/* 3 Rider Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3.5 text-center shadow-2xs">
          <p className="text-[11px] font-bold text-blue-700" lang="bn">মোট পার্সেল</p>
          <p className="text-xl sm:text-2xl font-black text-blue-900 mt-0.5">{totalAssigned}</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5 text-center shadow-2xs">
          <p className="text-[11px] font-bold text-amber-700" lang="bn">ডেলিভারি বাকি</p>
          <p className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">{pendingCount}</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-center shadow-2xs">
          <p className="text-[11px] font-bold text-emerald-700" lang="bn">ক্যাশ সংগ্রহ</p>
          <p className="text-sm sm:text-base font-black text-emerald-900 mt-1 truncate">
            {formatTaka(totalCodToCollect)}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            filter === "all"
              ? "bg-[#f47920] text-white border-[#f47920] shadow-xs"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          সকল অর্ডার ({totalAssigned})
        </button>

        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            filter === "pending"
              ? "bg-[#f47920] text-white border-[#f47920] shadow-xs"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          ডেলিভারি বাকি ({pendingCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter("delivered")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            filter === "delivered"
              ? "bg-[#f47920] text-white border-[#f47920] shadow-xs"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          সম্পন্ন ({deliveredCount})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm text-center max-w-md mx-auto space-y-3">
          <PackageCheck className="w-12 h-12 text-[#f47920] mx-auto" />
          <h2 className="text-base font-bold text-gray-900" lang="bn">
            {filter === "pending" ? "কোনো বাকি ডেলিভারি নেই!" : "কোনো অর্ডার অ্যাসাইন করা নেই"}
          </h2>
          <p className="text-xs text-muted-foreground" lang="bn">
            অ্যাডমিন প্যানেল থেকে নতুন অর্ডার বরাদ্দ করলে এখানে স্বয়ংক্রিয়ভাবে ভেসে উঠবে।
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCod = order.payment_method === "cod";
            const unpaid = order.payment_status !== "paid";
            const isDelivered = order.order_status === "delivered";

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs space-y-4 transition-all ${
                  isDelivered ? "border-gray-100 opacity-80" : "border-gray-200 hover:border-[#f47920]/50 hover:shadow-md"
                }`}
              >
                {/* Card Top: Order Number + Status */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <Link
                    href={`/delivery/${order.id}`}
                    className="font-mono text-sm font-black text-[#f47920] hover:underline flex items-center gap-1"
                  >
                    <span>{order.order_number}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${ORDER_STATUS_CLASS[order.order_status] ?? ""}`}
                    lang="bn"
                  >
                    {ORDER_STATUS_BN[order.order_status] ?? order.order_status}
                  </Badge>
                </div>

                {/* Customer Details & 1-Click Call Button */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1 text-xs">
                    <p className="text-sm font-bold text-gray-900">{order.shipping_name}</p>
                    <p className="text-gray-600 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>{order.shipping_address}</span>
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1.5 pt-0.5">
                      <Package className="w-3.5 h-3.5 text-gray-400" />
                      <span>মোট {order.items?.length ?? 1}টি পণ্য • বিল: <strong>{formatTaka(Number(order.total))}</strong></span>
                    </p>
                  </div>

                  {/* 1-Click Phone Call Button */}
                  {order.shipping_phone && (
                    <a
                      href={`tel:${order.shipping_phone}`}
                      className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-xs shrink-0 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>কল করুন</span>
                    </a>
                  )}
                </div>

                {/* Payment Badge & COD Collect Indicator */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <Badge variant="outline" className="text-gray-700 font-semibold bg-gray-50" lang="bn">
                    <CreditCard className="w-3 h-3 mr-1" />
                    <span>{PAYMENT_METHOD_BN[order.payment_method] ?? order.payment_method}</span>
                  </Badge>

                  {isCod && unpaid ? (
                    <span className="font-extrabold text-red-600 bg-red-50 border border-red-200/60 px-2.5 py-0.5 rounded-lg text-xs" lang="bn">
                      ক্যাশ আদায়: {formatTaka(Number(order.total))}
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg text-xs" lang="bn">
                      পেমেন্ট সম্পন্ন ✓
                    </span>
                  )}
                </div>

                {/* Rider Action Buttons */}
                {!isDelivered && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      disabled={updatingId === order.id}
                      onClick={() => updateStatus(order, "processing")}
                      className="h-10 rounded-xl text-xs font-bold border-gray-200 text-gray-700 hover:border-[#f47920] hover:text-[#f47920]"
                    >
                      <Truck className="w-3.5 h-3.5 mr-1.5" />
                      <span>পিকআপ করেছি (On the way)</span>
                    </Button>

                    {isCod && unpaid ? (
                      <Button
                        nativeButton={false}
                        render={<Link href={`/delivery/payment-confirm?order=${encodeURIComponent(order.order_number)}`} />}
                        className="h-10 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>৬-ডিজিট কোড দিয়ে ডেলিভারি দিন →</span>
                      </Button>
                    ) : (
                      <Button
                        disabled={updatingId === order.id}
                        onClick={() => updateStatus(order, "delivered")}
                        className="h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ডেলিভারি সম্পন্ন করেছি ✓</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
