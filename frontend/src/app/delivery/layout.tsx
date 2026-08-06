"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Menu, Package, QrCode, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { href: "/delivery", label: "আজকের অর্ডার", icon: Package },
  { href: "/delivery/payment-confirm", label: "কোড কনফার্মেশন", icon: QrCode },
  { href: "/delivery/report", label: "রিপোর্ট", icon: FileText },
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
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0 -ml-2" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5 text-slate-700" />
          </Button>
          <Link href="/delivery" className="flex items-center gap-2">
            <img src="/logo.png" alt="Future Shop" className="h-8 w-auto object-contain" />
            <span className="font-bold text-[#f47920] text-lg tracking-tight" lang="bn">ডেলিভারি</span>
          </Link>
        </div>
        <Button variant="outline" className="h-10 px-3 md:px-4" onClick={handleLogout}>
          <LogOut className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline" lang="bn">লগআউট</span>
        </Button>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0 flex flex-col">
          <SheetHeader className="border-b p-4 text-left">
            <SheetTitle className="text-[#f47920]" lang="bn">ডেলিভারি প্যানেল</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-medium transition-colors",
                      isActive
                        ? "bg-[#f47920] text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                    lang="bn"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span lang="bn" className="text-[15px]">লগআউট</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <main className="mx-auto max-w-xl px-4 py-4">{children}</main>
    </div>
  );
}
