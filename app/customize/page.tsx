import type { Metadata } from "next";
import { productApi } from "@/lib/api";
import CustomizeView from "@/components/customize/CustomizeView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Online 3D Lithophane Creator & Previewer",
  description:
    "Upload your favorite photo to crop, rotate, and preview in high-detail 3D lithophane with warm ambient light. Handcrafted wooden frame with free pan-India delivery.",
  alternates: {
    canonical: "/customize",
  },
  openGraph: {
    title: "Online 3D Lithophane Creator & Previewer | ICR Custom Creations",
    description:
      "Upload your photo to crop, position, and preview in realistic illuminated 3D lithophane before ordering.",
    url: "https://www.icrcustomcreations.in/customize",
  },
};

export default async function CustomizePage() {
  const product = await productApi.getActiveProduct();
  return <CustomizeView initialProduct={product} />;
}
