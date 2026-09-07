import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the local network IP to receive HMR updates when testing on a
  // physical device (Android / iOS) connected to the same Wi-Fi as the dev machine.
  allowedDevOrigins: ["192.168.1.7"],

  images: {
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

