"use client";

import { useEffect, useState } from "react";
import { Copy, Tag } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { Coupon, CouponUsage } from "@/types";

interface CouponData {
  available: Coupon[];
  used: CouponUsage[];
}

export default function CouponPage() {
  const { hydrated, isAuthenticated } = useDashboardAuth();

  const [data, setData] = useState<CouponData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    api
      .get<CouponData>("/account/coupons")
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load coupons"))
      .finally(() => setLoading(false));
  }, [hydrated, isAuthenticated]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`${code} copied!`);
    } catch {
      toast.error("Could not copy");
    }
  };

  if (!hydrated) return null;

  const available = data?.available ?? [];
  const used = data?.used ?? [];

  if (!loading && available.length === 0 && used.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold md:text-2xl">My Coupon Codes</h1>
        <EmptyState
          icon={<Tag className="h-7 w-7" />}
          title="No coupons yet"
          description="When you become eligible for coupons or use one, it will show up here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold md:text-2xl">My Coupon Codes</h1>

      {available.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Available for You</h2>
          <div className="space-y-3">
            {available.map((coupon) => (
              <Card
                key={coupon.id}
                className="rounded-xl border-[#f47920]/30 bg-orange-50/40 shadow-sm"
              >
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-mono text-xl font-bold text-[#f47920]">
                      {coupon.code}
                    </p>
                    <p className="text-sm font-medium">
                      {coupon.discount_percentage}% off
                    </p>
                    {coupon.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {coupon.description}
                      </p>
                    )}
                    {coupon.expires_at && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Expires{" "}
                        {new Date(coupon.expires_at).toLocaleDateString("en-GB")}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => copyCode(coupon.code)}
                    variant="outline"
                    className="h-11 border-[#f47920] text-[#f47920] hover:bg-[#fff7ed]"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {used.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">My Used Coupons</h2>
          <div className="space-y-2">
            {used.map((usage) => (
              <Card
                key={usage.id}
                className="rounded-xl border border-[#f1f5f9] shadow-sm"
              >
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold">
                      {usage.coupon?.code ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saved {formatTaka(usage.discount_amount)} ·{" "}
                      {new Date(usage.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  {usage.wallet_credited ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Cashback credited
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      Pending delivery
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
