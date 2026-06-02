"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { AuthModal } from "@/components/shared/AuthModal";
import type { Category } from "@/types";

export function Navbar() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const totalItems = useCartStore((state) => state.totalItems);

  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Open the auth modal automatically when the proxy redirected here (?auth=login).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "login") {
      setAuthTab("login");
      setAuthOpen(true);
    }
  }, []);

  const openAuth = (nextTab: "login" | "register") => {
    setAuthTab(nextTab);
    setAuthOpen(true);
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    const next = new URLSearchParams(window.location.search).get("next");
    if (next) router.push(next);
  };

  useEffect(() => {
    let active = true;
    api
      .get<{ data: Category[] }>("/categories")
      .then((res) => {
        if (active) setCategories(res.data.data);
      })
      .catch(() => {
        /* non-fatal: nav still renders without categories */
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore network errors on logout */
    }
    logout();
    router.push("/");
  };

  const dashboardHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "delivery"
        ? "/delivery"
        : "/orders";

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        {/* Mobile menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col">
            <SheetHeader>
              <SheetTitle className="text-left text-[#1a6bdf]">Future Shop</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-6">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="rounded px-2 py-2 text-sm hover:bg-muted">Home</Link>
              <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="rounded px-2 py-2 text-sm hover:bg-muted">Categories</Link>
              <div className="mt-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                Shop by category
              </div>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded px-2 py-2 text-sm hover:bg-muted"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* Auth section (bottom of mobile menu) — divider above */}
            <div className="border-t px-2 pt-3">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-1">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a6bdf] text-base font-semibold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 truncate text-sm font-medium">{user.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="h-11 w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span lang="bn">লগআউট</span>
                  </Button>
                </div>
              ) : (
                <Button
                  className="h-11 w-full bg-[#1a6bdf] hover:bg-[#1559bd]"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth("login");
                  }}
                >
                  <span lang="bn">লগইন / রেজিস্ট্রেশন</span>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="shrink-0 text-xl font-bold text-[#1a6bdf]">
          Future Shop
        </Link>

        {/* Category dropdown (desktop) */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="hidden md:inline-flex" />}
          >
            Categories
            <ChevronDown className="ml-1 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-96 w-56 overflow-y-auto">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Shop by category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.length === 0 ? (
                <DropdownMenuItem disabled>No categories</DropdownMenuItem>
              ) : (
                categories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    render={<Link href={`/category/${category.slug}`} />}
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="max-w-md"
            aria-label="Search products"
          />
          <Button type="submit" size="icon" className="bg-[#1a6bdf] hover:bg-[#1559bd]" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Cart */}
        <Link href="/cart" className="relative shrink-0" aria-label="Cart">
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          {totalItems > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full bg-red-600 px-1 text-xs text-white hover:bg-red-600">
              {totalItems}
            </Badge>
          )}
        </Link>

        {/* Auth */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Account" />}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a6bdf] text-sm font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href={dashboardHref} />}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/orders" />}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/profile" />}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span lang="bn">প্রোফাইল</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Button variant="ghost" onClick={() => openAuth("login")}>
              <span lang="bn">লগইন</span>
            </Button>
            <Button className="bg-[#1a6bdf] hover:bg-[#1559bd]" onClick={() => openAuth("register")}>
              <span lang="bn">রেজিস্ট্রেশন</span>
            </Button>
          </div>
        )}
      </div>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        tab={authTab}
        onTabChange={setAuthTab}
        onSuccess={handleAuthSuccess}
      />
    </header>
  );
}
