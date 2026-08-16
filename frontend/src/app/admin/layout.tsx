"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingBag,
  Receipt,
  Users,
  UserCog,
  Store,
  Percent,
  Gift,
  Star,
  MessageSquareHelp,
  Truck,
  MapPin,
  FileSpreadsheet,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Globe,
  Bell,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface NavSubItem {
  href: string;
  label: string;
  icon: typeof Package;
  adminOnly?: boolean;
}

interface NavGroup {
  groupLabel: string;
  icon: typeof Package;
  href?: string;
  items?: NavSubItem[];
  adminOnly?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: "ড্যাশবোর্ড (Dashboard)",
    icon: LayoutDashboard,
    href: "/admin",
    adminOnly: true,
  },
  {
    groupLabel: "পণ্য ও ক্যাটালগ (Catalog)",
    icon: Package,
    items: [
      { href: "/admin/products", label: "সকল পণ্য (Products)", icon: Package },
      { href: "/admin/categories", label: "ক্যাটাগরি (Categories)", icon: FolderTree, adminOnly: true },
      { href: "/admin/brands", label: "ব্র্যান্ডসমূহ (Brands)", icon: Tag },
    ],
  },
  {
    groupLabel: "অর্ডার ও বিক্রয় (Sales)",
    icon: ShoppingBag,
    items: [
      { href: "/admin/orders", label: "সকল অর্ডার (Orders)", icon: ShoppingBag },
      { href: "/admin/invoices", label: "ইনভয়েস ও মেমো (Invoices)", icon: Receipt, adminOnly: true },
    ],
  },
  {
    groupLabel: "ডেলিভারি সিস্টেম (Delivery)",
    icon: Truck,
    items: [
      { href: "/admin/zones", label: "ডেলিভারি জোন (Zones)", icon: MapPin, adminOnly: true },
      { href: "/admin/orders?assignment_status=assigned_pending", label: "রাইডার অ্যাসাইন (Assign)", icon: Truck, adminOnly: true },
      { href: "/admin/reports?tab=delivery", label: "ডেলিভারি রিপোর্ট (Reports)", icon: FileSpreadsheet, adminOnly: true },
    ],
  },
  {
    groupLabel: "মার্কেটিং ও অফার (Marketing)",
    icon: Gift,
    items: [
      { href: "/admin/coupons", label: "ডিসকাউন্ট কুপন (Coupons)", icon: Percent },
      { href: "/admin/promotions", label: "প্রমোশন অফার (Promotions)", icon: Gift },
      { href: "/admin/reviews", label: "গ্রাহক রিভিউ (Reviews)", icon: Star, adminOnly: true },
      { href: "/admin/qa", label: "প্রশ্ন ও উত্তর (Q&A)", icon: MessageSquareHelp, adminOnly: true },
    ],
  },
  {
    groupLabel: "ইউজার ও ভেন্ডর (Users)",
    icon: Users,
    items: [
      { href: "/admin/customers", label: "গ্রাহক তালিকা (Customers)", icon: Users, adminOnly: true },
      { href: "/admin/users", label: "স্টাফ ও ইউজার (All Users)", icon: UserCog, adminOnly: true },
      { href: "/admin/vendors", label: "ভেন্ডর / সেলার (Vendors)", icon: Store },
    ],
  },
  {
    groupLabel: "সিস্টেম সেটিংস (Settings)",
    icon: Settings,
    items: [
      { href: "/admin/settings", label: "ওয়েবসাইট সেটিংস", icon: Settings, adminOnly: true },
      { href: "/admin/analytics", label: "বিজনেস অ্যানালিটিক্স", icon: FileSpreadsheet, adminOnly: true },
    ],
    adminOnly: true,
  },
];

function isPathActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href.split("?")[0]);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // One tick hydration check
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(t);
  }, []);

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || (!isAdmin && !isStaff)) {
      router.replace("/?auth=login&next=/admin");
    }
  }, [hydrated, isAuthenticated, isAdmin, isStaff, router]);

  // Auto-expand group that matches current path
  useEffect(() => {
    const activeGroup = NAV_GROUPS.find((g) =>
      g.items?.some((i) => isPathActive(pathname, i.href))
    );
    if (activeGroup) {
      setExpandedGroups((prev) => ({ ...prev, [activeGroup.groupLabel]: true }));
    }
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
  if (!isAuthenticated || (!isAdmin && !isStaff)) {
    return <LoadingSpinner fullHeight />;
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white select-none">
      
      {/* Brand Header */}
      <div className="border-b border-gray-200 p-5 bg-gradient-to-br from-orange-50/60 via-white to-white">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f47920] text-white shadow-xs">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <span className="font-extrabold text-gray-900 text-sm tracking-tight block truncate">
                Future Shop
              </span>
              <span className="text-[10px] font-bold text-[#f47920] uppercase tracking-wider block">
                {isAdmin ? "Admin Control" : "Staff Panel"}
              </span>
            </div>
          </Link>
        </div>

        {/* View Live Store Button */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3.5 flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 py-2 px-3 text-xs font-bold text-gray-700 hover:border-[#f47920] hover:text-[#f47920] hover:bg-orange-50/50 shadow-2xs transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-[#f47920]" />
          <span>লাইভ শপ দেখুন</span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </a>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 min-h-0">
        {NAV_GROUPS.map((group) => {
          if (group.adminOnly && !isAdmin) return null;

          // Single Link Item (e.g. Dashboard)
          if (group.href) {
            const active = isPathActive(pathname, group.href);
            const Icon = group.icon;
            return (
              <div key={group.groupLabel} className="mb-1">
                <Link
                  href={group.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
                    active
                      ? "bg-[#f47920] text-white shadow-xs"
                      : "text-gray-700 hover:bg-orange-50/60 hover:text-[#f47920]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-gray-400")} />
                    <span>{group.groupLabel}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              </div>
            );
          }

          // Accordion Group
          const visibleItems =
            group.items?.filter((item) => !item.adminOnly || isAdmin) || [];
          if (visibleItems.length === 0) return null;

          const isExpanded = !!expandedGroups[group.groupLabel];
          const hasActiveChild = visibleItems.some((i) => isPathActive(pathname, i.href));
          const GroupIcon = group.icon;

          return (
            <div key={group.groupLabel} className="mb-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.groupLabel)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                  hasActiveChild
                    ? "text-[#f47920] bg-orange-50/50"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GroupIcon className={cn("h-4 w-4 shrink-0", hasActiveChild ? "text-[#f47920]" : "text-gray-400")} />
                  <span className="truncate">{group.groupLabel}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                )}
              </button>

              {isExpanded && (
                <ul className="mt-1 space-y-1 pl-4 pr-1 border-l-2 border-orange-100 ml-4 py-1">
                  {visibleItems.map((item) => {
                    const active = isPathActive(pathname, item.href);
                    const SubIcon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all",
                            active
                              ? "bg-[#f47920] text-white shadow-2xs"
                              : "text-gray-600 hover:bg-orange-50/50 hover:text-[#f47920]"
                          )}
                        >
                          <SubIcon className={cn("h-3 w-3 shrink-0", active ? "text-white" : "text-gray-400")} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile & Logout Bottom Box */}
      <div className="border-t border-gray-200 p-4 bg-gray-50/50 space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-xs font-bold text-white shadow-2xs">
            {user?.name?.charAt(0).toUpperCase() ?? "A"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-gray-900 leading-tight">
              {user?.name ?? "Admin"}
            </p>
            <p className="truncate text-[10px] text-muted-foreground font-mono">
              {user?.email ?? user?.phone ?? "Master Access"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="h-9 w-full justify-center gap-2 rounded-xl text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs font-bold"
          onClick={() => {
            setMobileOpen(false);
            handleLogout();
          }}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>লগআউট করুন</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
      
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 border-r border-gray-200 bg-white h-screen sticky top-0 flex-col z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Sheet Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white">
          <SheetHeader className="sr-only">
            <SheetTitle>অ্যাডমিন মেনু</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Right Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-2xs">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 -ml-2 text-gray-700 hover:bg-orange-50 hover:text-[#f47920] rounded-xl md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open admin menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden sm:block">
                <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>শেরপুর, বগুড়া সেন্ট্রাল কন্ট্রোল প্যানেল</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-orange-50 hover:text-[#f47920] px-3 py-1.5 rounded-xl border border-gray-200 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#f47920]" />
                <span>মূল শপ</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>

              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl">
                👤 {user?.name}
              </span>

              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-xl border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold md:hidden"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>

          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
