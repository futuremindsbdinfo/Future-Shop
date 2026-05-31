"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/zones", label: "Delivery Zones", icon: MapPin },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-1 p-2">
      {NAV.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
              active ? "bg-[#1a6bdf] text-white" : "hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/?auth=login&next=/admin");
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    logout();
    router.push("/");
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return <LoadingSpinner fullHeight />;
  }

  return (
    <div className="flex min-h-[80vh]">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-card md:block">
        <div className="p-4 text-lg font-bold text-[#1a6bdf]">Future Shop Admin</div>
        <NavLinks pathname={pathname} />
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="h-11 w-11 md:hidden" aria-label="Menu" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader>
                  <SheetTitle className="px-4 text-left text-[#1a6bdf]">Future Shop Admin</SheetTitle>
                </SheetHeader>
                <NavLinks pathname={pathname} />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-medium text-muted-foreground">Admin Panel</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{user.name}</span>
            <Button variant="outline" className="h-11" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
