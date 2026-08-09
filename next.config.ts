import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove the X-Powered-By: Next.js fingerprinting header
  poweredByHeader: false,

  images: {
    // Prefer AVIF then WebP for significantly smaller file sizes
    formats: ["image/avif", "image/webp"],
    // Standard responsive breakpoints aligned with Tailwind's defaults
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
