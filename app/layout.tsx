import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
