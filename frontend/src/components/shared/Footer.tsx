import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FALLBACK_SETTINGS } from "@/lib/settings";
import type { SiteSettings } from "@/types";

export function Footer({ settings = FALLBACK_SETTINGS }: { settings?: SiteSettings }) {
  const siteName = settings.site_name ?? "Future Shop";
  const tagline = settings.site_tagline ?? FALLBACK_SETTINGS.site_tagline;

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

        {/* Quick links — only real routes */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold" lang="bn">
            দ্রুত লিংক
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/products" lang="bn" className="hover:text-[#f47920] transition-colors">
                পণ্য সমূহ
              </Link>
            </li>
            <li>
              <Link href="/brands" lang="bn" className="hover:text-[#f47920] transition-colors">
                ব্র্যান্ড
              </Link>
            </li>
            <li>
              <Link href="/track-order" lang="bn" className="hover:text-[#f47920] transition-colors">
                অর্ডার ট্র্যাক
              </Link>
            </li>
            <li>
              <Link href="/dashboard" lang="bn" className="hover:text-[#f47920] transition-colors">
                আমার অ্যাকাউন্ট
              </Link>
            </li>
          </ul>
        </div>

        {/* Useful links */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold" lang="bn">
            প্রয়োজনীয় তথ্য
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/about" lang="bn" className="hover:text-[#f47920] transition-colors">
                আমাদের সম্পর্কে
              </Link>
            </li>
            <li>
              <Link href="/contact" lang="bn" className="hover:text-[#f47920] transition-colors">
                যোগাযোগ
              </Link>
            </li>
            <li>
              <Link href="/privacy" lang="bn" className="hover:text-[#f47920] transition-colors">
                গোপনীয়তা নীতি
              </Link>
            </li>
            <li>
              <Link href="/terms" lang="bn" className="hover:text-[#f47920] transition-colors">
                শর্তাবলী
              </Link>
            </li>
            <li>
              <Link href="/returns" lang="bn" className="hover:text-[#f47920] transition-colors">
                রিটার্ন পলিসি
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold" lang="bn">
            যোগাযোগ
          </h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {(settings.contact_phone || FALLBACK_SETTINGS.contact_phone) && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#f47920]" />
                <a
                  href={`tel:${settings.contact_phone || FALLBACK_SETTINGS.contact_phone}`}
                  className="hover:text-[#f47920] transition-colors"
                >
                  {settings.contact_phone || FALLBACK_SETTINGS.contact_phone}
                </a>
              </li>
            )}
            {(settings.contact_email || FALLBACK_SETTINGS.contact_email) && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#f47920]" />
                <a
                  href={`mailto:${settings.contact_email || FALLBACK_SETTINGS.contact_email}`}
                  className="hover:text-[#f47920] transition-colors break-all"
                >
                  {settings.contact_email || FALLBACK_SETTINGS.contact_email}
                </a>
              </li>
            )}
            {(settings.contact_address || FALLBACK_SETTINGS.contact_address) && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#f47920]" />
                <span className="leading-snug">
                  {settings.contact_address || FALLBACK_SETTINGS.contact_address}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom Bar: Copyright + English Legal & Sitemap Links */}
      <div className="border-t py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-[#f47920] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#f47920] transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/returns" className="hover:text-[#f47920] transition-colors">
              Return Policy
            </Link>
            <Link href="/sitemap.xml" target="_blank" className="hover:text-[#f47920] transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
