import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import CapacitorInit from "@/components/CapacitorInit";
import PullToRefresh from "@/components/PullToRefresh";
import ReferralTracker from "@/components/ReferralTracker";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ICR Custom Creations — Personalised Lithophane Lamps",
  description:
    "Transform your cherished photograph into a handcrafted walnut-framed lithophane lamp. Free pan-India delivery. ₹2,999 all-inclusive.",
  openGraph: {
    title: "ICR Custom Creations — Personalised Lithophane Lamps",
    description:
      "Heirloom-quality 3D-carved photo lamps in solid walnut. Free pan-India delivery.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ToastProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <ReferralTracker />
            </Suspense>
            <CapacitorInit />
            <PullToRefresh>{children}</PullToRefresh>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
