"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { TEMPLATES, getDefaultTemplate, getTemplateById } from "@/lib/templates";
import { buildCartItemPayload, addToCart } from "@/lib/cart";
import { productApi, StorefrontProduct } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import CustomizeHeader from "@/components/customize/CustomizeHeader";
import TemplateSelector from "@/components/customize/TemplateSelector";
import TemplateBottomSheet from "@/components/customize/TemplateBottomSheet";
import UploadSlots from "@/components/customize/UploadSlots";
import TextFields from "@/components/customize/TextFields";
import StickyOrderBar from "@/components/customize/StickyOrderBar";
import { CustomizeSkeleton } from "@/components/Skeleton";

// Konva is client-only — lazy load so it never runs on server
const PreviewModal = dynamic(
  () => import("@/components/customize/PreviewModal"),
  { ssr: false }
);

interface CustomizeViewProps {
  initialProduct?: StorefrontProduct | null;
}

export default function CustomizeView({ initialProduct }: CustomizeViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isLoading } = useAuth();

  // Client guard: redirect to login if unauthenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login?redirect=/customize");
    }
  }, [isLoading, user, router]);

  // Handle pull-to-refresh
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  useEffect(() => {
    function handlePullRefresh() {
      setIsPullRefreshing(true);
      setTimeout(() => {
        setIsPullRefreshing(false);
      }, 700);
    }
    window.addEventListener("app:pulled-to-refresh", handlePullRefresh);
    return () => window.removeEventListener("app:pulled-to-refresh", handlePullRefresh);
  }, []);

  const [product, setProduct] = useState<StorefrontProduct | null>(initialProduct || null);

  useEffect(() => {
    productApi
      .getActiveProduct()
      .then((prod) => {
        if (prod) setProduct(prod);
      })
      .catch((err) => {
        console.error("Failed to load active product on customize:", err);
      });
  }, []);

  const sellingPrice =
    product?.sellingPrice !== undefined
      ? Math.round(product.sellingPrice / 100)
      : 2999;
  const mrp =
    product?.mrp !== undefined ? Math.round(product.mrp / 100) : 4999;

  const [selectedId, setSelectedId] = useState<string>(
    getDefaultTemplate().id
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // uploadedFiles maps slot.id -> File
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});

  // textValues maps field.id -> string
  const [textValues, setTextValues] = useState<Record<string, string>>({});

  // Loading states
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const template = getTemplateById(selectedId);

  // Re-initialise text defaults whenever template changes
  useEffect(() => {
    const defaults: Record<string, string> = {};
    template.textFields.forEach((f) => {
      defaults[f.id] = f.defaultValue;
    });
    setTextValues(defaults);
    setUploadedFiles({});
  }, [template.id]);

  const isOrderReady = useMemo(
    () => template.photoSlots.every((slot) => !!uploadedFiles[slot.id]),
    [template.photoSlots, uploadedFiles]
  );

  const uploadedCount = Object.keys(uploadedFiles).length;

  function handleTemplateSelect(id: string) {
    setSelectedId(id);
    setSheetOpen(false);
  }

  function handleUpload(slotId: string, file: File) {
    setUploadedFiles((prev) => ({ ...prev, [slotId]: file }));
  }

  function handleRemove(slotId: string) {
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }

  function handleTextChange(fieldId: string, value: string) {
    setTextValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleAddToCart(customPreviewUrl?: string) {
    if (!user) {
      router.push("/login?redirect=/customize");
      return;
    }
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      const payload = await buildCartItemPayload(
        template,
        uploadedFiles,
        textValues,
        customPreviewUrl,
        { sellingPrice, mrp }
      );
      addToCart(payload);
      showToast({
        title: "Added to your Cart!",
        message: `${template.name} · ₹${sellingPrice.toLocaleString("en-IN")}`,
        type: "success",
        action: {
          label: "View Cart",
          href: "/cart",
        },
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Could not add to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  }

  async function handlePlaceOrder(customPreviewUrl?: string) {
    if (!user) {
      router.push("/login?redirect=/customize");
      return;
    }
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);
    try {
      const payload = await buildCartItemPayload(
        template,
        uploadedFiles,
        textValues,
        customPreviewUrl,
        { sellingPrice, mrp }
      );
      addToCart(payload);
      router.push("/checkout");
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Something went wrong preparing your order. Please try again.");
      setIsPlacingOrder(false);
    }
  }

  if (isLoading || !user || isPullRefreshing) {
    return <CustomizeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Fixed header */}
      <CustomizeHeader />

      {/* Scrollable body */}
      <main className="pt-16 pb-28 px-4 max-w-lg mx-auto flex flex-col gap-6 lg:max-w-2xl lg:px-8">

        {/* Template selector card */}
        <TemplateSelector
          template={template}
          onChoose={() => setSheetOpen((prev) => !prev)}
          sellingPrice={sellingPrice}
          mrp={mrp}
          isOpen={sheetOpen}
        />

        {/* Upload slots — rendered dynamically from template config */}
        <UploadSlots
          template={template}
          uploadedFiles={uploadedFiles}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />

        {/* Text fields — only shown if template has editable text */}
        {template.textFields.length > 0 && (
          <TextFields
            fields={template.textFields}
            values={textValues}
            onChange={handleTextChange}
          />
        )}

        {/* Clean Handcrafted Preview Button — appears once all photos are uploaded */}
        {isOrderReady && (
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            style={{ border: "1px solid #e5ddd0" }}
            className="w-full h-12 rounded-sm bg-white hover:border-[#d47124] hover:bg-[#fffbf7] active:scale-[0.99] text-[#2e1e12] hover:text-[#d47124] font-semibold text-[14px] font-sans flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#d47124]"
              aria-hidden="true"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Preview</span>
          </button>
        )}
      </main>

      {/* Template bottom sheet */}
      <TemplateBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        templates={TEMPLATES}
        selectedId={selectedId}
        onSelect={handleTemplateSelect}
      />

      {/* Preview modal — lazy loaded (Konva) */}
      {previewOpen && (
        <PreviewModal
          template={template}
          uploadedFiles={uploadedFiles}
          textValues={textValues}
          onClose={() => setPreviewOpen(false)}
          onAddToCart={(url) => handleAddToCart(url)}
          onContinue={(url) => {
            setPreviewOpen(false);
            handlePlaceOrder(url);
          }}
        />
      )}

      {/* Sticky bottom bar */}
      <StickyOrderBar
        isReady={isOrderReady}
        totalSlots={template.photoSlots.length}
        uploadedCount={uploadedCount}
        onAddToCart={() => handleAddToCart()}
        onBuyNow={() => handlePlaceOrder()}
        isAddingToCart={isAddingToCart}
        isPlacingOrder={isPlacingOrder}
      />
    </div>
  );
}
