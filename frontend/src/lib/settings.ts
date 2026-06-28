import type { SiteSettings } from "@/types";

/** Hardcoded fallback used when the settings API is unavailable. */
export const FALLBACK_SETTINGS: SiteSettings = {
  site_name: "Future Shop",
  site_tagline: "বাজারে নয়, বাজার আসবে আপনার ঘরে।",
  contact_phone: "01813354648",
  contact_email: "futuremindsbd.info@gmail.com",
  contact_address: "সান্যালপাড়া, সোনালী ব্যাংকর পেছনে, শেরপুর বাসস্ট্যান্ড, শেরপুর, বগুড়া",
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/**
 * Server-side fetch of public site settings, cached for 1 hour (ISR).
 * Falls back to hardcoded defaults if the API fails or is unreachable.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${BASE}/settings`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600, tags: ["settings"] },
    });
    if (!res.ok) return FALLBACK_SETTINGS;

    const json = (await res.json()) as { data?: Partial<SiteSettings> };
    const d = json.data ?? {};

    return {
      site_name: d.site_name || FALLBACK_SETTINGS.site_name,
      site_tagline: d.site_tagline || FALLBACK_SETTINGS.site_tagline,
      contact_phone: d.contact_phone ?? null,
      contact_email: d.contact_email ?? null,
      contact_address: d.contact_address ?? null,
    };
  } catch {
    return FALLBACK_SETTINGS;
  }
}
