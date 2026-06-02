"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { ORDER_STATUS_BN, ORDER_STATUSES, PAYMENT_STATUS_BN } from "@/lib/order-status";
import type { Order, OrderStatus, PaginatedResponse } from "@/types";

const TK = "৳";

interface DeliveryUser {
  id: number;
  name: string;
  phone: string | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryUsers, setDeliveryUsers] = useState<DeliveryUser[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: DeliveryUser[] }>("/admin/delivery-users")
      .then((r) => setDeliveryUsers(r.data.data))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("order_status", statusFilter);
    api
      .get<PaginatedResponse<Order>>(`/admin/orders?${params.toString()}`)
      .then((r) => setOrders(r.data.data))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (order: Order, next: OrderStatus) => {
    try {
      await api.patch(`/admin/orders/${order.id}`, { order_status: next });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, order_status: next } : o)));
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
    } catch {
      toast.error("আপডেট ব্যর্থ হয়েছে");
    }
  };

  const assignDelivery = async (order: Order, deliveryUserId: string) => {
    const value = deliveryUserId ? Number(deliveryUserId) : null;
    try {
      await api.patch(`/admin/orders/${order.id}`, { delivery_user_id: value });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, delivery_user_id: value } : o)));
      toast.success(value ? "ডেলিভারি অ্যাসাইন হয়েছে" : "অ্যাসাইনমেন্ট সরানো হয়েছে");
    } catch {
      toast.error("অ্যাসাইন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="h-11 rounded-md border border-input bg-transparent px-3 text-sm"
      >
        <option value="">All statuses</option>
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{ORDER_STATUS_BN[s]}</option>
        ))}
      </select>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : orders.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No orders found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.order_number}</TableCell>
                    <TableCell>{order.user?.name ?? "—"}</TableCell>
                    <TableCell>{TK}{Number(order.total).toLocaleString("en-US")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" lang="bn">
                        {PAYMENT_STATUS_BN[order.payment_status] ?? order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <select
                        value={order.order_status}
                        onChange={(e) => updateStatus(order, e.target.value as OrderStatus)}
                        className="h-11 rounded-md border border-input bg-transparent px-2 text-sm"
                        lang="bn"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{ORDER_STATUS_BN[s]}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.order_status === "delivered" || order.order_status === "cancelled" ? (
                        <span className="text-sm text-muted-foreground">
                          {order.deliveryUser?.name ?? "—"}
                        </span>
                      ) : (
                        <select
                          value={order.delivery_user_id ?? ""}
                          onChange={(e) => assignDelivery(order, e.target.value)}
                          className="h-11 rounded-md border border-input bg-transparent px-2 text-sm"
                          aria-label="Assign delivery agent"
                        >
                          <option value="">Assign…</option>
                          {deliveryUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}{u.phone ? ` (${u.phone})` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
