import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Support & Contact Us",
  description:
    "Have questions about photo suitability, order dispatch, or custom requests? Reach the ICR Custom Creations support team via WhatsApp, email, or ticketing.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Customer Support & Contact Us | ICR Custom Creations",
    description:
      "Direct customer support, WhatsApp assistance, and order inquiry for ICR Custom Creations.",
    url: "https://www.icrcustomcreations.in/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
