"use client";

import { useEffect, useState } from "react";
import { Copy, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";

interface ReferralSummary {
  referral_code: string | null;
  referral_count: number;
  referral_earned: string | number;
}

export default function ReferralPage() {
  const { hydrated, isAuthenticated } = useDashboardAuth();

  const [data, setData] = useState<ReferralSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    api
      .get<ReferralSummary>("/account/referral")
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load referral data"))
      .finally(() => setLoading(false));
  }, [hydrated, isAuthenticated]);

  const copyCode = async () => {
    if (!data?.referral_code) return;
    try {
      await navigator.clipboard.writeText(data.referral_code);
      toast.success("Referral code copied!");
    } catch {
      toast.error("Could not copy — please copy manually");
    }
  };

  if (!hydrated) return null;

  const code = data?.referral_code ?? "—";
  const count = data?.referral_count ?? 0;
  const earned = Number(data?.referral_earned ?? 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold md:text-2xl">Referral Program</h1>

      {/* Code card */}
      <Card className="rounded-xl border-[#f47920]/30 bg-gradient-to-br from-orange-50 to-white shadow-sm">
        <CardContent className="space-y-4 p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Your referral code
          </p>
          <p className="font-mono text-3xl font-bold tracking-wider text-[#f47920]">
            {loading ? "…" : code}
          </p>
          <Button
            onClick={copyCode}
            disabled={!data?.referral_code}
            className="h-11 bg-[#f47920] hover:bg-[#e56910]"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </Button>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            Share your code and both you and your friend get{" "}
            <strong>10% wallet credit</strong> when their first order is
            delivered.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
          <CardContent className="space-y-2 p-4 text-center">
            <Users className="mx-auto h-6 w-6 text-[#f47920]" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Friends Referred
            </p>
            <p className="text-2xl font-bold">{count}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
          <CardContent className="space-y-2 p-4 text-center">
            <Trophy className="mx-auto h-6 w-6 text-[#f47920]" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total Earned
            </p>
            <p className="text-2xl font-bold">{formatTaka(earned)}</p>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="space-y-3 p-4">
          <h2 className="text-lg font-semibold">How it works</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-[#f47920]">1.</span> Share your
              referral code with a friend.
            </li>
            <li>
              <span className="font-medium text-[#f47920]">2.</span> They enter
              your code when registering an account.
            </li>
            <li>
              <span className="font-medium text-[#f47920]">3.</span> When their
              first order is delivered, both of you receive 10% of that
              order&apos;s total credited to your wallet.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
