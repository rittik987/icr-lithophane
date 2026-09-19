import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description:
    "100% Quality Guarantee on all custom lithophanes. Free replacement or full refund for damaged items within 48 hours of delivery, plus a 2-hour grace period cancellation.",
  alternates: {
    canonical: "/cancellation-refund-policy",
  },
};

export default function CancellationRefundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
