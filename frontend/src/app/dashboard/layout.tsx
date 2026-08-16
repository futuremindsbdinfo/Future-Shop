"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Tag,
  Trophy,
  User as UserIcon,
  Users,
  MapPin,
  Store,
  PhoneCall,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "ড্যাশবোর্ড ওভারভিউ", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "আমার অর্ডারসমূহ", icon: Package },
  { href: "/dashboard/order-history", label: "অর্ডার হিস্টোরি", icon: History },
  { href: "/dashboard/wishlist", label: "পছন্দের তালিকা (Wishlist)", icon: Heart },
  { href: "/dashboard/address-book", label: "ডেলিভারি ঠিকানা", icon: MapPin },
  { href: "/dashboard/coupon", label: "আমার কুপনসমূহ", icon: Tag },
  { href: "/dashboard/referral", label: "রেফারেল ও আয়", icon: Users },
  { href: "/dashboard/reward", label: "রিওয়ার্ড পয়েন্ট", icon: Trophy },
  { href: "/dashboard/personal-info", label: "প্রোফাইল সেটিংস", icon: UserIcon },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname.startsWith(item.href);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore network errors on logout */
    }
    logout();
    router.replace("/");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white">
      {/* User Header Profile Card */}
      <div className="border-b border-gray-100 p-5 bg-gradient-to-br from-orange-50/60 to-white">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f47920] to-[#d46212] text-lg font-bold text-white shadow-sm">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-900 leading-snug">
              {user?.name ?? "সম্মানিত গ্রাহক"}
            </p>
            <p className="truncate text-xs text-muted-foreground font-mono">
              {user?.phone || user?.email || "—"}
            </p>
          </div>
        </div>

        {/* Back to Shop Button */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="mt-3.5 flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 py-2 px-3 text-xs font-bold text-gray-700 hover:border-[#f47920] hover:text-[#f47920] hover:bg-orange-50/50 shadow-2xs transition-all"
        >
          <Store className="w-3.5 h-3.5 text-[#f47920]" />
          <span>শপিংয়ে ফিরে যান (Back to Shop)</span>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all",
                    active
                      ? "bg-[#f47920] text-white shadow-xs"
                      : "text-gray-700 hover:bg-orange-50/60 hover:text-[#f47920]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-gray-400")} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Helpline & Logout */}
      <div className="border-t border-gray-100 p-4 space-y-2 bg-gray-50/50">
        <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
          <span>হেল্পলাইন:</span>
          <a href="tel:01813354648" className="font-bold text-[#f47920] hover:underline">
            01813354648
          </a>
        </div>
        <Button
          variant="outline"
          className="h-10 w-full justify-center gap-2 rounded-xl text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs font-bold"
          onClick={() => {
            setMobileOpen(false);
            handleLogout();
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>লগআউট করুন</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Mobile Navigation Header Bar */}
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-white p-3.5 border border-gray-200 shadow-2xs md:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-xs font-bold text-[#f47920]">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{user?.name ?? "সম্মানিত গ্রাহক"}</p>
              <p className="text-[10px] text-muted-foreground">কাস্টমার ড্যাশবোর্ড</p>
            </div>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl border-[#f47920] text-[#f47920] hover:bg-orange-50 font-bold text-xs shrink-0"
                >
                  <Menu className="h-4 w-4" />
                  <span>মেনু তালিকা</span>
                </Button>
              }
            />
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>ড্যাশবোর্ড মেনু</SheetTitle>
              </SheetHeader>
              {sidebarContent}
            </SheetContent>
          </Sheet>
        </div>

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
          {/* Desktop Sticky Sidebar Card */}
          <aside className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-24 rounded-3xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            {sidebarContent}
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="flex-1 w-full min-w-0">{children}</main>
        </div>

      </div>
    </div>
  );
}
