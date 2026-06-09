"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { PaginatedResponse, WalletTransaction } from "@/types";

interface WalletData {
  balance: string;
  transactions: PaginatedResponse<WalletTransaction>;
}

export default function RewardPage() {
  const { hydrated, isAuthenticated } = useDashboardAuth();

  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<WalletData>(`/account/wallet?page=${page}`)
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load wallet"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    load();
  }, [hydrated, isAuthenticated, load]);

  if (!hydrated) return null;

  const balance = Number(data?.balance ?? 0);
  const txs = data?.transactions.data ?? [];
  const lastPage = data?.transactions.last_page ?? 1;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold md:text-2xl">Rewards &amp; Wallet</h1>

      {/* Balance card */}
      <Card className="rounded-xl border-[#f47920]/30 bg-gradient-to-br from-[#f47920] to-[#fb923c] text-white shadow-sm">
        <CardContent className="space-y-1 p-6 text-center">
          <Wallet className="mx-auto h-7 w-7 text-white/90" />
          <p className="text-sm font-medium text-white/85">
            Available wallet balance
          </p>
          <p className="text-4xl font-bold">{formatTaka(balance)}</p>
        </CardContent>
      </Card>

      {/* Transactions */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Transaction History</h2>

        {!loading && txs.length === 0 ? (
          <EmptyState
            icon={<Wallet className="h-7 w-7" />}
            title="No transactions yet"
            description="Earn rewards by referring friends and using coupons!"
          />
        ) : (
          <>
            <div className="space-y-2">
              {txs.map((tx) => {
                const isCredit = tx.type === "credit";
                return (
                  <Card
                    key={tx.id}
                    className="rounded-xl border border-[#f1f5f9] shadow-sm"
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      {isCredit ? (
                        <ArrowDownCircle className="h-6 w-6 shrink-0 text-green-600" />
                      ) : (
                        <ArrowUpCircle className="h-6 w-6 shrink-0 text-red-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {tx.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString("en-GB")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-semibold ${
                            isCredit ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatTaka(tx.amount)}
                        </p>
                        <Badge
                          className={
                            isCredit
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                        >
                          {tx.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {lastPage > 1 && (
              <div className="flex justify-center gap-2 pt-2">
                <Button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  variant="outline"
                  className="h-10 px-4"
                >
                  Previous
                </Button>
                <span className="flex items-center px-2 text-sm text-muted-foreground">
                  {page} / {lastPage}
                </span>
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === lastPage}
                  variant="outline"
                  className="h-10 px-4"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
