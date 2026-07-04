"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn, formatTaka } from "@/lib/utils";
import { ORDER_STATUS_BN, ORDER_STATUS_CLASS } from "@/lib/order-status";
import api from "@/lib/api";
import type { Order, PaginatedResponse } from "@/types";

const STATUSES = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const STATUS_LABEL: Record<(typeof STATUSES)[number], string> = {
  all: "All",
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

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
      const qs = new URLSearchParams({ page: String(page) });
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
    <div className="space-y-4">
      <h1 className="text-xl font-bold md:text-2xl">{heading}</h1>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const active = s === status;
          return (
            <button
              key={s}
              type="button"
              onClick={() => handleStatusChange(s)}
              className={cn(
                "h-9 rounded-full px-3 text-xs font-medium transition-colors",
                active
                  ? "bg-[#f47920] text-white"
                  : "border border-[#e5e7eb] bg-card text-foreground hover:bg-muted",
              )}
            >
              {STATUS_LABEL[s]}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          icon={<Package className="h-7 w-7" />}
          title="No orders yet"
          description="When you place orders, they'll show up here."
          action={
            <Button
              nativeButton={false}
              render={<Link href="/" />}
              className="h-11 bg-[#f47920] hover:bg-[#e56910]"
            >
              Start Shopping
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block"
              >
                <Card className="rounded-xl border border-[#f1f5f9] shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-semibold">
                        {order.order_number}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatTaka(order.total)}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-1",
                          ORDER_STATUS_CLASS[order.order_status] ?? "",
                        )}
                        lang="bn"
                      >
                        {ORDER_STATUS_BN[order.order_status] ?? order.order_status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {data.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                className="h-11 px-4"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.current_page} of {data.last_page}
              </span>
              <Button
                variant="outline"
                className="h-11 px-4"
                disabled={page >= data.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
