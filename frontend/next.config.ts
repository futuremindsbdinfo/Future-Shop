import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local Laravel backend (public disk: http://localhost/storage/...)
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      // TODO: add the Cloudflare R2 / CDN hostname here when images move to R2.
    ],
  },
};

export default nextConfig;
