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
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  PhoneCall,
  MessageCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import api from "@/lib/api";
import { formatTaka } from "@/lib/utils";
import {
  ORDER_STATUS_BN,
  ORDER_STATUS_CLASS,
} from "@/lib/order-status";
import type { CustomerDashboardSummary, Order, PaginatedResponse } from "@/types";

const QUICK_LINKS = [
  { href: "/products", label: "কেনাকাটা করুন", desc: "নতুন পণ্য ব্রাউজ করুন", icon: ShoppingBag, color: "text-[#f47920]", bg: "bg-orange-50" },
  { href: "/dashboard/orders", label: "আমার অর্ডারসমূহ", desc: "লাইভ স্ট্যাটাস দেখুন", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
  { href: "/dashboard/wishlist", label: "পছন্দের তালিকা", desc: "সেভ করা পণ্যসমূহ", icon: Heart, color: "text-red-500", bg: "bg-red-50" },
  { href: "/dashboard/address-book", label: "ডেলিভারি ঠিকানা", desc: "ঠিকানা যোগ/বদলান", icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
];

export default function DashboardSummaryPage() {
  const { hydrated, user, isAuthenticated } = useDashboardAuth();
  const [data, setData] = useState<CustomerDashboardSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;

    Promise.all([
      api.get<CustomerDashboardSummary>("/account/dashboard"),
      api.get<PaginatedResponse<Order>>("/orders?per_page=3"),
    ])
      .then(([dashRes, ordersRes]) => {
        setData(dashRes.data);
        setRecentOrders(ordersRes.data.data ?? []);
      })
      .catch((err) => {
        console.error("Failed to load dashboard overview:", err);
      })
      .finally(() => setLoading(false));
  }, [hydrated, isAuthenticated]);

  if (!hydrated) return null;

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-[#f47920] to-amber-500 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Future Shop কাস্টমার ড্যাশবোর্ড</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" lang="bn">
            স্বাগতম{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed" lang="bn">
            আপনার অ্যাকাউন্টের সার্বিক অবস্থা, রানিং অর্ডারের লাইভ ট্র্যাকিং ও কেনাকাটার হিসাব এখান থেকেই নিয়ন্ত্রণ করুন।
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200/60" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="মোট অর্ডার"
            value={String(data?.orders_count ?? 0)}
            icon={Package}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            subtext="সর্বমোট সম্পন্ন অর্ডার"
          />
          <StatCard
            title="চলমান অর্ডার"
            value={String(data?.active_orders_count ?? 0)}
            icon={Clock}
            iconBg="bg-orange-50"
            iconColor="text-[#f47920]"
            subtext="প্রক্রিয়াধীন রয়েছে"
          />
          <StatCard
            title="মোট কেনাকাটা"
            value={formatTaka(data?.total_spent ?? "0")}
            icon={Wallet}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            subtext="মোট খরচ"
          />
          <StatCard
            title="ওয়ালেট ব্যালেন্স"
            value={formatTaka(data?.wallet_balance ?? "0")}
            icon={Tag}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            subtext="পরবর্তী কেনাকাটায় প্রযোজ্য"
          />
        </div>
      )}

      {/* Section: Recent Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
            <Package className="w-5 h-5 text-[#f47920]" />
            <span>সাম্প্রতিক অর্ডারসমূহ (Recent Orders)</span>
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-xs font-bold text-[#f47920] hover:text-[#d46212] flex items-center gap-1"
          >
            <span>সব অর্ডার দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs text-center space-y-3">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-700" lang="bn">
              আপনার কোনো সাম্প্রতিক অর্ডার নেই
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/products" />}
              className="h-10 px-6 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold"
            >
              কেনাকাটা শুরু করুন
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#f47920]/40 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-[#f47920] bg-orange-50 px-2 py-0.5 rounded-md">
                      {order.order_number}
                    </span>
                    <Badge variant="outline" className={`text-[11px] font-semibold ${ORDER_STATUS_CLASS[order.order_status] ?? ""}`} lang="bn">
                      {ORDER_STATUS_BN[order.order_status] ?? order.order_status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("bn-BD")}
                  </p>
                  <p className="text-sm font-extrabold text-gray-900">
                    {formatTaka(Number(order.total))}
                  </p>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:bg-[#f47920] hover:text-white hover:border-[#f47920] transition-colors"
                >
                  <span>অর্ডার বিস্তারিত</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section: Quick Shortcuts Grid */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-extrabold text-gray-900" lang="bn">
          কুইক লিঙ্ক ও শর্টকাট
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center text-center p-5 rounded-2xl border border-gray-100 bg-white shadow-xs transition-all hover:border-[#f47920] hover:shadow-md hover:bg-orange-50/20 group"
              >
                <div className={`w-12 h-12 rounded-2xl ${link.bg} ${link.color} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#f47920] transition-colors">
                  {link.label}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {link.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Help & Support Widget */}
      <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#f47920] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900" lang="bn">
              যেকোনো সহায়তা বা অর্ডারের তথ্যে আমরা প্রস্তুত
            </h3>
            <p className="text-xs text-muted-foreground" lang="bn">
              শেরপুর, বগুড়া গ্রাহক সেবা কেন্দ্র • সকাল ৯টা থেকে রাত ১০টা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="tel:01813354648"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-800 hover:border-[#f47920] hover:text-[#f47920] transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#f47920]" />
            <span>01813354648</span>
          </a>
          <a
            href="https://wa.me/8801813354648"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
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
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{title}</span>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </span>
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
        {subtext && <p className="mt-1 text-[11px] text-gray-500 font-medium">{subtext}</p>}
      </div>
    </div>
  );
}
