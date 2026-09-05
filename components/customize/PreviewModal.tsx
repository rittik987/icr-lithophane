"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Stage as StageType } from "konva/lib/Stage";
import { TemplateConfig } from "@/lib/templates";

// PreviewCanvas uses react-konva — must be client-only, no SSR
const PreviewCanvas = dynamic(() => import("./PreviewCanvas"), { ssr: false });

interface PreviewModalProps {
  template: TemplateConfig;
  uploadedFiles: Record<string, File>;
  textValues: Record<string, string>;
  onClose: () => void;
  onContinue: (previewUrl?: string) => void;
  onAddToCart?: (previewUrl?: string) => Promise<void> | void;
}

export default function PreviewModal({
  template,
  uploadedFiles,
  textValues,
  onClose,
  onContinue,
  onAddToCart,
}: PreviewModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const stageRef = useRef<StageType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(340);

  // Measure container on mount and resize
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function getExportDataUrl(): string {
    if (!stageRef.current) return "";
    try {
      return stageRef.current.toDataURL({ pixelRatio: template.canvasW / containerWidth });
    } catch (e) {
      console.warn("Failed to export stage canvas:", e);
      return "";
    }
  }

  function handleDownload() {
    const dataUrl = getExportDataUrl();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `lithophane-preview-${template.id}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function handleAddToCart() {
    if (!onAddToCart || isAdding) return;
    setIsAdding(true);
    try {
      const dataUrl = getExportDataUrl();
      await onAddToCart(dataUrl);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } finally {
      setIsAdding(false);
    }
  }

  function handleContinue() {
    const dataUrl = getExportDataUrl();
    onContinue(dataUrl);
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Lithophane preview"
    >
      <div className="w-full max-w-lg bg-[#faf7f2] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5ddd0] shrink-0">
          <div>
            <h2
              className="text-[#2e1e12] text-[17px] font-semibold"
              style={{ fontFamily: "var(--font-family-serif)" }}
            >
              Preview
            </h2>
            <p className="text-[#6e5c50] text-[11px] font-sans mt-0.5">{template.name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f2ebdc] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="#2e1e12" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Canvas preview — scrollable on small screens */}
        <div className="overflow-y-auto flex-1 p-4">
          <div
            ref={containerRef}
            className="w-full rounded-xl overflow-hidden border border-[#e5ddd0] shadow-md"
            style={{ background: "#fffdf8" }}
          >
            {containerWidth > 0 && (
              <PreviewCanvas
                template={template}
                uploadedFiles={uploadedFiles}
                textValues={textValues}
                stageRef={stageRef}
                containerWidth={containerWidth}
              />
            )}
          </div>

          <p className="text-center text-[#6e5c50] text-[11px] font-sans mt-3">
            This is an approximate preview. Actual lithophane may vary slightly.
          </p>
        </div>

        {/* Action buttons */}
        <div className="px-4 py-4 border-t border-[#e5ddd0] flex flex-col gap-2.5 shrink-0">
          {/* Download & Add to Bag in a grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Download */}
            <button
              onClick={handleDownload}
              style={{ color: "#2e1e12" }}
              className="border-2 border-[#e5ddd0] rounded-xl py-3 font-semibold font-sans text-[13px] flex items-center justify-center gap-1.5 hover:border-[#c9b99f] hover:bg-[#f2ebdc] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v8M8 10l-3-3M8 10l3-3" stroke="#2e1e12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13h12" stroke="#2e1e12" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Download
            </button>

            {/* Add to Bag */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`border-2 rounded-xl py-3 font-semibold font-sans text-[13px] flex items-center justify-center gap-1.5 transition-all ${
                addedSuccess
                  ? "border-[#1e7234] bg-[#eaf5ed] text-[#1e7234]"
                  : "border-[#e07a28] bg-[#fff6ed] text-[#c96a1e] hover:bg-[#fae8d4]"
              }`}
            >
              {isAdding ? (
                <span className="text-[12px]">Saving...</span>
              ) : addedSuccess ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5L6.5 12L13 4" stroke="#1e7234" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Added to Bag!
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M4 5V3a4 4 0 018 0v2M2 5h12l-1 9H3L2 5z" stroke="#c96a1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Add to Bag
                </>
              )}
            </button>
          </div>

          {/* Continue with booking / checkout */}
          <button
            onClick={handleContinue}
            style={{ backgroundColor: "#e07a28", color: "#ffffff" }}
            className="w-full rounded-xl py-3.5 font-bold font-sans text-[15px] flex items-center justify-center gap-2 hover:bg-[#c96a1e] active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(224,122,40,0.35)]"
          >
            Continue with Booking
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 8h8M8 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
