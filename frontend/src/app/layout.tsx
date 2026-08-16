import type { Metadata } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import "@/lib/fontawesome";
import { Chrome } from "@/components/shared/Chrome";
import { AuthHydrator } from "@/components/shared/AuthHydrator";
import { CartHydrator } from "@/components/shared/CartHydrator";
import { WishlistHydrator } from "@/components/shared/WishlistHydrator";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hindSiliguri = Hind_Siliguri({
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-bengali",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shop.fuminds.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Future Shop — শেরপুর, বগুড়ার বিশ্বস্ত অনলাইন বাজার",
    template: "%s | Future Shop",
  },
  description:
    "Future Shop — শেরপুর, বগুড়ার সেরা স্থানীয় বিক্রেতাদের আসল পণ্য দ্রুততম সময়ে সরাসরি আপনার ঘরে। ক্যাশ অন ডেলিভারি ও সুলভ মূল্যে কেনাকাটা করুন।",
  keywords: [
    "Future Shop",
    "শেরপুর অনলাইন শপ",
    "বগুড়া অনলাইন শপ",
    "Sherpur online shop",
    "Bogura ecommerce",
    "শেরপুর বাজার",
    "অনলাইন মুদি বাজার",
    "Future Shop Sherpur",
    "daily essentials Bangladesh",
    "cash on delivery Sherpur",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Future Shop — শেরপুর, বগুড়ার বিশ্বস্ত অনলাইন বাজার",
    description:
      "শেরপুর, বগুড়ার সেরা স্থানীয় বিক্রেতাদের আসল পণ্য দ্রুততম সময়ে সরাসরি আপনার ঘরে। ক্যাশ অন ডেলিভারিতে অর্ডার করুন।",
    url: siteUrl,
    siteName: "Future Shop",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: `${siteUrl}/icon.png`,
        width: 512,
        height: 512,
        alt: "Future Shop Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Future Shop — শেরপুর, বগুড়ার বিশ্বস্ত অনলাইন বাজার",
    description:
      "শেরপুর, বগুড়ার সেরা স্থানীয় বিক্রেতাদের আসল পণ্য সরাসরি আপনার ঘরে।",
    images: [`${siteUrl}/icon.png`],
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "qZt00iOAvIAYN82n6USua6_Nriprwc644uiVMrEByaw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  // Structured Data (JSON-LD) for Google Search Engine Optimization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${siteUrl}/#store`,
    "name": settings.site_name || "Future Shop",
    "url": siteUrl,
    "logo": `${siteUrl}/icon.png`,
    "image": `${siteUrl}/icon.png`,
    "description": settings.site_tagline || "শেরপুর, বগুড়ার বিশ্বস্ত অনলাইন বাজার",
    "telephone": settings.contact_phone || "+8801813354648",
    "email": settings.contact_email || "futuremindsbd.info@gmail.com",
    "priceRange": "৳",
    "currenciesAccepted": "BDT",
    "paymentAccepted": "Cash, Cash On Delivery, bKash, Nagad, Credit Card, SSLCommerz",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Sannalpara, Behind Sonali bank Bus-stand",
      "addressLocality": "Sherpur",
      "addressRegion": "Bogura",
      "postalCode": "5840",
      "addressCountry": "BD",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "24.6741",
      "longitude": "89.4184",
    },
    "areaServed": [
      {
        "@type": "AdministrativeArea",
        "name": "Sherpur",
      },
      {
        "@type": "AdministrativeArea",
        "name": "Bogura",
      },
      {
        "@type": "Country",
        "name": "Bangladesh",
      },
    ],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <AuthHydrator />
        <CartHydrator />
        <WishlistHydrator />
        <Chrome settings={settings}>{children}</Chrome>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
