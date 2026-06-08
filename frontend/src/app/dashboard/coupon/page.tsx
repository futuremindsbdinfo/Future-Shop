"use client";

import { Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";

export default function CouponPage() {
  const { hydrated } = useDashboardAuth();
  if (!hydrated) return null;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold md:text-2xl">My Coupon Code</h1>
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
            <Tag className="h-8 w-8 text-[#f47920]" />
          </div>
          <h2 className="text-lg font-semibold">Coupons & Discounts</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Get 10% off on your first purchase, credited to your wallet for the
            next order.
          </p>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-[#f47920]">
            Coming Soon
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
