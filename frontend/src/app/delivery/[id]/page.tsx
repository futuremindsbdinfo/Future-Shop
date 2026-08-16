"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  ArrowLeft,
  Truck,
  Package,
  CreditCard,
  CheckCircle2,
  KeyRound,
  ExternalLink,
  PhoneCall,
  Calendar,
  AlertTriangle,
  Receipt,
  ImageOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { PackageX } from "lucide-react";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import { ORDER_STATUS_BN, ORDER_STATUS_CLASS, PAYMENT_METHOD_BN, PAYMENT_STATUS_BN } from "@/lib/order-status";
import type { Order, OrderStatus } from "@/types";

export default function DeliveryOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ data: Order }>(`/delivery/orders/${id}`)
      .then((r) => setOrder(r.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (next: OrderStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/delivery/orders/${id}`, { order_status: next });
      toast.success(`অর্ডার স্ট্যাটাস '${ORDER_STATUS_BN[next] ?? next}' আপডেট হয়েছে!`);
      load();
    } catch {
      toast.error("আপডেট ব্যর্থ হয়েছে");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner fullHeight />;
  if (notFound || !order) {
    return (
      <div className="py-12">
        <EmptyState
          icon={<PackageX className="h-10 w-10 text-[#f47920]" />}
          title="অর্ডার পাওয়া যায়নি"
          description="এই অর্ডারের তথ্য লোড করা যায়নি অথবা এটি মুছে ফেলা হয়েছে।"
          action={
            <Button
              nativeButton={false}
              render={<Link href="/delivery" />}
              className="h-11 bg-[#f47920] hover:bg-[#d46212] rounded-xl text-white font-bold"
            >
              আজকের তালিকায় ফিরে যান
            </Button>
          }
        />
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${order.shipping_address}, Sherpur, Bogura`
  )}`;
  const isCod = order.payment_method === "cod";
  const unpaid = order.payment_status !== "paid";
  const isDelivered = order.order_status === "delivered";

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-10">
      
      {/* Top Back Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <Link
          href="/delivery"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#f47920] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ডেলিভারি তালিকা</span>
        </Link>

        <Badge
          variant="outline"
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${ORDER_STATUS_CLASS[order.order_status] ?? ""}`}
          lang="bn"
        >
          {ORDER_STATUS_BN[order.order_status] ?? order.order_status}
        </Badge>
      </div>

      {/* Order Info & Number */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">অর্ডার নম্বর</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {new Date(order.created_at).toLocaleString("bn-BD")}
          </span>
        </div>
        <p className="font-mono text-xl sm:text-2xl font-black text-[#f47920]">
          {order.order_number}
        </p>
      </div>

      {/* Customer Contact & Maps Navigation Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900 border-b border-gray-100 pb-2.5" lang="bn">
          <MapPin className="w-4 h-4 text-[#f47920]" />
          <span>গ্রাহক ও ডেলিভারির ঠিকানা</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <p className="text-base font-extrabold text-gray-900">{order.shipping_name}</p>
          <p className="text-sm font-mono font-bold text-gray-700">{order.shipping_phone}</p>
          <p className="text-gray-600 leading-relaxed text-sm pt-0.5">{order.shipping_address}</p>
        </div>

        {/* 2 Fast Action Buttons: Call & Google Maps */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {order.shipping_phone && (
            <a
              href={`tel:${order.shipping_phone}`}
              className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>সরাসরি কল করুন</span>
            </a>
          )}

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>গুগল ম্যাপে দেখুন</span>
          </a>
        </div>
      </div>

      {/* COD Cash Collection Alert Card */}
      {isCod && unpaid && (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50/70 p-4 sm:p-5 text-center space-y-1.5 shadow-2xs">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ক্যাশ অন ডেলিভারি (COD)</span>
          </div>
          <p className="text-xs text-red-800 font-medium" lang="bn">
            কাস্টমারের কাছ থেকে মোট নগদ টাকা আদায় করতে হবে:
          </p>
          <p className="font-mono text-3xl font-black text-red-600">
            {formatTaka(Number(order.total))}
          </p>
        </div>
      )}

      {/* Products Items List */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900 border-b border-gray-100 pb-2.5" lang="bn">
          <Package className="w-4 h-4 text-[#f47920]" />
          <span>পার্সেলের পণ্যসমূহ ({order.items?.length ?? 1}টি)</span>
        </div>

        <div className="divide-y divide-gray-100">
          {order.items?.map((item) => {
            const displayImage = item.product?.images?.[0];
            const imageUrl = displayImage?.url;

            return (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.product_name}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized={displayImage?.disk === "external"}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageOff className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.product_name}</p>
                    <p className="text-muted-foreground mt-0.5">
                      {formatTaka(Number(item.price))} × <strong>{item.quantity}টি</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 font-bold text-gray-900">
                  {formatTaka(Number(item.subtotal))}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Bill Breakdown */}
        <div className="space-y-1.5 text-xs text-gray-600 pt-1">
          <div className="flex justify-between">
            <span lang="bn">সাবটোটাল:</span>
            <span>{formatTaka(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span lang="bn">ডেলিভারি চার্জ:</span>
            <span>{formatTaka(Number(order.delivery_charge))}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-green-600 font-semibold">
              <span lang="bn">ডিসকাউন্ট:</span>
              <span>−{formatTaka(Number(order.discount))}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-100">
            <span lang="bn">সর্বমোট মূল্য:</span>
            <span className="text-[#f47920]">{formatTaka(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Rider Status Action Buttons */}
      {!isDelivered ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <Button
            variant="outline"
            disabled={updating}
            onClick={() => updateStatus("processing")}
            className="h-12 rounded-xl text-xs font-bold border-gray-200 text-gray-700 hover:border-[#f47920] hover:text-[#f47920]"
          >
            <Truck className="w-4 h-4 mr-1.5" />
            <span>পিকআপ করেছি (On the way)</span>
          </Button>

          {isCod && unpaid ? (
            <Button
              nativeButton={false}
              render={<Link href={`/delivery/payment-confirm?order=${encodeURIComponent(order.order_number)}`} />}
              className="h-12 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>৬-ডিজিট কোড দিয়ে কনফার্ম করুন →</span>
            </Button>
          ) : (
            <Button
              disabled={updating}
              onClick={() => updateStatus("delivered")}
              className="h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ডেলিভারি সম্পন্ন হয়েছে ✓</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-center text-green-800 text-xs font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>এই পার্সেলটির ডেলিভারি সফলভাবে সম্পন্ন হয়েছে</span>
        </div>
      )}

    </div>
  );
}
