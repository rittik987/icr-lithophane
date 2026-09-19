import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Photo Confidentiality Policy",
  description:
    "We treat your personal memories with strict confidentiality. Customer photos are used solely for 3D lithophane fabrication and deleted after production. Zero third-party sharing.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
