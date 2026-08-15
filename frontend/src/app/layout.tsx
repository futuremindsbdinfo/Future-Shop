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
    default: "Future Shop — শেরপুর ও বগুড়ার অনলাইন বাজার",
    template: "%s | Future Shop",
  },
  description:
    "Future Shop — শেরপুর ও বগুড়ার স্থানীয় সেরা বিক্রেতাদের পণ্য সরাসরি আপনার দরজায়। ঘরে বসেই সহজে অর্ডার করুন।",
  keywords: [
    "Future Shop",
    "Sherpur online shop",
    "Bogura ecommerce",
    "অনলাইন বাজার",
    "শেরপুর অনলাইন শপ",
    "বগুড়া অনলাইন শপ",
    "grocery",
    "daily essentials",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Future Shop — শেরপুর ও বগুড়ার অনলাইন বাজার",
    description:
      "Future Shop — শেরপুর ও বগুড়ার স্থানীয় সেরা বিক্রেতাদের পণ্য সরাসরি আপনার দরজায়।",
    url: siteUrl,
    siteName: "Future Shop",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Future Shop — শেরপুর ও বগুড়ার অনলাইন বাজার",
    description:
      "Future Shop — শেরপুর ও বগুড়ার স্থানীয় সেরা বিক্রেতাদের পণ্য সরাসরি আপনার দরজায়।",
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

  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
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
