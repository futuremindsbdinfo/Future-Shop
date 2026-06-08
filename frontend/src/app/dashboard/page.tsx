"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Heart,
  MapPin,
  Package,
  Tag,
  User as UserIcon,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import type { CustomerDashboardSummary } from "@/types";

const QUICK_LINKS = [
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/address-book", label: "Address Book", icon: MapPin },
  { href: "/dashboard/personal-info", label: "Personal Info", icon: UserIcon },
];

export default function DashboardSummaryPage() {
  const { hydrated, user, isAuthenticated } = useDashboardAuth();
  const [data, setData] = useState<CustomerDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    api
      .get<CustomerDashboardSummary>("/account/dashboard")
      .then((res) => setData(res.data))
      .catch(() => {
        /* 401 handled by axios interceptor */
      })
      .finally(() => setLoading(false));
  }, [hydrated, isAuthenticated]);

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s an overview of your account.
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Total Orders"
            value={String(data?.orders_count ?? 0)}
            icon={Package}
            iconBg="bg-blue-50"
            iconColor="text-blue-700"
          />
          <StatCard
            title="Active Orders"
            value={String(data?.active_orders_count ?? 0)}
            icon={Clock}
            iconBg="bg-orange-50"
            iconColor="text-[#f47920]"
          />
          <StatCard
            title="Total Spent"
            value={formatTaka(data?.total_spent ?? "0")}
            icon={Wallet}
            iconBg="bg-green-50"
            iconColor="text-green-700"
          />
          <StatCard
            title="Wallet Balance"
            value={formatTaka(data?.wallet_balance ?? "0")}
            icon={Tag}
            iconBg="bg-purple-50"
            iconColor="text-purple-700"
            subtext="Available for next purchase"
          />
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick Links
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-[#f1f5f9] bg-card p-3 text-center shadow-sm transition-colors hover:border-[#f47920]/40 hover:bg-orange-50/40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-[#f47920]">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  subtext,
}: {
  title: string;
  value: string;
  icon: typeof Package;
  iconBg: string;
  iconColor: string;
  subtext?: string;
}) {
  return (
    <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
      <CardContent className="flex items-start gap-3 p-4">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{title}</p>
          <p className="mt-0.5 text-lg font-bold leading-tight">{value}</p>
          {subtext && (
            <p className="mt-1 text-[10px] text-muted-foreground">{subtext}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
