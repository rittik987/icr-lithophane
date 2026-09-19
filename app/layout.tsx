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

const BASE_URL = "https://www.icrcustomcreations.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Personalised 3D Photo Lithophane with Wooden Frame | ICR Custom Creations",
    template: "%s | ICR Custom Creations",
  },
  description:
    "Turn your favorite photograph into a glowing 3D lithophane keepsake set in a handcrafted wooden frame. Perfect for anniversaries, birthdays & weddings. Free pan-India delivery.",
  keywords: [
    "custom 3d photo lamp",
    "personalized lithophane lamp india",
    "personalized anniversary gifts for couples",
    "custom photo light frame",
    "3d printed photo night light",
    "wooden frame photo lamp",
    "personalized wedding gifts",
    "custom night lamp with photo",
  ],
  authors: [{ name: "ICR Custom Creations", url: BASE_URL }],
  creator: "ICR Custom Creations",
  publisher: "ICR Custom Creations",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Personalised 3D Photo Lithophane with Wooden Frame | ICR Custom Creations",
    description:
      "Turn your favorite photograph into a glowing 3D lithophane keepsake set in a handcrafted wooden frame. Handcrafted with warm 3000K LED illumination. Free delivery across India.",
    url: BASE_URL,
    siteName: "ICR Custom Creations",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/photos/detail-proportion.jpg",
        width: 1200,
        height: 630,
        alt: "Personalised 3D Photo Lithophane with Wooden Frame on Bedside Nightstand",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Personalised 3D Photo Lithophane with Wooden Frame | ICR Custom Creations",
    description:
      "Turn your favorite photograph into a glowing 3D lithophane keepsake set in a handcrafted wooden frame. Free delivery across India.",
    images: ["/photos/detail-proportion.jpg"],
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
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
