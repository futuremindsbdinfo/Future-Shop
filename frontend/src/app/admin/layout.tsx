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
  faChartColumn,
  faChartLine,
  faChevronLeft,
  faChevronRight,
  faCircleQuestion,
  faClipboardList,
  faFileInvoice,
  faGear,
  faLocationDot,
  faRightFromBracket,
  faStore,
  faTableCells,
  faTags,
  faUserGroup,
  faUsers,
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
  { href: "/admin/analytics", label: "Analytics", icon: faChartLine },
  { href: "/admin/products", label: "Products", icon: faBagShopping },
  { href: "/admin/brands", label: "Brands", icon: faTags },
  { href: "/admin/orders", label: "Orders", icon: faClipboardList },
  { href: "/admin/customers", label: "Customers", icon: faUserGroup },
  { href: "/admin/users", label: "Users", icon: faUsers },
  { href: "/admin/vendors", label: "Vendors", icon: faStore },
  { href: "/admin/reports", label: "Reports", icon: faChartColumn },
  { href: "/admin/invoices", label: "Invoices", icon: faFileInvoice },
  { href: "/admin/zones", label: "Delivery Zones", icon: faLocationDot },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}

/* ----------------------- LEFT ICON RAIL (64px) ----------------------- */
function LeftRail({
  pathname,
  expanded,
  onToggle,
}: {
  pathname: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className="hidden h-screen w-16 shrink-0 flex-col items-center bg-[#f47920] py-4 md:sticky md:top-0 md:flex"
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
                  ? "bg-white text-[#f47920]"
                  : "text-white/85 hover:bg-white/15 hover:text-white",
              )}
            >
              <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
            </Link>
          );
        })}
      </nav>

      {/* Bottom: settings + collapse/expand toggle */}
      <div className="mt-2 flex flex-col items-center gap-2">
        <Link
          href="/admin/settings"
          title="Settings"
          aria-label="Settings"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isActive(pathname, "/admin/settings")
              ? "bg-white text-[#f47920]"
              : "text-white/85 hover:bg-white/15 hover:text-white",
          )}
        >
          <FontAwesomeIcon icon={faGear} className="h-4 w-4" />
        </Link>

        {/* High-contrast toggle button — white circle, blue chevron */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={expanded}
          title={expanded ? "Collapse" : "Expand"}
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#f47920] bg-white text-[#f47920] shadow-sm transition-transform hover:scale-105"
        >
          <FontAwesomeIcon icon={expanded ? faChevronLeft : faChevronRight} className="h-3.5 w-3.5" />
        </button>
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
  onCollapse,
}: {
  pathname: string;
  user: { name: string; email: string | null } | null;
  onLogout: () => void;
  notifications: Order[];
  onItemClick?: () => void;
  onCollapse?: () => void;
}) {
  return (
    <div className="flex h-full w-[220px] flex-col border-r border-[#e5e7eb] bg-white">
      {/* User + optional collapse button (desktop only — sheet has its own close) */}
      <div className="relative border-b border-[#e5e7eb] px-4 pb-4 pt-4">
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Collapse sidebar"
            title="Collapse"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-[#9ca3af] transition-colors hover:bg-[#f3f4f6] hover:text-[#374151]"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f47920] text-sm font-semibold text-white">
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
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-[#f47920] text-white"
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
                  ? "bg-[#f47920] text-white"
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
  // Sidebar collapsed/expanded — persisted in localStorage, default collapsed.
  const [expanded, setExpanded] = useState(false);
  // Wait one tick for AuthHydrator to restore from sessionStorage before
  // deciding the user is logged out (avoids a redirect race on hard refresh).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Restore the sidebar preference at the same time.
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("admin-sidebar-expanded");
      if (saved === "true") setExpanded(true);
    }
    setHydrated(true);
  }, []);

  // Persist any later changes to the sidebar state.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem("admin-sidebar-expanded", String(expanded));
  }, [expanded, hydrated]);

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

  if (!hydrated) return <LoadingSpinner fullHeight />;
  if (!isAuthenticated || user?.role !== "admin") {
    return <LoadingSpinner fullHeight />;
  }

  const userInfo = { name: user.name, email: user.email };

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      {/* Desktop: icon rail + collapsible expanded panel */}
      <LeftRail
        pathname={pathname}
        expanded={expanded}
        onToggle={() => {
          // Debug: confirm the click is registering at the layout level.
          console.log("sidebar toggled:", !expanded);
          setExpanded((v) => !v);
        }}
      />

      {/* Right panel — width animates between 0 and 220px (inline style for
          reliability over Tailwind dynamic class purging). */}
      <aside
        className="sticky top-0 hidden h-screen shrink-0 overflow-hidden transition-all duration-200 ease-in-out md:block"
        style={{ width: expanded ? "220px" : "0px" }}
        aria-hidden={!expanded}
      >
        <RightPanel
          pathname={pathname}
          user={userInfo}
          onLogout={handleLogout}
          notifications={notifications}
          onCollapse={() => {
            console.log("sidebar toggled:", false);
            setExpanded(false);
          }}
        />
      </aside>

      {/* Mobile: floating hamburger + sheet drawer (expanded panel only) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button
              variant="default"
              size="icon"
              className="fixed left-3 top-3 z-40 h-11 w-11 bg-[#f47920] shadow-md hover:bg-[#e56910] md:hidden"
              aria-label="Open admin menu"
            />
          }
        >
          <FontAwesomeIcon icon={faBars} className="h-4 w-4 text-white" />
        </SheetTrigger>
        <SheetContent side="left" className="w-[220px] p-0">
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
