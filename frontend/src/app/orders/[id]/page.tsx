"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { ImageOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { PackageOpen } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  ORDER_STATUS_BN,
  ORDER_STATUS_CLASS,
  PAYMENT_METHOD_BN,
  PAYMENT_STATUS_BN,
} from "@/lib/order-status";
import type { Order } from "@/types";

const TK = "৳";
const fmt = (v: string) => `${TK}${Number(v).toLocaleString("en-US")}`;

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
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          icon={<PackageOpen className="h-7 w-7" />}
          title="অর্ডার পাওয়া যায়নি"
          description="এই অর্ডারটি খুঁজে পাওয়া যায়নি।"
        />
      </div>
    );
  }

  const addr = order.delivery_address;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-bold">{order.order_number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleString("en-GB")}
          </p>
        </div>
        <Badge variant="outline" className={ORDER_STATUS_CLASS[order.order_status] ?? ""} lang="bn">
          {ORDER_STATUS_BN[order.order_status] ?? order.order_status}
        </Badge>
      </div>

      {/* COD payment code — show only when an active COD payment is awaiting collection. */}
      {order.payment_method === "cod"
        && order.payment_status === "pending"
        && order.payment_code && (
        <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="mb-3 text-sm font-medium text-orange-800" lang="bn">
            ডেলিভারি এজেন্টকে এই কোডটি দেখান
          </p>
          <div className="flex flex-col items-center gap-4">
            <p className="font-mono text-4xl font-bold tracking-[0.3em] text-[#f47920]">
              {order.payment_code}
            </p>
            <div className="rounded-lg bg-white p-2">
              <QRCode value={order.payment_code} size={128} />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-orange-600" lang="bn">
            ক্যাশ সংগ্রহের সময় এজেন্ট এই কোড ব্যবহার করবে
          </p>
        </div>
      )}

      {/* Items */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="mb-3 font-semibold" lang="bn">পণ্যসমূহ</h2>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {(() => {
                  const displayImage = item.product?.images?.[0];
                  const imageUrl = displayImage?.url;
                  const isExternal = displayImage?.disk === "external";
                  return (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
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
                  );
                })()}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmt(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="text-sm font-semibold">{fmt(item.subtotal)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Delivery address */}
        <Card>
          <CardContent className="space-y-1 p-4 text-sm">
            <h2 className="mb-2 font-semibold" lang="bn">ডেলিভারি ঠিকানা</h2>
            <p className="font-medium">{order.shipping_name}</p>
            <p>{order.shipping_phone}</p>
            <p className="text-muted-foreground">{order.shipping_address}</p>
            {addr?.zone && <p className="text-muted-foreground">{addr.zone}</p>}
          </CardContent>
        </Card>

        {/* Payment + totals */}
        <Card>
          <CardContent className="space-y-2 p-4 text-sm">
            <h2 className="mb-2 font-semibold" lang="bn">পেমেন্ট</h2>
            <div className="flex justify-between">
              <span lang="bn">পদ্ধতি</span>
              <span lang="bn">{PAYMENT_METHOD_BN[order.payment_method] ?? order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span lang="bn">অবস্থা</span>
              <span lang="bn">{PAYMENT_STATUS_BN[order.payment_status] ?? order.payment_status}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span lang="bn">সাবটোটাল</span>
              <span>{fmt(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span lang="bn">ডেলিভারি</span>
              <span>{fmt(order.delivery_charge)}</span>
            </div>
            <div className="flex justify-between">
              <span lang="bn">ছাড়</span>
              <span>−{fmt(order.discount)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span lang="bn">মোট</span>
              <span>{fmt(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
