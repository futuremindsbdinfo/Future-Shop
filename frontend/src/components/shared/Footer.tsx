import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FALLBACK_SETTINGS } from "@/lib/settings";
import type { SiteSettings } from "@/types";

export function Footer({ settings = FALLBACK_SETTINGS }: { settings?: SiteSettings }) {
  const siteName = settings.site_name ?? "Future Shop";
  const tagline = settings.site_tagline ?? FALLBACK_SETTINGS.site_tagline;
  const hasContact = settings.contact_phone || settings.contact_email || settings.contact_address;

  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand + tagline */}
        <div className="space-y-3">
          <span className="text-xl font-bold text-[#f47920]">{siteName}</span>
          {tagline && (
            <p className="text-sm text-muted-foreground" lang="bn">
              {tagline}
            </p>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-[#f47920]">Home</Link></li>
            <li><Link href="/categories" className="hover:text-[#f47920]">Categories</Link></li>
            <li><Link href="/about" className="hover:text-[#f47920]">About</Link></li>
            <li><Link href="/contact" className="hover:text-[#f47920]">Contact</Link></li>
          </ul>
        </div>

        {/* Contact (from settings) */}
        {hasContact ? (
          <div className="space-y-3 sm:col-span-2">
            <h4 className="text-sm font-semibold" lang="bn">যোগাযোগ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {settings.contact_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-[#f47920]">{settings.contact_phone}</a>
                </li>
              )}
              {settings.contact_email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-[#f47920]">{settings.contact_email}</a>
                </li>
              )}
              {settings.contact_address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{settings.contact_address}</span>
                </li>
              )}
            </ul>
          </div>
        ) : (
          <>
            {/* Fallback locations when no contact settings are configured */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Sherpur</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Sherpur Sadar, Dhaka Division</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>+880 1700-000000</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Bogura</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Bogura, Rajshahi Division</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>+880 1800-000000</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="border-t py-4">
        <p className="text-center text-xs text-muted-foreground">
          © 2026 {siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
