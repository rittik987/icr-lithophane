"use client";

import { useEffect, useState } from "react";
import { TemplateConfig } from "@/lib/templates";
import type { SceneObject } from "@/lib/canvasScene";
import { generateLithophanePreview, generateScenePreview } from "@/lib/exportPreview";
import LampViewer from "@/components/customize/LampViewer";

interface PreviewModalProps {
  template: TemplateConfig;
  uploadedFiles: Record<string, File>;
  textValues: Record<string, string>;
  onClose: () => void;
  onContinue: (previewUrl?: string) => void;
  onAddToCart?: (previewUrl?: string) => Promise<void> | void;
  sceneObjects?: SceneObject[];
}

export default function PreviewModal({
  template,
  uploadedFiles,
  textValues,
  onClose,
  onContinue,
  onAddToCart,
  sceneObjects,
}: PreviewModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [printUrl, setPrintUrl] = useState("");
  const [lit, setLit] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let gone = false;
    const job = sceneObjects?.length
      ? generateScenePreview(sceneObjects)
      : generateLithophanePreview(template, uploadedFiles, textValues);
    job
      .then((url) => {
        if (!gone) setPrintUrl(url);
      })
      .catch(() => {
        if (!gone) setFailed(true);
      });
    return () => {
      gone = true;
    };
  }, [sceneObjects, template, uploadedFiles, textValues]);

  async function handleAddToCart() {
    if (!onAddToCart || isAdding) return;
    setIsAdding(true);
    try {
      await onAddToCart(printUrl);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } finally {
      setIsAdding(false);
    }
  }

  function handleDownload() {
    if (!printUrl) return;
    const link = document.createElement("a");
    link.download = `lithophane-preview-${template.id}.png`;
    link.href = printUrl;
    link.click();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="How the lamp will look"
    >
      <div className="w-full max-w-lg bg-[#faf7f2] rounded-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5ddd0] shrink-0">
          <div>
            <h2
              className="text-[#2e1e12] text-[17px] font-semibold"
              style={{ fontFamily: "var(--font-family-serif)" }}
            >
              Your lamp
            </h2>
            <p className="text-[#6e5c50] text-[11px] font-sans mt-0.5">
              Hold and turn. Only the photo lights up.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-[#f2ebdc] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="#2e1e12" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
          {failed ? (
            <p className="text-center text-[13px] text-[#A82525] font-sans py-10">
              The lamp preview could not be made. Close and try again.
            </p>
          ) : printUrl ? (
            <LampViewer imageUrl={printUrl} lit={lit} />
          ) : (
            <div className="h-80 rounded-sm bg-[#efe4d2] flex items-center justify-center text-[13px] text-[#6e5c50] font-sans">
              Making your lamp…
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLit(false)}
              className={`h-12 rounded-sm text-[14px] font-semibold font-sans cursor-pointer ${
                !lit
                  ? "bg-[#c96a1e] text-white"
                  : "bg-white border border-[#e5ddd0] text-[#6e5c50]"
              }`}
            >
              Light Off
            </button>
            <button
              type="button"
              onClick={() => setLit(true)}
              className={`h-12 rounded-sm text-[14px] font-semibold font-sans cursor-pointer ${
                lit
                  ? "bg-[#c96a1e] text-white"
                  : "bg-white border border-[#e5ddd0] text-[#6e5c50]"
              }`}
            >
              Light On
            </button>
          </div>

          <p className="text-center text-[#6e5c50] text-[11px] font-sans">
            Wooden laminate frame. Light off is the white carving. Light on is the warm glow.
          </p>
        </div>

        <div className="px-4 py-4 border-t border-[#e5ddd0] flex flex-col gap-2.5 shrink-0">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDownload}
              style={{ color: "#2e1e12" }}
              className="border-2 border-[#e5ddd0] rounded-sm py-3 font-semibold font-sans text-[13px] flex items-center justify-center gap-1.5 hover:border-[#c9b99f] hover:bg-[#f2ebdc] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v8M8 10l-3-3M8 10l3-3" stroke="#2e1e12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13h12" stroke="#2e1e12" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Download
            </button>

            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`border-2 rounded-sm py-3 font-semibold font-sans text-[13px] flex items-center justify-center gap-1.5 transition-all ${
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
                    <path d="M3 8.5L6.5 12L13 4" stroke="#1e7234" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Added to Cart!
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M4 5V3a4 4 0 018 0v2M2 5h12l-1 9H3L2 5z" stroke="#c96a1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => onContinue(printUrl)}
            style={{ backgroundColor: "#e07a28", color: "#ffffff" }}
            className="w-full rounded-sm py-3.5 font-bold font-sans text-[15px] flex items-center justify-center gap-2 hover:bg-[#c96a1e] active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(224,122,40,0.35)] cursor-pointer"
          >
            Buy Now
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 8h8M8 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
