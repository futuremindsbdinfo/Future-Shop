"use client";

import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";

export default function RewardPage() {
  const { hydrated } = useDashboardAuth();
  if (!hydrated) return null;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold md:text-2xl">Rewards</h1>
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
            <Trophy className="h-8 w-8 text-[#f47920]" />
          </div>
          <h2 className="text-lg font-semibold">Rewards Program</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Earn reward points on every purchase and redeem them for discounts.
          </p>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-[#f47920]">
            Coming Soon
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
