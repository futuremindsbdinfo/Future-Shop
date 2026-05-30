import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand + tagline */}
        <div className="space-y-3">
          <span className="text-xl font-bold text-[#1a6bdf]">LocalBazaar</span>
          <p className="text-sm text-muted-foreground" lang="bn">
            আপনার পাড়ার বাজার, এখন অনলাইনে
          </p>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-[#1a6bdf]">Home</Link></li>
            <li><Link href="/categories" className="hover:text-[#1a6bdf]">Categories</Link></li>
            <li><Link href="/about" className="hover:text-[#1a6bdf]">About</Link></li>
            <li><Link href="/contact" className="hover:text-[#1a6bdf]">Contact</Link></li>
          </ul>
        </div>

        {/* Sherpur */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Sherpur</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Sherpur Sadar, Mymensingh Division</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <span>+880 1700-000000</span>
            </li>
          </ul>
        </div>

        {/* Bogura */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Bogura</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Bogura Sadar, Rajshahi Division</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <span>+880 1800-000000</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t py-4">
        <p className="text-center text-xs text-muted-foreground">
          © 2026 LocalBazaar. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
