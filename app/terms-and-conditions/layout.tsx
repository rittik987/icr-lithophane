import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Official terms and conditions for orders, personalized 3D manufacturing, payments, and delivery at ICR Custom Creations.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
