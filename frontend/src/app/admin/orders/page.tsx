"use client";

import { Fragment, Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Phone,
  MapPin,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  Truck,
  UserCheck,
  UserX,
  CreditCard,
  Banknote,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatTaka } from "@/lib/utils";
import { ORDER_STATUS_BN, ORDER_STATUSES, PAYMENT_STATUS_BN } from "@/lib/order-status";
import type { Order, OrderStatus, PaginatedResponse } from "@/types";

interface DeliveryUser {
  id: number;
  name: string;
  phone: string | null;
}

function AdminOrdersContent() {
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [deliveryUsers, setDeliveryUsers] = useState<DeliveryUser[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState(
    searchParams.get("assignment_status") === "assigned_pending" ? "assigned_pending" : "",
  );
  const [riderFilter, setRiderFilter] = useState(searchParams.get("delivery_user_id") ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Collapsible items state
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Verify online payment dialog
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
      toast.error("অনুগ্রহ করে ট্রানজেকশন আইডি (Transaction ID) লিখুন");
      return;
    }
    setVerifying(true);
    try {
      await api.patch(`/admin/orders/${verifyingOrder.id}/verify-payment`, {
        transaction_id: txId,
      });
      toast.success("পেমেন্ট সফলভাবে ভেরিফাই ও পেইড মার্ক করা হয়েছে!");
      setVerifyingOrder(null);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "পেমেন্ট ভেরিফাই করা যায়নি");
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
    params.set("per_page", "50");
    if (statusFilter) params.set("order_status", statusFilter);
    if (assignmentFilter) params.set("assignment_status", assignmentFilter);
    if (riderFilter) params.set("delivery_user_id", riderFilter);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());

    api
      .get<PaginatedResponse<Order>>(`/admin/orders?${params.toString()}`)
      .then((r) => {
        setOrders(r.data.data);
        setTotalCount(r.data.total ?? r.data.data.length);
      })
      .catch(() => toast.error("অর্ডার তালিকা লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, [statusFilter, assignmentFilter, riderFilter, searchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (order: Order, next: OrderStatus) => {
    try {
      await api.patch(`/admin/orders/${order.id}`, { order_status: next });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, order_status: next } : o)));
      toast.success(`অর্ডারের স্ট্যাটাস "${ORDER_STATUS_BN[next]}" করা হয়েছে`);
    } catch {
      toast.error("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে");
    }
  };

  const assignDelivery = async (order: Order, deliveryUserId: string) => {
    const value = deliveryUserId ? Number(deliveryUserId) : null;
    try {
      await api.patch(`/admin/orders/${order.id}`, { delivery_user_id: value });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                delivery_user_id: value,
                deliveryUser: deliveryUsers.find((u) => u.id === value) as any,
              }
            : o,
        ),
      );
      toast.success(value ? "ডেলিভারি রাইডার নির্ধারিত হয়েছে" : "রাইডার অ্যাসাইনমেন্ট সরানো হয়েছে");
    } catch {
      toast.error("রাইডার অ্যাসাইন করা যায়নি");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Stat Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              অর্ডার ব্যবস্থাপনা (Order Management)
            </h1>
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
              মোট {totalCount}টি অর্ডার
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            কাস্টমার অর্ডার প্রসেসিং, রাইডার ডেলিভারি অ্যাসাইন ও পেমেন্ট হিসাব
          </p>
        </div>

        <Button
          nativeButton={false}
          render={<Link href="/admin/invoices" />}
          className="h-10 px-4 rounded-xl border border-gray-200 bg-white hover:bg-orange-50 text-gray-700 hover:text-[#f47920] text-xs font-bold shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Printer className="h-4 w-4" />
          <span>ইনভয়েস সেন্টার ↗</span>
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-3">
        
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              statusFilter === ""
                ? "bg-[#f47920] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            সকল অর্ডার
          </button>
          {ORDER_STATUSES.map((s) => {
            const isCurrent = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isCurrent
                    ? "bg-[#f47920] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {ORDER_STATUS_BN[s]}
              </button>
            );
          })}
        </div>

        {/* Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-gray-100">
          
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="অর্ডার নম্বর বা গ্রাহকের নাম দিয়ে খুঁজুন..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-xs outline-none focus:border-[#f47920] focus:bg-white focus:ring-2 focus:ring-[#f47920]/20 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setAssignmentFilter((prev) => (prev === "assigned_pending" ? "" : "assigned_pending"))}
            className={`h-10 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              assignmentFilter === "assigned_pending"
                ? "border-[#f47920] bg-orange-50 text-[#f47920]"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>রাইডার পেন্ডিং</span>
          </button>

          <select
            value={riderFilter}
            onChange={(e) => setRiderFilter(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-[#f47920]"
          >
            <option value="">সকল ডেলিভারি রাইডার</option>
            {deliveryUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.phone ? `(${u.phone})` : ""}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead className="font-bold text-xs min-w-[150px]">অর্ডার নম্বর ও তারিখ</TableHead>
                <TableHead className="font-bold text-xs min-w-[180px]">গ্রাহক ও ডেলিভারি ঠিকানা</TableHead>
                <TableHead className="font-bold text-xs">মোট মূল্য</TableHead>
                <TableHead className="font-bold text-xs text-center">পেমেন্ট স্ট্যাটাস</TableHead>
                <TableHead className="font-bold text-xs">অর্ডার স্ট্যাটাস</TableHead>
                <TableHead className="font-bold text-xs">ডেলিভারি রাইডার</TableHead>
                <TableHead className="text-right font-bold text-xs">ইনভয়েস</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                    কোনো অর্ডার খুঁজে পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const isDelivered = order.order_status === "delivered";
                  const isCancelled = order.order_status === "cancelled";

                  return (
                    <Fragment key={order.id}>
                      <TableRow className={`hover:bg-orange-50/20 transition-colors ${expandedId === order.id ? "bg-orange-50/10" : ""}`}>
                        
                        <TableCell className="text-center p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-gray-500 hover:bg-orange-100"
                            onClick={() => toggleExpand(order.id)}
                            title="পণ্যের তালিকা দেখুন"
                          >
                            {expandedId === order.id ? (
                              <ChevronDown className="h-4 w-4 text-[#f47920]" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-mono font-bold text-gray-900">#{order.order_number}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>{new Date(order.created_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900">{order.user?.name ?? order.shipping_name ?? "গেস্ট গ্রাহক"}</p>
                              {(order.shipping_phone || (order.user as any)?.phone) && (
                                <a
                                  href={`tel:${order.shipping_phone || (order.user as any)?.phone}`}
                                  className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded hover:bg-emerald-100"
                                >
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>{order.shipping_phone || (order.user as any)?.phone}</span>
                                </a>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-600 flex items-start gap-1 line-clamp-1 max-w-[220px]">
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                              <span>{order.shipping_address || "শেরপুর, বগুড়া"}</span>
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="font-bold text-gray-900 font-mono text-sm">
                          {formatTaka(Number(order.total))}
                        </TableCell>

                        <TableCell className="text-center">
                          {order.payment_status === "paid" ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                              ✓ পরিশোধিত (Paid)
                            </Badge>
                          ) : order.payment_method === "cod" ? (
                            <div className="inline-flex flex-col items-center gap-0.5">
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                                ক্যাশ অন ডেলিভারি
                              </Badge>
                              {order.payment_code && (
                                <span className="font-mono text-[10px] font-extrabold text-[#f47920]">
                                  OTP: {order.payment_code}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 rounded-lg border-orange-200 bg-orange-50 text-[#f47920] hover:bg-orange-100 text-[10px] font-bold"
                              onClick={() => openVerify(order)}
                            >
                              ভেরিফাই করুন
                            </Button>
                          )}
                        </TableCell>

                        <TableCell>
                          <select
                            value={order.order_status}
                            onChange={(e) => updateStatus(order, e.target.value as OrderStatus)}
                            className={`h-8 rounded-lg border px-2 text-xs font-bold outline-none transition-all ${
                              order.order_status === "delivered"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : order.order_status === "cancelled"
                                ? "border-red-200 bg-red-50 text-red-800"
                                : order.order_status === "shipped"
                                ? "border-blue-200 bg-blue-50 text-blue-800"
                                : "border-amber-200 bg-amber-50 text-amber-800"
                            }`}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {ORDER_STATUS_BN[s]}
                              </option>
                            ))}
                          </select>
                        </TableCell>

                        <TableCell>
                          {isDelivered || isCancelled ? (
                            <span className="text-xs text-muted-foreground font-semibold">
                              {order.deliveryUser?.name ?? "—"}
                            </span>
                          ) : (
                            <select
                              value={order.delivery_user_id ?? ""}
                              onChange={(e) => assignDelivery(order, e.target.value)}
                              className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#f47920]"
                            >
                              <option value="">রাইডার নির্বাচন...</option>
                              {deliveryUsers.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name} {u.phone ? `(${u.phone})` : ""}
                                </option>
                              ))}
                            </select>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 rounded-lg text-gray-600 hover:text-[#f47920] hover:bg-orange-50 text-xs font-bold"
                            nativeButton={false}
                            render={<Link href={`/admin/invoices/${order.id}`} />}
                            title="ইনভয়েস প্রিন্ট"
                          >
                            <Printer className="h-3.5 w-3.5 mr-1" />
                            <span>মেমো</span>
                          </Button>
                        </TableCell>

                      </TableRow>

                      {/* Expanded Order Items Preview */}
                      {expandedId === order.id && (
                        <TableRow className="bg-orange-50/15">
                          <TableCell colSpan={8} className="p-4 sm:p-5">
                            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-xs space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5" lang="bn">
                                  <Package className="w-3.5 h-3.5 text-[#f47920]" />
                                  <span>অর্ডারকৃত পণ্যসমূহ:</span>
                                </h4>
                                <span className="text-[11px] text-muted-foreground font-semibold">
                                  মোট আইটেম: {order.items?.length ?? 0}টি
                                </span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-gray-50 border-y border-gray-100">
                                    <tr>
                                      <th className="py-2 px-3 font-bold text-gray-700" lang="bn">পণ্যের নাম</th>
                                      <th className="py-2 px-3 text-center font-bold text-gray-700" lang="bn">পরিমাণ</th>
                                      <th className="py-2 px-3 text-right font-bold text-gray-700" lang="bn">একক মূল্য</th>
                                      <th className="py-2 px-3 text-right font-bold text-gray-700" lang="bn">উপমোট</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {order.items?.map((item) => (
                                      <tr key={item.id}>
                                        <td className="py-2 px-3 font-semibold text-gray-900">{item.product_name}</td>
                                        <td className="py-2 px-3 text-center font-mono font-bold text-gray-700">{item.quantity}টি</td>
                                        <td className="py-2 px-3 text-right font-mono text-gray-600">{formatTaka(Number(item.price))}</td>
                                        <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">{formatTaka(Number(item.subtotal))}</td>
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Verify Online Payment Dialog */}
      <Dialog open={!!verifyingOrder} onOpenChange={(o) => !o && setVerifyingOrder(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">পেমেন্ট ভেরিফাই ও কনফার্মেশন</DialogTitle>
          </DialogHeader>

          {verifyingOrder && (
            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-muted-foreground block text-[11px]">অর্ডার নম্বর:</span>
                  <span className="font-mono font-bold text-gray-900">#{verifyingOrder.order_number}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[11px]">মোট প্রদেয়:</span>
                  <span className="font-bold text-gray-900 font-mono text-sm">{formatTaka(Number(verifyingOrder.total))}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="font-bold text-gray-700" lang="bn">
                  অনলাইন ট্রানজেকশন আইডি (bKash / Nagad / Bank Trx ID) <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="h-10 rounded-xl font-mono text-xs"
                  value={txInput}
                  onChange={(e) => setTxInput(e.target.value)}
                  placeholder="যেমন: TRXB9823412"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setVerifyingOrder(null)}
              variant="ghost"
              className="h-10 rounded-xl text-xs"
              disabled={verifying}
            >
              বাতিল
            </Button>
            <Button
              onClick={submitVerify}
              className="h-10 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs"
              disabled={verifying}
            >
              {verifying ? "যাচাই হচ্ছে..." : "পেমেন্ট পেইড মার্ক করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullHeight />}>
      <AdminOrdersContent />
    </Suspense>
  );
}
