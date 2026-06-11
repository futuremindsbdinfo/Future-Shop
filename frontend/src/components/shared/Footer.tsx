import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FALLBACK_SETTINGS } from "@/lib/settings";
import type { SiteSettings } from "@/types";

export function Footer({ settings = FALLBACK_SETTINGS }: { settings?: SiteSettings }) {
  const siteName = settings.site_name ?? "Future Shop";
  const tagline = settings.site_tagline ?? FALLBACK_SETTINGS.site_tagline;
  const hasContact =
    settings.contact_phone || settings.contact_email || settings.contact_address;

  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {/* Brand + tagline */}
        <div className="space-y-3">
          <span className="text-xl font-bold text-[#f47920]">{siteName}</span>
          {tagline && (
            <p className="text-sm text-muted-foreground" lang="bn">
              {tagline}
            </p>
          )}
        </div>

        {/* Quick links — only real routes */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold" lang="bn">
            দ্রুত লিংক
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/products" lang="bn" className="hover:text-[#f47920]">
                পণ্য সমূহ
              </Link>
            </li>
            <li>
              <Link href="/brands" lang="bn" className="hover:text-[#f47920]">
                ব্র্যান্ড
              </Link>
            </li>
            <li>
              <Link href="/orders" lang="bn" className="hover:text-[#f47920]">
                অর্ডার ট্র্যাক
              </Link>
            </li>
            <li>
              <Link href="/dashboard" lang="bn" className="hover:text-[#f47920]">
                আমার অ্যাকাউন্ট
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact — driven by site settings only. No hardcoded fallback numbers. */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold" lang="bn">
            যোগাযোগ
          </h4>
          {hasContact ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {settings.contact_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a
                    href={`tel:${settings.contact_phone}`}
                    className="hover:text-[#f47920]"
                  >
                    {settings.contact_phone}
                  </a>
                </li>
              )}
              {settings.contact_email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="hover:text-[#f47920]"
                  >
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings.contact_address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{settings.contact_address}</span>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground" lang="bn">
              শীঘ্রই আপডেট হবে।
            </p>
          )}
        </div>
      </div>

      <div className="border-t py-4">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
