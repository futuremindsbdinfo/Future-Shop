"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  Menu,
  Package,
  QrCode,
  FileText,
  Truck,
  Store,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { href: "/delivery", label: "আজকের ডেলিভারি", icon: Package },
  { href: "/delivery/payment-confirm", label: "ওটিপি কোড কনফার্মেশন", icon: QrCode },
  { href: "/delivery/report", label: "ডেলিভারি রিপোর্ট", icon: FileText },
];

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Wait one tick for AuthHydrator to restore from sessionStorage.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== "delivery") {
      router.replace("/?auth=login&next=/delivery");
    }
  }, [hydrated, isAuthenticated, user, router]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    logout();
    router.push("/");
  };

  if (!hydrated) return <LoadingSpinner fullHeight />;
  if (!isAuthenticated || user?.role !== "delivery") {
    return <LoadingSpinner fullHeight />;
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white">
      {/* Rider Header Card */}
      <div className="border-b border-gray-100 p-5 bg-gradient-to-br from-orange-50/70 to-white">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f47920] to-[#d46212] text-lg font-bold text-white shadow-sm">
            {user?.name?.charAt(0).toUpperCase() ?? "R"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold text-gray-900 leading-snug">
                {user?.name ?? "ডেলিভারি রাইডার"}
              </p>
            </div>
            <p className="truncate text-xs text-muted-foreground font-mono">
              {user?.phone ?? "শেরপুর জোন"}
            </p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              অন-ডিউটি রাইডার
            </span>
          </div>
        </div>

        {/* Back to Shop link */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="mt-3.5 flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 py-2 px-3 text-xs font-bold text-gray-700 hover:border-[#f47920] hover:text-[#f47920] hover:bg-orange-50/50 shadow-2xs transition-all"
        >
          <Store className="w-3.5 h-3.5 text-[#f47920]" />
          <span>মূল শপে ফিরে যান (Back to Shop)</span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all",
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
      <div className="border-t border-gray-100 p-4 space-y-2.5 bg-gray-50/50">
        <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
          <span>রাইডার সাপোর্ট:</span>
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
    <div className="min-h-screen bg-[#f8fafc] pb-16 md:pb-8">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 -ml-2 text-gray-700 hover:bg-orange-50 hover:text-[#f47920] rounded-xl md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open delivery menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/delivery" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f47920] text-white shadow-xs">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <span className="font-extrabold text-gray-900 text-sm sm:text-base tracking-tight" lang="bn">
                  Future Shop <span className="text-[#f47920]">রাইডার পোর্টাল</span>
                </span>
                <p className="text-[10px] text-muted-foreground font-semibold">শেরপুর, বগুড়া</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl">
              👤 {user?.name ?? "রাইডার"}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline" lang="bn">লগআউট</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Sheet Drawer for Mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white">
          <SheetHeader className="sr-only">
            <SheetTitle>রাইডার মেনু</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main Container Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
          {/* Desktop Sticky Sidebar */}
          <aside className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-20 rounded-3xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            {sidebarContent}
          </aside>

          {/* Main Delivery Content */}
          <main className="flex-1 w-full min-w-0">{children}</main>
        </div>
      </div>

      {/* Rider Mobile Bottom Quick Action Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-center justify-around py-2 px-3 shadow-lg md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition-colors",
                active ? "text-[#f47920]" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-[#f47920]" : "text-gray-400")} />
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
