import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the local network IP to receive HMR updates when testing on a
  // physical device (Android / iOS) connected to the same Wi-Fi as the dev machine.
  allowedDevOrigins: ["192.168.1.7"],

  // Disable floating dev indicators that overlap navigation buttons on mobile
  devIndicators: false,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.figma.com",
      },
      {
        // Cloudinary images served from the backend uploads
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;

