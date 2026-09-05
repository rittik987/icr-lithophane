import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customise Your Lithophane — ICR Custom Creations",
  description: "Choose your template, upload your photos and personalise your lithophane lamp.",
};

/** Segment layout — inherits root html/body, overrides title/meta only */
export default function CustomizeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
