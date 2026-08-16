"use client";

import { OrdersView } from "@/components/dashboard/OrdersView";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";

export default function DashboardOrderHistoryPage() {
  const { hydrated } = useDashboardAuth();
  if (!hydrated) return null;
  return <OrdersView heading="অর্ডার হিস্টোরি (সম্পন্ন অর্ডারসমূহ)" defaultStatus="delivered" />;
}
