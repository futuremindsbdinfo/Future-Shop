"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "react-qr-code";
import {
  ImageOff,
  PackageOpen,
  Truck,
  Printer,
  ArrowLeft,
  Calendar,
  PhoneCall,
  MessageCircle,
  MapPin,
  CreditCard,
  Receipt,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatTaka } from "@/lib/utils";
import {
  ORDER_STATUS_BN,
  ORDER_STATUS_CLASS,
  PAYMENT_METHOD_BN,
  PAYMENT_STATUS_BN,
} from "@/lib/order-status";
import type { Order } from "@/types";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Wait one tick for AuthHydrator to restore from sessionStorage.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(`/?auth=login&next=/orders/${id}`);
      return;
    }
    api
      .get<{ data: Order }>(`/orders/${id}`)
      .then((res) => setOrder(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [hydrated, id, isAuthenticated, router]);

  if (!hydrated) return <LoadingSpinner fullHeight />;
  if (!isAuthenticated || loading) return <LoadingSpinner fullHeight />;

  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={<PackageOpen className="h-10 w-10 text-[#f47920]" />}
          title="অর্ডারটি পাওয়া যায়নি"
          description="আপনার অনুরোধকৃত অর্ডার আইডিটি সঠিক নয় অথবা মুছে ফেলা হয়েছে।"
          action={
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/orders" />}
              className="h-11 bg-[#f47920] hover:bg-[#d46212] rounded-xl text-white font-bold"
            >
              সকল অর্ডার দেখুন
            </Button>
          }
        />
      </div>
    );
  }

  const addr = order.delivery_address;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: "ড্যাশবোর্ড", url: "/dashboard" },
          { label: "আমার অর্ডারসমূহ", url: "/dashboard/orders" },
          { label: order.order_number },
        ]}
      />

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl sm:text-2xl font-extrabold text-gray-900">
              {order.order_number}
            </h1>
            <Badge
              variant="outline"
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${ORDER_STATUS_CLASS[order.order_status] ?? ""}`}
              lang="bn"
            >
              {ORDER_STATUS_BN[order.order_status] ?? order.order_status}
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>অর্ডারের সময়: {new Date(order.created_at).toLocaleString("bn-BD")}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            nativeButton={false}
            render={<Link href={`/track-order?order=${encodeURIComponent(order.order_number)}`} />}
            className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs"
          >
            <Truck className="w-3.5 h-3.5 mr-1.5" />
            <span>লাইভ ট্র্যাক করুন</span>
          </Button>

          <Button
            onClick={() => window.print()}
            variant="outline"
            className="h-10 px-3.5 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            <span>প্রিন্ট মেমো</span>
          </Button>
        </div>
      </div>

      {/* COD Payment Code Box — show only when an active COD payment is awaiting collection */}
      {order.payment_method === "cod"
        && order.payment_status === "pending"
        && order.payment_code && (
        <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/60 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#f47920] bg-white px-2.5 py-0.5 rounded-md shadow-2xs">
                <Sparkles className="w-3 h-3" />
                ক্যাশ অন ডেলিভারি কোড
              </span>
              <h3 className="text-base font-bold text-gray-900" lang="bn">
                ডেলিভারি রাইডারকে এই কোডটি দেখান
              </h3>
              <p className="text-xs text-muted-foreground max-w-md" lang="bn">
                পণ্য গ্রহণের সময় রাইডার এই কোডটি মিলিয়ে আপনার ক্যাশ পেমেন্ট কনফার্ম করবে।
              </p>
              <p className="font-mono text-3xl sm:text-4xl font-extrabold tracking-[0.25em] text-[#f47920] pt-2">
                {order.payment_code}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-orange-100 shadow-xs shrink-0 mx-auto sm:mx-0">
              <QRCode value={order.payment_code} size={110} />
              <span className="text-[10px] font-semibold text-gray-400 mt-1">স্ক্যান কিউআর কোড</span>
            </div>
          </div>
        </div>
      )}

      {/* Products Items List */}
      <div className="rounded-3xl bg-white border border-gray-100 p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-extrabold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2" lang="bn">
          <Receipt className="w-4 h-4 text-[#f47920]" />
          <span>অর্ডারকৃত পণ্যসমূহ</span>
        </h2>

        <div className="divide-y divide-gray-100">
          {order.items?.map((item) => {
            const displayImage = item.product?.images?.[0];
            const imageUrl = displayImage?.url;
            const isExternal = displayImage?.disk === "external";

            return (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.product_name}
                        fill
                        sizes="56px"
                        className="object-cover"
                        unoptimized={isExternal}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageOff className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs sm:text-sm font-bold text-gray-900">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTaka(Number(item.price))} × <span className="font-bold text-gray-700">{item.quantity}টি</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-[#f47920]">
                    {formatTaka(Number(item.subtotal))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Columns: Shipping Address & Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Delivery Address Card */}
        <div className="rounded-3xl bg-white border border-gray-100 p-5 sm:p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-extrabold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2" lang="bn">
            <MapPin className="w-4 h-4 text-[#f47920]" />
            <span>ডেলিভারি ঠিকানা</span>
          </h2>
          <div className="text-xs space-y-1.5 text-gray-700">
            <p className="font-bold text-sm text-gray-900">{order.shipping_name}</p>
            <p className="font-mono text-gray-600">{order.shipping_phone}</p>
            <p className="text-gray-600 leading-relaxed">{order.shipping_address}</p>
            {addr?.zone && (
              <span className="inline-block bg-orange-50 text-[#f47920] font-semibold px-2 py-0.5 rounded text-[11px] mt-1">
                জোন: {addr.zone}
              </span>
            )}
          </div>
        </div>

        {/* Payment & Price Summary */}
        <div className="rounded-3xl bg-white border border-gray-100 p-5 sm:p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-extrabold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2" lang="bn">
            <CreditCard className="w-4 h-4 text-[#f47920]" />
            <span>পেমেন্ট ও হিসাব বিবরণী</span>
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span lang="bn">পেমেন্ট মাধ্যম:</span>
              <span className="font-bold text-gray-900" lang="bn">
                {PAYMENT_METHOD_BN[order.payment_method] ?? order.payment_method}
              </span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span lang="bn">পেমেন্ট স্ট্যাটাস:</span>
              <span className="font-bold text-emerald-600" lang="bn">
                {PAYMENT_STATUS_BN[order.payment_status] ?? order.payment_status}
              </span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between text-gray-600">
              <span lang="bn">পণ্য সাবটোটাল:</span>
              <span className="font-semibold">{formatTaka(Number(order.subtotal))}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span lang="bn">ডেলিভারি চার্জ:</span>
              <span className="font-semibold">{formatTaka(Number(order.delivery_charge))}</span>
            </div>

            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span lang="bn">কুপন / অফার ছাড়:</span>
                <span>−{formatTaka(Number(order.discount))}</span>
              </div>
            )}

            <Separator className="my-2" />

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-gray-900" lang="bn">সর্বমোট মূল্য:</span>
              <span className="text-lg font-extrabold text-[#f47920]">
                {formatTaka(Number(order.total))}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Support Card */}
      <div className="rounded-2xl bg-gray-50 border border-gray-200/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <p className="font-bold text-gray-900" lang="bn">এই অর্ডার নিয়ে কোনো প্রশ্ন বা পরিবর্তন করতে চান?</p>
          <p className="text-muted-foreground" lang="bn">আমাদের কাস্টমার কেয়ার সেন্টারে যোগাযোগ করুন</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="tel:01813354648"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 font-bold text-gray-800 hover:text-[#f47920]"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#f47920]" />
            <span>01813354648</span>
          </a>
          <a
            href="https://wa.me/8801813354648"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#20bd5a]"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

    </div>
  );
}
