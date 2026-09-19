import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Craftsmanship & Story",
  description:
    "Learn how ICR Custom Creations turns cherished memories into handcrafted 3D photo lithophanes using precision additive manufacturing, warm 2400K LEDs, and natural wooden frames.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Our Craftsmanship & Story | ICR Custom Creations",
    description:
      "Learn how ICR Custom Creations turns cherished memories into handcrafted 3D photo lithophanes in natural wooden frames.",
    url: "https://www.icrcustomcreations.in/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
