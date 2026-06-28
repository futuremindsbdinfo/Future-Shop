"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import api from "@/lib/api";
import { ORDER_STATUS_BN, PAYMENT_METHOD_BN } from "@/lib/order-status";
import type { Order, OrderStatus } from "@/types";

const TK = "৳";

export default function DeliveryHomePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ data: Order[] }>("/delivery/orders")
      .then((r) => setOrders(r.data.data))
      .catch(() => toast.error("অর্ডার লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (order: Order, next: OrderStatus) => {
    try {
      await api.patch(`/delivery/orders/${order.id}`, { order_status: next });
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
      load();
    } catch {
      toast.error("আপডেট ব্যর্থ হয়েছে");
    }
  };

  if (loading) return <LoadingSpinner fullHeight />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<PackageCheck className="h-7 w-7" />}
        title="আজ কোনো অর্ডার নেই"
        description="নতুন অর্ডার অ্যাসাইন হলে এখানে দেখা যাবে।"
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold" lang="bn">আজকের অর্ডার ({orders.length})</h1>
      {orders.map((order) => {
        const isCod = order.payment_method === "cod";
        const unpaid = order.payment_status !== "paid";
        return (
          <Card key={order.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/delivery/${order.id}`} className="font-mono font-semibold text-[#f47920]">
                  {order.order_number}
                </Link>
                <Badge variant="outline" lang="bn">{ORDER_STATUS_BN[order.order_status] ?? order.order_status}</Badge>
              </div>

              <div className="text-sm">
                <p className="font-medium">{order.shipping_name}</p>
                <p className="text-muted-foreground">{order.shipping_address}</p>
                <p className="mt-1 text-muted-foreground">{order.items?.length ?? 0} <span lang="bn">টি পণ্য</span> · {TK}{Number(order.total).toLocaleString("en-US")}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Badge variant="outline" lang="bn">{PAYMENT_METHOD_BN[order.payment_method] ?? order.payment_method}</Badge>
                {isCod && unpaid && (
                  <span className="font-semibold text-red-600" lang="bn">সংগ্রহ: {TK}{Number(order.total).toLocaleString("en-US")}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-11" onClick={() => updateStatus(order, "processing")}>
                  <span lang="bn">পিকআপ করেছি</span>
                </Button>
                {/* COD + unpaid must settle via the 6-digit code flow — no codeless
                    "delivered" here (the backend also blocks it). Mirrors /delivery/[id]. */}
                {isCod && unpaid ? (
                  <Button
                    nativeButton={false}
                    render={<Link href="/delivery/payment-confirm" />}
                    className="h-11 bg-[#f47920] hover:bg-[#e56910]"
                  >
                    <span lang="bn">কোড দিয়ে কনফার্ম করুন →</span>
                  </Button>
                ) : (
                  <Button className="h-11 bg-[#f47920] hover:bg-[#e56910]" onClick={() => updateStatus(order, "delivered")}>
                    <span lang="bn">ডেলিভারি দিয়েছি</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
