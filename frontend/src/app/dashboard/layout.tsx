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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/order-history", label: "Order History", icon: History },
  { href: "/dashboard/referral", label: "Referral", icon: Users },
  { href: "/dashboard/personal-info", label: "Personal Info", icon: UserIcon },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/coupon", label: "My Coupon Code", icon: Tag },
  { href: "/dashboard/reward", label: "Reward", icon: Trophy },
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

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* User header */}
      <div className="border-b px-4 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f47920] text-sm font-semibold text-white">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.name ?? "Customer"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? user?.phone ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
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
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#f47920] text-white"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t p-3">
        <Button
          variant="outline"
          className="h-11 w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => {
            setMobileOpen(false);
            handleLogout();
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile hamburger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button
              variant="default"
              size="icon"
              className="fixed left-3 top-3 z-40 h-11 w-11 bg-[#f47920] shadow-md hover:bg-[#e56910] md:hidden"
              aria-label="Open dashboard menu"
            />
          }
        >
          <Menu className="h-4 w-4 text-white" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Dashboard menu</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 flex-col border-r bg-card shadow-sm md:flex">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="min-w-0 p-4 pt-16 md:ml-64 md:p-6 md:pt-6">{children}</main>
    </div>
  );
}
