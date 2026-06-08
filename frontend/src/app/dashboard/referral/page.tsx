"use client";

import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";

export default function ReferralPage() {
  const { hydrated } = useDashboardAuth();
  if (!hydrated) return null;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold md:text-2xl">Referral</h1>
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
            <Users className="h-8 w-8 text-[#f47920]" />
          </div>
          <h2 className="text-lg font-semibold">Referral Program</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Refer friends and earn 10% discount on both sides. This feature is
            launching soon!
          </p>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-[#f47920]">
            Coming Soon
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
