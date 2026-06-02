"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

/**
 * Renders the storefront chrome (Navbar + Footer) for all pages EXCEPT the
 * admin area, which provides its own sidebar layout. This gives admin pages a
 * clean, full-width shell without the public header/footer.
 */
export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Admin and delivery areas use their own full-width chrome (no storefront nav).
  const isBareLayout =
    (pathname?.startsWith("/admin") ?? false) || (pathname?.startsWith("/delivery") ?? false);

  if (isBareLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
