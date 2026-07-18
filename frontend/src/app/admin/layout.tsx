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
  faBoxOpen,
  faBullhorn,
  faChartLine,
  faChevronDown,
  faChevronRight,
  faCircleQuestion,
  faClipboardList,
  faFileInvoice,
  faGear,
  faGift,
  faLayerGroup,
  faLocationDot,
  faPercent,
  faQuestionCircle,
  faRightFromBracket,
  faStar,
  faStore,
  faTableCells,
  faTags,
  faTruck,
  faTruckFast,
  faUserGroup,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import type { DashboardStats, Order } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon?: IconDefinition;
  /** If true, only role === 'admin' can see this item. Staff is hidden. */
  adminOnly?: boolean;
}

type NavGroup = {
  groupLabel: string;
  icon: IconDefinition;
  href?: string;
  items?: NavItem[];
  adminOnly?: boolean;
};

const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: "Dashboard",
    icon: faTableCells,
    href: "/admin",
    adminOnly: true,
  },
  {
    groupLabel: "Catalog",
    icon: faBoxOpen,
    items: [
      { href: "/admin/products", label: "Products", icon: faBagShopping },
      { href: "/admin/categories", label: "Categories", icon: faLayerGroup, adminOnly: true },
      { href: "/admin/brands", label: "Brands", icon: faTags },
    ]
  },
  {
    groupLabel: "Sales",
    icon: faClipboardList,
    items: [
      { href: "/admin/orders", label: "Orders", icon: faClipboardList },
      { href: "/admin/invoices", label: "Invoices", icon: faFileInvoice, adminOnly: true },
    ]
  },
  {
    groupLabel: "Users",
    icon: faUsers,
    items: [
      { href: "/admin/customers", label: "Customers", icon: faUserGroup, adminOnly: true },
      { href: "/admin/users", label: "Users", icon: faUsers, adminOnly: true },
      { href: "/admin/vendors", label: "Vendors", icon: faStore },
    ]
  },
  {
    groupLabel: "Marketing",
    icon: faBullhorn,
    items: [
      { href: "/admin/promotions", label: "Promotions", icon: faGift },
      { href: "/admin/coupons", label: "Coupons", icon: faPercent },
      { href: "/admin/reviews", label: "Reviews", icon: faStar, adminOnly: true },
      { href: "/admin/qa", label: "Q&A", icon: faQuestionCircle, adminOnly: true },
    ]
  },
  {
    groupLabel: "Delivery",
    icon: faTruck,
    items: [
      { href: "/admin/reports?tab=delivery", label: "Delivery Report", icon: faChartLine, adminOnly: true },
      { href: "/admin/orders?assignment_status=assigned_pending", label: "Assign / Pending", icon: faTruckFast, adminOnly: true },
      { href: "/admin/users?role=delivery", label: "Delivery Men", icon: faUsers, adminOnly: true },
      { href: "/admin/zones", label: "Delivery Zones", icon: faLocationDot, adminOnly: true },
    ]
  }
];

// Client-side mirror of STAFF_ALLOWED in src/proxy.ts — keep the two in sync.
// Deriving this from NAV_GROUPS instead would silently allow any admin route
// that has no nav entry (analytics, reports, settings).
const STAFF_ALLOWED = [
  "/admin/products",
  "/admin/orders",
  "/admin/vendors",
  "/admin/brands",
  "/admin/coupons",
  "/admin/promotions",
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}

/* ----------------------- LEFT ICON RAIL (64px) ----------------------- */
function LeftRail({
  pathname,
  visibleNavGroups,
  isAdmin,
}: {
  pathname: string;
  visibleNavGroups: NavGroup[];
  isAdmin: boolean;
}) {
  return (
    <div className="flex h-full w-16 flex-col items-center bg-[#f47920] py-4">
      {/* Icons */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        {visibleNavGroups.map((group) => {
          const active = group.href 
            ? isActive(pathname, group.href) 
            : (group.items?.some(i => isActive(pathname, i.href)) ?? false);
          return (
            <Link
              key={group.groupLabel}
              href={group.href || group.items?.[0]?.href || "/admin"}
              title={group.groupLabel}
              aria-label={group.groupLabel}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                active
                  ? "bg-white text-[#f47920]"
                  : "text-white/85 hover:bg-white/15 hover:text-white",
              )}
            >
              <FontAwesomeIcon icon={group.icon} className="h-4 w-4" />
            </Link>
          );
        })}
      </nav>

      {/* Bottom: settings (admin only) */}
      <div className="mt-2 flex flex-col items-center gap-2">
        {isAdmin && (
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
        )}
      </div>
    </div>
  );
}

/* ------------------------ RIGHT PANEL (220px) ------------------------ */
function RightPanel({
  pathname,
  onLogout,
  onItemClick,
  isAdmin,
}: {
  pathname: string;
  onLogout: () => void;
  onItemClick?: () => void;
  isAdmin: boolean;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const activeGroup = NAV_GROUPS.find(g => g.items && g.items.some(i => isActive(pathname, i.href)));
    if (activeGroup) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedGroups(prev => ({ ...prev, [activeGroup.groupLabel]: true }));
    }
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Menu */}
      <nav className="flex-1 overflow-y-auto min-h-0 px-2 py-4">
        {NAV_GROUPS.map((group) => {
          if (group.adminOnly && !isAdmin) return null;

          if (group.href) {
            // single link
            const active = isActive(pathname, group.href);
            return (
              <div key={group.groupLabel} className="mb-2">
                <Link
                  href={group.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-[#f47920] text-white"
                      : "text-[#374151] hover:bg-[#eff6ff]",
                  )}
                >
                  <FontAwesomeIcon icon={group.icon} className="h-4 w-4" />
                  {group.groupLabel}
                </Link>
              </div>
            );
          }

          // accordion group
          const visibleItems = group.items?.filter((item) => !item.adminOnly || isAdmin) || [];
          if (visibleItems.length === 0) return null;

          const isExpanded = !!expandedGroups[group.groupLabel];
          const hasActiveChild = visibleItems.some(i => isActive(pathname, i.href));

          return (
            <div key={group.groupLabel} className="mb-2">
              <button
                onClick={() => toggleGroup(group.groupLabel)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  hasActiveChild
                    ? "text-[#f47920]"
                    : "text-[#374151] hover:bg-[#eff6ff]"
                )}
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={group.icon} className="h-4 w-4" />
                  {group.groupLabel}
                </div>
                <FontAwesomeIcon 
                  icon={isExpanded ? faChevronDown : faChevronRight} 
                  className={cn("h-3 w-3", hasActiveChild ? "text-[#f47920]" : "text-[#9ca3af]")} 
                />
              </button>

              {isExpanded && (
                <ul className="mt-1 space-y-1 pl-9">
                  {visibleItems.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onItemClick}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
                            active
                              ? "bg-[#f47920] text-white"
                              : "text-[#4b5563] hover:bg-[#eff6ff]"
                          )}
                        >
                          {item.icon && <FontAwesomeIcon icon={item.icon} className="h-3 w-3 mr-1 opacity-70" />}
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af]">
          {isAdmin ? "Settings" : "Help"}
        </p>
        <ul className="space-y-1">
          {isAdmin && (
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
          )}
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
        </ul>
      </nav>

      {/* Fixed Logout Button at the bottom */}
      <div className="border-t border-[#e5e7eb] p-4">
        <button
          type="button"
          onClick={() => {
            onItemClick?.();
            onLogout();
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
          Logout
        </button>
      </div>
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
      if (saved === "true") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect
        (setExpanded as any)(true); // Bypass strict set-state-in-effect rule
      }
    }
    const t = setTimeout(() => {
      setHydrated(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Persist any later changes to the sidebar state.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem("admin-sidebar-expanded", String(expanded));
  }, [expanded, hydrated]);

  const isAllowed = user?.role === "admin" || user?.role === "staff" || user?.role === "vendor";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !isAllowed) {
      router.replace("/?auth=login&next=/admin");
    }
  }, [hydrated, isAuthenticated, isAllowed, router]);

  // Guard for staff/vendor accessing admin-only routes directly via URL
  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user) return;
    if (user.role === "admin") return;

    if (pathname === "/admin") {
      router.replace(user.role === "staff" ? "/admin/orders" : "/admin/products");
      return;
    }

    // Staff: allowlist, identical to the proxy. /admin/orders is itself allowed,
    // so the redirect target can never re-trigger this guard.
    if (user.role === "staff") {
      const allowed = STAFF_ALLOWED.some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
      );
      if (!allowed) router.replace("/admin/orders");
      return;
    }

    // Vendor: nav-derived admin-only flags (the proxy already bars vendors from
    // /admin entirely, so this is belt-and-braces only).
    let adminOnlyPath = false;
    for (const group of NAV_GROUPS) {
      if (group.href && isActive(pathname, group.href)) {
        if (group.adminOnly) adminOnlyPath = true;
      }
      if (group.items) {
        for (const item of group.items) {
          if (isActive(pathname, item.href)) {
            if (group.adminOnly || item.adminOnly) adminOnlyPath = true;
          }
        }
      }
    }

    if (adminOnlyPath) {
      router.replace("/admin/products");
    }
  }, [hydrated, isAuthenticated, user, pathname, router]);

  // Fetch last few orders for the notifications panel.
  // Dashboard endpoint is admin-only; staff just sees an empty notifications block.
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    api
      .get<{ data: DashboardStats }>("/admin/dashboard")
      .then((r) => setNotifications(r.data.data.recent_orders ?? []))
      .catch(() => {
        /* non-fatal */
      });
  }, [isAuthenticated, isAdmin]);

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
  if (!isAuthenticated || !isAllowed) {
    return <LoadingSpinner fullHeight />;
  }

  const userInfo = { name: user.name, email: user.email };
  const visibleNavGroups = NAV_GROUPS.filter((g) => !g.adminOnly || isAdmin);

  return (
    <div className="flex min-h-screen flex-col bg-[#f9fafb]">
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0 -ml-2"
            onClick={() => setMobileOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} className="h-5 w-5 text-[#374151]" />
          </Button>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-md text-[#6b7280] hover:bg-[#f3f4f6] transition-colors"
          >
            <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
          </button>

          <Link href="/admin" className="flex h-10 px-3 items-center justify-center rounded-lg bg-[#f47920] text-base font-bold tracking-tight text-white ml-2">
            Future Shop
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#6b7280] hover:bg-[#f3f4f6] transition-colors outline-none cursor-pointer">
              <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute right-1 top-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-2 text-sm font-semibold text-[#111827]">Notifications</div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-[#9ca3af]">No recent orders</div>
              ) : (
                notifications.slice(0, 5).map((order) => (
                  <DropdownMenuItem key={order.id} className="p-0">
                    <Link href={`/admin/orders`} className="flex w-full flex-col items-start gap-1 p-3 cursor-pointer">
                      <span className="font-mono text-[11px] font-semibold text-[#111827]">
                        Order #{order.order_number}
                      </span>
                      <span className="text-[11px] text-[#6b7280]">
                        ৳{Number(order.total).toLocaleString("en-US")} · {order.order_status}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-3 border-l border-[#e5e7eb] pl-4">
            <div className="hidden min-w-0 md:block text-right">
              <p className="truncate text-[13px] font-semibold leading-tight text-[#111827]">
                {userInfo.name ?? "Admin"}
              </p>
              <p className="truncate text-[11px] text-[#9ca3af]">{userInfo.email ?? "—"}</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f47920] text-sm font-semibold text-white">
              {userInfo.name?.charAt(0).toUpperCase() ?? "A"}
            </span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar wrapper */}
        <aside
          className="hidden shrink-0 overflow-hidden transition-all duration-200 ease-in-out md:flex flex-col border-r border-[#e5e7eb] bg-white"
          style={{ width: expanded ? "220px" : "64px" }}
        >
          {expanded ? (
            <RightPanel
              pathname={pathname}
              onLogout={handleLogout}
              isAdmin={isAdmin}
            />
          ) : (
            <LeftRail
              pathname={pathname}
              visibleNavGroups={visibleNavGroups}
              isAdmin={isAdmin}
            />
          )}
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[260px] p-0 flex flex-col">
            <SheetHeader className="border-b border-[#e5e7eb] p-4 text-left">
              <SheetTitle className="text-[#f47920]">Admin Panel</SheetTitle>
            </SheetHeader>
            <div className="flex-1 flex flex-col overflow-hidden">
              <RightPanel
                pathname={pathname}
                onLogout={handleLogout}
                onItemClick={() => setMobileOpen(false)}
                isAdmin={isAdmin}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Page content */}
        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-8 pt-6 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
