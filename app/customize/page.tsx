import { productApi } from "@/lib/api";
import CustomizeView from "@/components/customize/CustomizeView";

export const dynamic = "force-dynamic";

export default async function CustomizePage() {
  const product = await productApi.getActiveProduct();
  return <CustomizeView initialProduct={product} />;
}
