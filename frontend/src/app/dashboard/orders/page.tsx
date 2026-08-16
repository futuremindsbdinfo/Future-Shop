"use client";

import { OrdersView } from "@/components/dashboard/OrdersView";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";

export default function DashboardOrdersPage() {
  const { hydrated } = useDashboardAuth();
  if (!hydrated) return null;
  return <OrdersView heading="আমার সকল অর্ডার" defaultStatus="all" />;
}
