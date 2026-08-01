import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local Laravel backend on port 8000 (public disk: /storage/...)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      // Production Laravel API
      {
        protocol: "https",
        hostname: "api.fuminds.com",
        pathname: "/storage/**",
      },
      // Cloudflare R2 (kept for flexibility; not in active use)
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      // Cloudflare R2 Public Domain
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      // Production self-hosted images (VPS) — uncomment and set the real domain
      // once live. https-only. External URL images are rendered via the next/image
      // `unoptimized` prop instead, so no broad wildcard host is needed here.
      // {
      //   protocol: "https",
      //   hostname: "YOUR_VPS_DOMAIN",
      //   pathname: "/storage/**",
      // },
    ],
    // Allow SVG (be careful: only enable if you trust your image sources)
    dangerouslyAllowSVG: true,
    // Next 16: allow private IPs (the optimizer normally rejects them as a
    // security measure). Needed for localhost backend images in production.
    dangerouslyAllowLocalIP: true,
    // Skip the optimizer entirely in dev to avoid the "upstream image resolved
    // to private ip localhost" 400 error during local development.
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
