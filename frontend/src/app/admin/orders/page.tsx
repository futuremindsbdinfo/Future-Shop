"use client";

import { Fragment, Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight } from "lucide-react";
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

function AdminOrdersContent() {
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryUsers, setDeliveryUsers] = useState<DeliveryUser[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState(
    searchParams.get("assignment_status") === "assigned_pending" ? "assigned_pending" : "",
  );
  const [riderFilter, setRiderFilter] = useState(searchParams.get("delivery_user_id") ?? "");
  const [loading, setLoading] = useState(true);

  // Collapsible items state
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Verify online payment dialog (Batch E-2).
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [txInput, setTxInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  const openVerify = (order: Order) => {
    setVerifyingOrder(order);
    setTxInput(order.online_transaction_id ?? "");
  };

  const submitVerify = async () => {
    if (!verifyingOrder) return;
    const txId = txInput.trim();
    if (!txId) {
      toast.error("Transaction ID আবশ্যক");
      return;
    }
    setVerifying(true);
    try {
      await api.patch(`/admin/orders/${verifyingOrder.id}/verify-payment`, {
        transaction_id: txId,
      });
      toast.success("Payment verified");
      setVerifyingOrder(null);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "Verify failed");
    } finally {
      setVerifying(false);
    }
  };

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
    if (assignmentFilter) params.set("assignment_status", assignmentFilter);
    if (riderFilter) params.set("delivery_user_id", riderFilter);
    api
      .get<PaginatedResponse<Order>>(`/admin/orders?${params.toString()}`)
      .then((r) => setOrders(r.data.data))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, [statusFilter, assignmentFilter, riderFilter]);

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

      <div className="flex flex-wrap items-center gap-2">
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

        <button
          type="button"
          onClick={() => setAssignmentFilter((prev) => (prev === "assigned_pending" ? "" : "assigned_pending"))}
          className={`h-11 rounded-md border px-4 text-sm font-medium transition-colors ${
            assignmentFilter === "assigned_pending"
              ? "border-[#f47920] bg-[#f47920] text-white"
              : "border-input bg-transparent text-foreground hover:bg-muted"
          }`}
        >
          Assigned &amp; Pending
        </button>

        <select
          value={riderFilter}
          onChange={(e) => setRiderFilter(e.target.value)}
          className="h-11 rounded-md border border-input bg-transparent px-3 text-sm"
          aria-label="Filter by delivery agent"
        >
          <option value="">All riders</option>
          {deliveryUsers.map((u) => (
            <option key={u.id} value={u.id}>{u.name}{u.phone ? ` (${u.phone})` : ""}</option>
          ))}
        </select>
      </div>

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
                  <Fragment key={order.id}>
                    <TableRow className={expandedId === order.id ? "bg-slate-50/50" : ""}>
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 hover:bg-slate-200"
                            onClick={() => toggleExpand(order.id)}
                            aria-label="Toggle details"
                          >
                            {expandedId === order.id ? (
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-500" />
                            )}
                          </Button>
                          <span>{order.order_number}</span>
                        </div>
                      </TableCell>
                    <TableCell>{order.user?.name ?? "—"}</TableCell>
                    <TableCell>{TK}{Number(order.total).toLocaleString("en-US")}</TableCell>
                    <TableCell>
                      {order.payment_status === "paid" ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Paid
                        </Badge>
                      ) : order.payment_method === "cod" && order.payment_code ? (
                        <span className="font-mono text-sm font-semibold text-[#f47920]">
                          {order.payment_code}
                        </span>
                      ) : order.payment_method !== "cod" ? (
                        <Button
                          variant="outline"
                          className="h-9 border-[#f47920] text-[#f47920] hover:bg-[#fff7ed]"
                          onClick={() => openVerify(order)}
                        >
                          Verify
                        </Button>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
                          Pending
                        </Badge>
                      )}
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
                  {expandedId === order.id && (
                    <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                      <TableCell colSpan={7} className="p-4">
                        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm space-y-3">
                          <h4 className="font-semibold text-sm text-slate-800" lang="bn">অর্ডারকৃত পণ্যসমূহ:</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100 text-slate-500 font-medium">
                                  <th className="py-2 pr-4 text-slate-500" lang="bn">পণ্য</th>
                                  <th className="py-2 px-4 text-center text-slate-500" lang="bn">পরিমাণ</th>
                                  <th className="py-2 px-4 text-right text-slate-500" lang="bn">মূল্য</th>
                                  <th className="py-2 pl-4 text-right text-slate-500" lang="bn">উপমোট</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {order.items?.map((item) => (
                                  <tr key={item.id}>
                                    <td className="py-2 pr-4 font-medium text-slate-700">{item.product_name}</td>
                                    <td className="py-2 px-4 text-center text-slate-600">{item.quantity}</td>
                                    <td className="py-2 px-4 text-right text-slate-600">{TK}{Number(item.price).toLocaleString("en-US")}</td>
                                    <td className="py-2 pl-4 text-right font-semibold text-slate-800">{TK}{Number(item.subtotal).toLocaleString("en-US")}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Verify online payment dialog */}
      <Dialog open={!!verifyingOrder} onOpenChange={(o) => !o && setVerifyingOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
          </DialogHeader>
          {verifyingOrder && (
            <div className="space-y-3 py-2 text-sm">
              <div>
                <span className="text-muted-foreground">Order</span>
                <p className="font-mono font-semibold">{verifyingOrder.order_number}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Amount</span>
                <p className="font-semibold">
                  {TK}{Number(verifyingOrder.total).toLocaleString("en-US")}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Method</span>
                <p className="font-medium">{verifyingOrder.payment_method}</p>
              </div>
              <div className="space-y-1 pt-2">
                <label className="text-sm font-medium">
                  Transaction ID
                </label>
                <Input
                  className="h-11 font-mono"
                  value={txInput}
                  onChange={(e) => setTxInput(e.target.value)}
                  placeholder="Enter gateway transaction id"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setVerifyingOrder(null)}
              variant="ghost"
              className="h-11"
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button
              onClick={submitVerify}
              className="h-11 bg-[#f47920] hover:bg-[#e56910]"
              disabled={verifying}
            >
              {verifying ? "Verifying..." : "Mark Paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminOrdersContent />
    </Suspense>
  );
}
