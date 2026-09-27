import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Invoicing Policy",
  description:
    "Transparent pricing in Indian Rupees (INR) with inclusive taxes and zero hidden fees. Includes standard wooden frame, warm 2400K LED, DC adapter, and free pan-India shipping.",
  alternates: {
    canonical: "/pricing-policy",
  },
};

export default function PricingPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
