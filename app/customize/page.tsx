"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TEMPLATES, getDefaultTemplate, getTemplateById } from "@/lib/templates";
import { buildCartItemPayload, addToCart } from "@/lib/cart";
import { useToast } from "@/context/ToastContext";
import CustomizeHeader from "@/components/customize/CustomizeHeader";
import TemplateSelector from "@/components/customize/TemplateSelector";
import TemplateBottomSheet from "@/components/customize/TemplateBottomSheet";
import UploadSlots from "@/components/customize/UploadSlots";
import TextFields from "@/components/customize/TextFields";
import StickyOrderBar from "@/components/customize/StickyOrderBar";

// Konva is client-only — lazy load so it never runs on server
const PreviewModal = dynamic(
  () => import("@/components/customize/PreviewModal"),
  { ssr: false }
);

export default function CustomizePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const defaultTemplate = getDefaultTemplate();

  const [selectedId, setSelectedId] = useState(defaultTemplate.id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
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
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      const payload = await buildCartItemPayload(
        template,
        uploadedFiles,
        textValues,
        customPreviewUrl
      );
      addToCart(payload);
      showToast({
        title: "Added to your Bag!",
        message: `${template.name} · ₹2,999`,
        type: "success",
        action: {
          label: "View Bag",
          href: "/cart",
        },
      });
    } catch (err) {
      console.error("Failed to add to bag:", err);
      alert("Could not add to bag. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  }

  async function handlePlaceOrder(customPreviewUrl?: string) {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);
    try {
      const payload = await buildCartItemPayload(
        template,
        uploadedFiles,
        textValues,
        customPreviewUrl
      );
      addToCart(payload);
      router.push("/checkout");
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Something went wrong preparing your order. Please try again.");
      setIsPlacingOrder(false);
    }
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
          onChoose={() => setSheetOpen(true)}
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

        {/* Preview and Add to Bag buttons — appear once all slots are filled */}
        {isOrderReady && (
          <div className="flex flex-col gap-3">
            {/* Preview button */}
            <button
              onClick={() => setPreviewOpen(true)}
              className="relative w-full overflow-hidden rounded-xl flex items-center gap-4 px-5 py-4 transition-all duration-200 active:scale-[0.98] group"
              style={{
                background: "linear-gradient(135deg, #fdf3e8 0%, #f5e6cc 100%)",
                border: "1.5px solid rgba(224,122,40,0.35)",
                boxShadow: "0 2px 12px rgba(224,122,40,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
              }}
            >
              {/* Eye icon circle */}
              <div
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{ background: "linear-gradient(135deg, #e07a28 0%, #c96a1e 100%)" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="10" r="2.5" stroke="white" strokeWidth="1.6"/>
                </svg>
              </div>

              {/* Text block */}
              <div className="flex flex-col items-start gap-0.5 flex-1">
                <span
                  className="text-[#2e1e12] font-bold text-[15px] leading-none"
                  style={{ fontFamily: "var(--font-family-sans)" }}
                >
                  Preview How It Looks
                </span>
                <span
                  className="text-[#6e5c50] text-[11px] leading-none"
                  style={{ fontFamily: "var(--font-family-sans)" }}
                >
                  See your lithophane before ordering
                </span>
              </div>

              {/* Arrow */}
              <svg
                className="shrink-0 text-[#e07a28] transition-transform duration-200 group-hover:translate-x-0.5"
                width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"
              >
                <path d="M4 9h10M9 4l5 5-5 5" stroke="#e07a28" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Add to Cart button — directly below preview button */}
            <button
              onClick={() => handleAddToCart()}
              disabled={isAddingToCart}
              className="relative w-full overflow-hidden rounded-xl flex items-center justify-center gap-3 px-5 py-3.5 transition-all duration-200 active:scale-[0.98] border-2 border-[#e07a28] bg-[#fff8f2] text-[#c96a1e] hover:bg-[#fae8d4] font-bold text-[15px] font-sans shadow-sm"
            >
              {isAddingToCart ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-[#c96a1e]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Adding to Bag...</span>
                </div>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M4 5V3a4 4 0 018 0v2M2 5h12l-1 11H3L2 5z" stroke="#c96a1e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>
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
        onPlaceOrder={() => handlePlaceOrder()}
        loading={isPlacingOrder}
      />
    </div>
  );
}
