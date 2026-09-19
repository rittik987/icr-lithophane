import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy",
  description:
    "Free pan-India express shipping on all custom 3D lithophane orders. Handcrafted in 1–2 days, delivered in 3–5 days .",
  alternates: {
    canonical: "/shipping-policy",
  },
};

export default function ShippingPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
} 
