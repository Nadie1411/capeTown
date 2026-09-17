import type { NextConfig } from "next";
import path from "node:path";

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  skipTrailingSlashRedirect: true,
  serverExternalPackages: ["sharp", "@prisma/client", "bcryptjs"],
  images: { unoptimized: true },
  poweredByHeader: false,
  devIndicators: false,
  turbopack: { root: path.resolve(process.cwd()) },
  outputFileTracingRoot: path.resolve(process.cwd()),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
