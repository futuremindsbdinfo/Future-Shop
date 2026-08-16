"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Menu, Package, QrCode, FileText, Truck, PhoneCall, CheckCircle2 } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      
      {/* Top Mobile-First Rider Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -ml-1 text-gray-700 hover:bg-orange-50 hover:text-[#f47920] rounded-xl"
            onClick={() => setMobileOpen(true)}
            aria-label="Open delivery menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/delivery" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f47920] text-white shadow-2xs">
              <Truck className="h-4 w-4" />
            </span>
            <div>
              <span className="font-extrabold text-gray-900 text-sm tracking-tight" lang="bn">
                Future Shop <span className="text-[#f47920]">রাইডার</span>
              </span>
              <p className="text-[10px] text-muted-foreground font-medium">শেরপুর, বগুড়া</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
            {user?.name ?? "রাইডার"}
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
      </header>

      {/* Navigation Sheet Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white">
          <SheetHeader className="border-b border-gray-100 p-5 bg-gradient-to-br from-orange-50 to-white text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f47920] text-base font-bold text-white shadow-sm">
                {user?.name?.charAt(0).toUpperCase() ?? "R"}
              </span>
              <div className="min-w-0">
                <SheetTitle className="text-sm font-bold text-gray-900 leading-snug">
                  {user?.name ?? "ডেলিভারি রাইডার"}
                </SheetTitle>
                <p className="text-xs text-muted-foreground font-mono">
                  {user?.phone ?? "ডেলিভারি প্যানেল"}
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all",
                      isActive
                        ? "bg-[#f47920] text-white shadow-xs"
                        : "text-gray-700 hover:bg-orange-50/60 hover:text-[#f47920]"
                    )}
                    lang="bn"
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-gray-400")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-gray-100 p-4 space-y-2 bg-gray-50/50">
            <Button
              variant="outline"
              className="w-full justify-center gap-2 rounded-xl text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold h-10"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
            >
              <LogOut className="h-4 w-4" />
              <span lang="bn">লগআউট করুন</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <main className="mx-auto max-w-2xl px-4 py-5">{children}</main>
    </div>
  );
}
