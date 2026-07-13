"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackageOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Order, OrderStatus, PaginatedResponse } from "@/types";

const TK = "৳";
const formatTk = (value: string) => `${TK}${Number(value).toLocaleString("en-US")}`;

const STATUS_BN: Record<OrderStatus | "confirmed", string> = {
  pending: "অপেক্ষমান",
  confirmed: "নিশ্চিত",
  processing: "প্রস্তুতি চলছে",
  shipped: "পাঠানো হয়েছে",
  delivered: "পৌঁছে গেছে",
  cancelled: "বাতিল",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "border-amber-300 text-amber-700",
  confirmed: "border-blue-300 text-blue-700",
  processing: "border-blue-300 text-blue-700",
  shipped: "border-indigo-300 text-indigo-700",
  delivered: "border-green-300 text-green-700",
  cancelled: "border-red-300 text-red-700",
};

export default function OrdersPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Wait one tick for AuthHydrator to restore from sessionStorage.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/?auth=login&next=/orders");
      return;
    }
    api
      .get<PaginatedResponse<Order>>("/orders")
      .then((res) => setOrders(res.data.data))
      .catch(() => {
        /* 401 is handled by the api interceptor (redirects to login) */
      })
      .finally(() => setLoading(false));
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) return <LoadingSpinner fullHeight />;
  if (!isAuthenticated || loading) {
    return <LoadingSpinner fullHeight />;
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          icon={<PackageOpen className="h-7 w-7" />}
          title="কোনো অর্ডার নেই"
          description="আপনি এখনও কোনো অর্ডার করেননি।"
          action={
            <Button nativeButton={false} render={<Link href="/products" />} className="h-11 bg-[#f47920] hover:bg-[#e56910]">
              <span lang="bn">কেনাকাটা শুরু করুন</span>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold" lang="bn">আমার অর্ডার</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`} className="block">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-mono font-semibold">{order.order_number}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatTk(order.total)}</p>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${STATUS_CLASS[order.order_status] ?? ""}`}
                    lang="bn"
                  >
                    {STATUS_BN[order.order_status] ?? order.order_status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
