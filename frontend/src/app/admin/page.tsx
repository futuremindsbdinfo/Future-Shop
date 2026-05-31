"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, ShoppingBag, Store, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ORDER_STATUS_BN, ORDER_STATUS_CLASS } from "@/lib/order-status";
import type { DashboardStats } from "@/types";

const TK = "৳";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: DashboardStats }>("/admin/dashboard")
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullHeight />;
  if (!stats) return <p className="text-muted-foreground">Could not load dashboard.</p>;

  const cards = [
    { label: "Total Orders", value: stats.total_orders.toLocaleString("en-US"), icon: ShoppingBag },
    { label: "Total Revenue", value: `${TK}${stats.total_revenue.toLocaleString("en-US")}`, icon: Wallet },
    { label: "Active Vendors", value: stats.active_vendors.toLocaleString("en-US"), icon: Store },
    { label: "Pending Orders", value: stats.pending_orders.toLocaleString("en-US"), icon: Package },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a6bdf]/10 text-[#1a6bdf]">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button nativeButton={false} render={<Link href="/admin/products/new" />} className="bg-[#1a6bdf] hover:bg-[#1559bd]">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/orders" />}>View Orders</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/vendors" />}>Manage Vendors</Button>
      </div>

      {/* Recent orders */}
      <Card>
        <CardContent className="p-4">
          <h2 className="mb-3 font-semibold">Recent Orders</h2>
          {stats.recent_orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent_orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.order_number}</TableCell>
                    <TableCell>{order.user?.name ?? "—"}</TableCell>
                    <TableCell>{TK}{Number(order.total).toLocaleString("en-US")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ORDER_STATUS_CLASS[order.order_status] ?? ""} lang="bn">
                        {ORDER_STATUS_BN[order.order_status] ?? order.order_status}
                      </Badge>
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
