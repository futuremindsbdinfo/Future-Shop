"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  Heart,
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
import { formatTaka } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { AuthModal } from "@/components/shared/AuthModal";
import type { Category, PaginatedResponse, Product } from "@/types";

export function Navbar({ siteName = "Future Shop" }: { siteName?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const totalItems = useCartStore((state) => state.totalItems);
  const openCart = useCartStore((state) => state.openCart);
  const wishlistItemsCount = useWishlistStore((state) => state.items.length);

  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Cart count comes from a localStorage-persisted store that only rehydrates
  // after mount, so gate the badge on `mounted` to avoid an SSR/client mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // --- Type-ahead product search ---------------------------------------------
  const searchRef = useRef<HTMLFormElement>(null);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchClosed, setSearchClosed] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  // Fetch up to 6 published product suggestions for the debounced query (>=2 chars).
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) return;
    let active = true;
    setSearchLoading(true);
    api
      .get<PaginatedResponse<Product>>(`/products?search=${encodeURIComponent(q)}&per_page=6`)
      .then((r) => {
        if (active) setSuggestions(r.data.data);
      })
      .catch(() => {
        if (active) setSuggestions([]);
      })
      .finally(() => {
        if (active) setSearchLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  // Dropdown visible when there's a 2+ char query and it hasn't been dismissed.
  const showSuggest = !searchClosed && query.trim().length >= 2;
  // While the debounce hasn't caught up yet, show the loading state (no empty flash).
  const searchPending = query.trim().length >= 2 && debouncedQuery.trim() !== query.trim();

  // Close the suggestions on an outside click.
  useEffect(() => {
    if (!showSuggest) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchClosed(true);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [showSuggest]);

  const selectSuggestion = (slug: string) => {
    setQuery("");
    setSearchClosed(true);
    router.push(`/products/${slug}`);
  };

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
    if (q) {
      setSearchClosed(true);
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
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
        : "/dashboard";

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
              <SheetTitle className="text-left text-[#f47920]">{siteName}</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-6">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="rounded px-2 py-2 text-sm hover:bg-muted">Home</Link>
              <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="rounded px-2 py-2 text-sm hover:bg-muted">Categories</Link>
              <Link href="/brands" onClick={() => setMobileMenuOpen(false)} className="rounded px-2 py-2 text-sm hover:bg-muted">Brands</Link>
              <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="rounded px-2 py-2 text-sm hover:bg-muted" lang="bn">আমার উইশলিস্ট</Link>
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
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f47920] text-base font-semibold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 truncate text-sm font-medium">{user.name}</span>
                  </div>
                  <Button
                    nativeButton={false}
                    render={<Link href={dashboardHref} />}
                    className="h-11 w-full bg-[#f47920] hover:bg-[#e56910]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Dashboard
                  </Button>
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
                  className="h-11 w-full bg-[#f47920] hover:bg-[#e56910]"
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
        <Link href="/" className="shrink-0 text-xl font-bold text-[#f47920]">
          {siteName}
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

        {/* Brands (desktop) */}
        <Button
          variant="ghost"
          className="hidden md:inline-flex"
          nativeButton={false}
          render={<Link href="/brands" />}
        >
          Brands
        </Button>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          ref={searchRef}
          className="relative flex flex-1 items-center gap-2"
        >
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchClosed(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchClosed(true);
            }}
            placeholder="Search products..."
            className="max-w-md"
            aria-label="Search products"
            autoComplete="off"
          />
          <Button type="submit" size="icon" className="bg-[#f47920] hover:bg-[#e56910]" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>

          {showSuggest && (
            // Mobile: full-width panel pinned below the navbar (the search form
            // itself is too narrow). Desktop: anchored under the wide form.
            <div className="fixed inset-x-2 top-16 z-50 max-h-[70vh] overflow-y-auto rounded-lg border bg-popover shadow-lg sm:absolute sm:inset-x-0 sm:top-full sm:mt-1">
              {searchLoading || searchPending ? (
                <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span lang="bn">খুঁজছি...</span>
                </div>
              ) : suggestions.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground" lang="bn">
                  কোনো পণ্য পাওয়া যায়নি
                </p>
              ) : (
                <ul className="py-1">
                  {suggestions.map((p) => {
                    const price = p.sale_price ? Number(p.sale_price) : Number(p.price);
                    const img = (p.images ?? []).find((i) => i?.url)?.url ?? null;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => selectSuggestion(p.slug)}
                          className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
                        >
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                            {img && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={img} alt={p.name} className="h-full w-full object-cover" />
                            )}
                          </span>
                          <span className="line-clamp-1 min-w-0 flex-1 text-sm">{p.name}</span>
                          <span className="shrink-0 text-sm font-semibold text-[#f47920]">
                            {formatTaka(price)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </form>

        <div className="flex shrink-0 items-center gap-1">
          {/* Wishlist */}
          <div className="relative shrink-0">
            <Button
              variant="ghost"
              size="icon"
              nativeButton={false}
              render={<Link href="/wishlist" />}
              aria-label="উইশলিস্ট"
              className="h-11 w-11 sm:h-10 sm:w-10"
            >
              <Heart className="size-6" />
            </Button>
            {mounted && wishlistItemsCount > 0 && (
              <Badge className="pointer-events-none absolute -right-0.5 -top-0.5 h-5 min-w-5 justify-center rounded-full bg-red-600 px-1 text-xs text-white hover:bg-red-600">
                {wishlistItemsCount}
              </Badge>
            )}
          </div>

          {/* Cart */}
          <div className="relative shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={openCart}
              aria-label="কার্ট খুলুন"
              className="h-11 w-11 sm:h-10 sm:w-10"
            >
              <ShoppingCart className="size-6" />
            </Button>
            {mounted && totalItems > 0 && (
              <Badge className="pointer-events-none absolute -right-0.5 -top-0.5 h-5 min-w-5 justify-center rounded-full bg-red-600 px-1 text-xs text-white hover:bg-red-600">
                {totalItems}
              </Badge>
            )}
          </div>
        </div>

        {/* Auth */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Account" />}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f47920] text-sm font-semibold text-white">
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
            {/* Login: orange gradient. Register: orange border + text. */}
            <Button
              className="bg-gradient-to-r from-[#f47920] to-[#fb923c] text-white hover:opacity-90"
              onClick={() => openAuth("login")}
            >
              <span lang="bn">লগইন</span>
            </Button>
            <Button
              variant="outline"
              className="border-[#f47920] text-[#f47920] hover:bg-[#fff7ed]"
              onClick={() => openAuth("register")}
            >
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
