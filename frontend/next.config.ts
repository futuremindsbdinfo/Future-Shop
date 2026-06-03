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
      // Cloudflare R2 (when images move there later)
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
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
