import type { Metadata } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import "@/lib/fontawesome";
import { Chrome } from "@/components/shared/Chrome";
import { AuthHydrator } from "@/components/shared/AuthHydrator";
import { CartHydrator } from "@/components/shared/CartHydrator";
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

export const metadata: Metadata = {
  title: "Future Shop — শেরপুর ও বগুড়ার অনলাইন বাজার",
  description:
    "Future Shop — local sellers from Sherpur & Bogura, delivered to your doorstep.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <AuthHydrator />
        <CartHydrator />
        <Chrome settings={settings}>{children}</Chrome>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
