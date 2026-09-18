"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import Image from "next/image";
import { ASSETS } from "@/lib/assets";

// Konva is client-only — lazy load so it never runs on server
const PreviewModal = dynamic(
  () => import("@/components/customize/PreviewModal"),
  { ssr: false }
);

// Desktop live preview canvas — also client-only (Konva)
const PreviewCanvas = dynamic(
  () => import("@/components/customize/PreviewCanvas"),
  { ssr: false }
);

interface CustomizeViewProps {
  initialProduct?: StorefrontProduct | null;
}

export default function CustomizeView({ initialProduct }: CustomizeViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();

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
    product?.mrp !== undefined ? Math.round(product.mrp / 100) : 2199;

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
      const createdItem = addToCart(payload);
      if (!user) {
        // Unauthenticated customer: Require login to save keepsake to customer account
        router.push(`/login?redirect=${encodeURIComponent(`/cart?added=${createdItem.id}`)}`);
        return;
      }
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
      const createdItem = addToCart(payload);
      if (!user) {
        // Item is securely saved in localStorage! Redirect to login and then return straight to checkout
        router.push(`/login?redirect=${encodeURIComponent(`/checkout?buyNow=${createdItem.id}`)}`);
        return;
      }
      router.push(`/checkout?buyNow=${encodeURIComponent(createdItem.id)}`);
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Something went wrong preparing your order. Please try again.");
      setIsPlacingOrder(false);
    }
  }

  // Desktop live preview: measure container width
  const desktopPreviewRef = useRef<HTMLDivElement>(null);
  const [desktopPreviewWidth, setDesktopPreviewWidth] = useState(0);
  // We also need a stageRef for the desktop preview export
  const desktopStageRef = useRef<import("konva/lib/Stage").Stage | null>(null);

  useEffect(() => {
    function measure() {
      if (desktopPreviewRef.current) {
        setDesktopPreviewWidth(desktopPreviewRef.current.clientWidth);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  if (isPullRefreshing) {
    return <CustomizeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Fixed header */}
      <CustomizeHeader />

      {/* ═══════════════════════════════════════════════════
          MOBILE LAYOUT (< lg) — single column, current flow
      ═══════════════════════════════════════════════════ */}
      <main className="pt-16 pb-28 px-4 max-w-lg mx-auto flex flex-col gap-6 lg:hidden">

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

      {/* ═══════════════════════════════════════════════════
          DESKTOP LAYOUT (lg+) — 2-column: preview left, controls right
      ═══════════════════════════════════════════════════ */}
      <main className="hidden lg:block pt-20 pb-12 px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-[55fr_45fr] gap-10 items-start">

          {/* ── LEFT COLUMN — Sticky Live Preview ── */}
          <div className="sticky top-[84px]">
            {/* Header / Title Label */}
            <div className="flex items-center justify-between mb-3 px-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e07a28] animate-pulse" />
                <h2 className="text-[#2e1e12] text-xs sm:text-sm font-bold tracking-wide uppercase font-sans">
                  Your Custom Lithophane
                </h2>
              </div>
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-colors ${
                  isOrderReady
                    ? "bg-[#eaf5ec] border-[#c6e6ca] text-[#1e7234]"
                    : "bg-[#f4ede2] border-[#e5ddd0] text-[#8c786a]"
                }`}
              >
                {isOrderReady ? "✓ Ready to Order" : "Live Preview"}
              </span>
            </div>

            <div
              ref={desktopPreviewRef}
              className="relative w-full rounded-xl overflow-hidden border border-[#e5ddd0] shadow-md transition-shadow hover:shadow-lg"
              style={{ background: "#fffdf8" }}
            >
              {desktopPreviewWidth > 0 && (
                <PreviewCanvas
                  template={template}
                  uploadedFiles={uploadedFiles}
                  textValues={textValues}
                  stageRef={desktopStageRef}
                  containerWidth={desktopPreviewWidth}
                />
              )}

              {/* Empty state guidance when no photos are uploaded yet */}
              {uploadedCount === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none bg-[#faf7f2]/60 backdrop-blur-[1px]">
                  <div className="w-12 h-12 rounded-full bg-white/90 border border-[#e5ddd0] flex items-center justify-center shadow-xs mb-3 text-[#e07a28]">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <p className="text-[#2e1e12] font-serif text-[16px] font-bold">
                    See Your Finished Lithophane Here
                  </p>
                  <p className="text-[#8c786a] text-[12px] font-sans max-w-xs mt-1 leading-relaxed">
                    Upload your {template.photoSlots.length === 1 ? "photo" : "photos"} on the right to preview your framed lithophane before placing your order.
                  </p>
                </div>
              )}
            </div>

            {/* Preview status text */}
            <p className="text-center text-[#8c786a] text-[11px] font-sans mt-3">
              {isOrderReady
                ? "✓ Live preview — this is how your lithophane will look"
                : `Upload ${template.photoSlots.length - uploadedCount} more photo${template.photoSlots.length - uploadedCount !== 1 ? "s" : ""} to see the full preview`}
            </p>
          </div>

          {/* ── RIGHT COLUMN — Controls & Actions ── */}
          <div className="flex flex-col gap-6">

            {/* Template selector card */}
            <TemplateSelector
              template={template}
              onChoose={() => setSheetOpen((prev) => !prev)}
              sellingPrice={sellingPrice}
              mrp={mrp}
              isOpen={sheetOpen}
            />

            {/* Upload slots */}
            <UploadSlots
              template={template}
              uploadedFiles={uploadedFiles}
              onUpload={handleUpload}
              onRemove={handleRemove}
            />

            {/* Text fields */}
            {template.textFields.length > 0 && (
              <TextFields
                fields={template.textFields}
                values={textValues}
                onChange={handleTextChange}
              />
            )}

            {/* ── Desktop Inline CTA Buttons ── */}
            <div className="flex flex-col gap-3 pt-2 border-t border-[#e5ddd0]">
              {/* Buy Now — primary */}
              <button
                type="button"
                disabled={!isOrderReady || isAddingToCart || isPlacingOrder}
                onClick={() => handlePlaceOrder()}
                className={`w-full h-13 rounded-sm font-bold font-sans text-[15px] flex items-center justify-center gap-2 transition-all shadow-md ${
                  isOrderReady && !isPlacingOrder && !isAddingToCart
                    ? "bg-[#e07a28] hover:bg-[#c96a1f] active:scale-[0.98] text-white cursor-pointer shadow-[0_4px_14px_rgba(224,122,40,0.32)]"
                    : "bg-[#c9b99f] text-white cursor-not-allowed opacity-60 shadow-none"
                }`}
                aria-label={isOrderReady ? "Buy now" : `Upload photos to order`}
              >
                {isPlacingOrder ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <span>Buy Now</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M4 8h8M8 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>

              {/* Add to Cart — secondary */}
              <button
                type="button"
                disabled={!isOrderReady || isAddingToCart || isPlacingOrder}
                onClick={() => handleAddToCart()}
                style={{
                  border: isOrderReady ? "1.5px solid #1a1412" : "1.5px solid #d5c7b3",
                }}
                className={`w-full h-12 rounded-sm font-semibold font-sans text-[14px] flex items-center justify-center gap-2 transition-all ${
                  isOrderReady && !isAddingToCart && !isPlacingOrder
                    ? "bg-transparent text-[#1a1412] hover:bg-[#1a1412]/5 active:scale-[0.98] cursor-pointer"
                    : "bg-transparent text-[#a89a8a] cursor-not-allowed opacity-50"
                }`}
                aria-label="Add custom lithophane to cart"
              >
                {isAddingToCart ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-[#1a1412]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Adding...</span>
                  </div>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {/* Trust line */}
              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-[#8c786a] font-sans">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c96a1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>100% Quality Guarantee · Free Delivery</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Template bottom sheet (mobile) / modal (desktop) */}
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

      {/* Sticky bottom bar (mobile only — has lg:hidden) */}
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

