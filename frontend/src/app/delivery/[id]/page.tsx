"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { PackageX } from "lucide-react";
import api from "@/lib/api";
import { ORDER_STATUS_BN, PAYMENT_METHOD_BN, PAYMENT_STATUS_BN } from "@/lib/order-status";
import type { Order, OrderStatus } from "@/types";

const TK = "৳";

export default function DeliveryOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
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
    try {
      await api.patch(`/delivery/orders/${id}`, { order_status: next });
      toast.success("আপডেট হয়েছে");
      load();
    } catch {
      toast.error("আপডেট ব্যর্থ হয়েছে");
    }
  };

  if (loading) return <LoadingSpinner fullHeight />;
  if (notFound || !order) {
    return <EmptyState icon={<PackageX className="h-7 w-7" />} title="অর্ডার পাওয়া যায়নি" />;
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.shipping_address)}`;
  const isCod = order.payment_method === "cod";
  const unpaid = order.payment_status !== "paid";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-lg font-bold">{order.order_number}</h1>
        <Badge variant="outline" lang="bn">{ORDER_STATUS_BN[order.order_status] ?? order.order_status}</Badge>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4 text-sm">
          <p className="font-medium">{order.shipping_name}</p>
          <a href={`tel:${order.shipping_phone}`} className="flex items-center gap-2 text-[#f47920]">
            <Phone className="h-4 w-4" /> {order.shipping_phone}
          </a>
          <p className="text-muted-foreground">{order.shipping_address}</p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#f47920]"
          >
            <MapPin className="h-4 w-4" /> <span lang="bn">গুগল ম্যাপে দেখুন</span>
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4 text-sm">
          <p className="font-semibold" lang="bn">পণ্যসমূহ</p>
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="truncate pr-2">{item.product_name} × {item.quantity}</span>
              <span>{TK}{Number(item.subtotal).toLocaleString("en-US")}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between font-bold">
            <span lang="bn">মোট</span>
            <span>{TK}{Number(order.total).toLocaleString("en-US")}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Badge variant="outline" lang="bn">{PAYMENT_METHOD_BN[order.payment_method] ?? order.payment_method}</Badge>
            <Badge variant="outline" lang="bn">{PAYMENT_STATUS_BN[order.payment_status] ?? order.payment_status}</Badge>
          </div>
          {isCod && unpaid && (
            <p className="pt-1 text-right font-semibold text-red-600" lang="bn">
              সংগ্রহ করতে হবে: {TK}{Number(order.total).toLocaleString("en-US")}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-11" onClick={() => updateStatus("processing")}>
          <span lang="bn">পিকআপ করেছি</span>
        </Button>
        {isCod && unpaid ? (
          <Button
            nativeButton={false}
            render={<Link href="/delivery/payment-confirm" />}
            className="h-11 bg-[#f47920] hover:bg-[#e56910]"
          >
            <span lang="bn">কোড দিয়ে পেমেন্ট কনফার্ম করুন →</span>
          </Button>
        ) : (
          <Button className="h-11 bg-[#f47920] hover:bg-[#e56910]" onClick={() => updateStatus("delivered")}>
            <span lang="bn">ডেলিভারি দিয়েছি</span>
          </Button>
        )}
      </div>
    </div>
  );
}
