"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { FALLBACK_SETTINGS } from "@/lib/settings";
import type { SiteSettings } from "@/types";

/**
 * Renders the storefront chrome (Navbar + Footer) for all pages EXCEPT the
 * admin and delivery areas, which provide their own full-width layouts.
 */
export function Chrome({
  children,
  settings = FALLBACK_SETTINGS,
}: {
  children: React.ReactNode;
  settings?: SiteSettings;
}) {
  const pathname = usePathname();
  // Admin, delivery, and the hidden /fuminds admin login use their own
  // full-width chrome (no storefront nav/footer).
  const isBareLayout =
    (pathname?.startsWith("/admin") ?? false) ||
    (pathname?.startsWith("/delivery") ?? false) ||
    (pathname?.startsWith("/fuminds") ?? false);

  if (isBareLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar
        siteName={settings.site_name ?? FALLBACK_SETTINGS.site_name ?? "Future Shop"}
        logo={settings.site_logo || "/logo.png"}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <CartDrawer />
    </>
  );
}
