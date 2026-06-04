"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBagShopping,
  faBars,
  faBell,
  faCircleQuestion,
  faClipboardList,
  faGear,
  faLocationDot,
  faRightFromBracket,
  faStore,
  faTableCells,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import type { DashboardStats, Order } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: IconDefinition;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: faTableCells },
  { href: "/admin/products", label: "Products", icon: faBagShopping },
  { href: "/admin/orders", label: "Orders", icon: faClipboardList },
  { href: "/admin/vendors", label: "Vendors", icon: faStore },
  { href: "/admin/zones", label: "Delivery Zones", icon: faLocationDot },
  { href: "/admin/settings", label: "Settings", icon: faGear },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}

/* ----------------------- LEFT ICON RAIL (64px) ----------------------- */
function LeftRail({ pathname }: { pathname: string }) {
  return (
    <aside
      className="hidden h-screen w-16 shrink-0 flex-col items-center bg-[#1a6bdf] py-4 md:sticky md:top-0 md:flex"
      aria-label="Primary navigation rail"
    >
      {/* Brand mark */}
      <Link href="/admin" className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg text-base font-bold tracking-tight text-white">
        FS
      </Link>

      {/* Icons */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                active
                  ? "bg-white text-[#1a6bdf]"
                  : "text-white/85 hover:bg-white/15 hover:text-white",
              )}
            >
              <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
            </Link>
          );
        })}
      </nav>

      {/* Bottom: settings + logout shortcuts */}
      <div className="mt-2 flex flex-col items-center gap-2">
        <Link
          href="/admin/settings"
          title="Settings"
          aria-label="Settings"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isActive(pathname, "/admin/settings")
              ? "bg-white text-[#1a6bdf]"
              : "text-white/85 hover:bg-white/15 hover:text-white",
          )}
        >
          <FontAwesomeIcon icon={faGear} className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}

/* ------------------------ RIGHT PANEL (220px) ------------------------ */
function RightPanel({
  pathname,
  user,
  onLogout,
  notifications,
  onItemClick,
}: {
  pathname: string;
  user: { name: string; email: string | null } | null;
  onLogout: () => void;
  notifications: Order[];
  onItemClick?: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col border-r border-[#e5e7eb] bg-white">
      {/* User */}
      <div className="border-b border-[#e5e7eb] px-4 pb-4 pt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a6bdf] text-sm font-semibold text-white">
            {user?.name?.charAt(0).toUpperCase() ?? "A"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold leading-tight text-[#111827]">
              {user?.name ?? "Admin"}
            </p>
            <p className="truncate text-[11px] text-[#9ca3af]">{user?.email ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2 pt-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af]">
          Menu
        </p>
        <ul className="space-y-1">
          {NAV.slice(0, 5).map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-[#1a6bdf] text-white"
                      : "text-[#374151] hover:bg-[#eff6ff]",
                  )}
                >
                  <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af]">
          Settings
        </p>
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin/settings"
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                isActive(pathname, "/admin/settings")
                  ? "bg-[#1a6bdf] text-white"
                  : "text-[#374151] hover:bg-[#eff6ff]",
              )}
            >
              <FontAwesomeIcon icon={faGear} className="h-4 w-4" />
              Settings
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/ashrafulalamashik/localbazaar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-[#374151] transition-colors hover:bg-[#eff6ff]"
            >
              <FontAwesomeIcon icon={faCircleQuestion} className="h-4 w-4" />
              Help
            </a>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onItemClick?.();
                onLogout();
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
              Logout
            </button>
          </li>
        </ul>

        {/* Notifications — last 2 orders */}
        <p className="mt-6 flex items-center gap-2 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af]">
          <FontAwesomeIcon icon={faBell} className="h-3 w-3" />
          Notifications
        </p>
        {notifications.length === 0 ? (
          <p className="px-3 pb-4 text-[11px] text-[#9ca3af]">No recent orders</p>
        ) : (
          <ul className="space-y-1 pb-4">
            {notifications.slice(0, 2).map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders`}
                  onClick={onItemClick}
                  className="block rounded-md px-3 py-2 transition-colors hover:bg-[#eff6ff]"
                >
                  <p className="truncate font-mono text-[11px] font-semibold text-[#111827]">
                    {order.order_number}
                  </p>
                  <p className="truncate text-[11px] text-[#9ca3af]">
                    ৳{Number(order.total).toLocaleString("en-US")} · {order.order_status}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </div>
  );
}

/* ----------------------------- LAYOUT ----------------------------- */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const [notifications, setNotifications] = useState<Order[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Give AuthHydrator one tick to restore from sessionStorage before deciding
  // the user is logged out (avoids a redirect race on hard refresh).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/?auth=login&next=/admin");
    }
  }, [hydrated, isAuthenticated, user, router]);

  // Fetch last few orders for the notifications panel.
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") return;
    api
      .get<{ data: DashboardStats }>("/admin/dashboard")
      .then((r) => setNotifications(r.data.data.recent_orders ?? []))
      .catch(() => {
        /* non-fatal */
      });
  }, [isAuthenticated, user]);

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

  const userInfo = { name: user.name, email: user.email };

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      {/* Desktop: icon rail + expanded panel */}
      <LeftRail pathname={pathname} />

      <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 md:block">
        <RightPanel
          pathname={pathname}
          user={userInfo}
          onLogout={handleLogout}
          notifications={notifications}
        />
      </aside>

      {/* Mobile: floating hamburger + sheet drawer (expanded panel only) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button
              variant="default"
              size="icon"
              className="fixed left-3 top-3 z-40 h-11 w-11 bg-[#1a6bdf] shadow-md hover:bg-[#1559bd] md:hidden"
              aria-label="Open admin menu"
            />
          }
        >
          <FontAwesomeIcon icon={faBars} className="h-4 w-4 text-white" />
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin menu</SheetTitle>
          </SheetHeader>
          <RightPanel
            pathname={pathname}
            user={userInfo}
            onLogout={handleLogout}
            notifications={notifications}
            onItemClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Page content */}
      <main className="min-w-0 flex-1 px-4 pb-8 pt-16 md:px-6 md:pt-6">{children}</main>
    </div>
  );
}
