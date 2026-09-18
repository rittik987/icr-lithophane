"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Drawer } from "vaul";
import { TemplateConfig } from "@/lib/templates";

interface TemplateBottomSheetProps {
  open: boolean;
  onClose: () => void;
  templates: TemplateConfig[];
  selectedId: string;
  onSelect: (id: string) => void;
}

// ─── Desktop Modal ─────────────────────────────────────────
function TemplateDesktopModal({
  open,
  onClose,
  templates,
  selectedId,
  onSelect,
}: TemplateBottomSheetProps) {
  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Choose your template"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-[#faf7f2] rounded-xl border border-[#e5ddd0] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e5ddd0] flex items-center justify-between shrink-0">
          <div>
            <h2
              className="text-[#2e1e12] text-[20px] font-semibold"
              style={{ fontFamily: "var(--font-family-serif)" }}
            >
              Choose Your Template
            </h2>
            <p className="text-[#6e5c50] text-[12px] font-sans mt-0.5">
              {templates.length} designs available
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f2ebdc] transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="#2e1e12" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Template grid — 3 columns on desktop */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="grid grid-cols-3 gap-4">
            {templates.map((t) => {
              const isSelected = t.id === selectedId;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelect(t.id)}
                  className={`relative flex flex-col rounded-lg overflow-hidden border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? "border-[#e07a28] shadow-[0_0_0_3px_rgba(224,122,40,0.12)]"
                      : "border-[#e5ddd0] hover:border-[#c9b99f]"
                  }`}
                >
                  {/* Template thumbnail */}
                  <div className="relative bg-[#f2ebdc] w-full" style={{ aspectRatio: "4/3" }}>
                    <Image
                      src={t.thumbnailSrc}
                      alt={t.name}
                      fill
                      sizes="200px"
                      className="object-cover"
                      unoptimized={t.thumbnailSrc.startsWith("data:") || t.thumbnailSrc.endsWith(".svg") || t.thumbnailSrc.includes("figma.com")}
                    />
                    {/* Fallback icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#c9b99f]" fill="none" viewBox="0 0 32 32" stroke="currentColor" aria-hidden="true">
                        <rect x="4" y="4" width="24" height="24" rx="3" strokeWidth="1.5" />
                        <circle cx="11" cy="11" r="2" strokeWidth="1.5" />
                        <path d="M28 20l-7-7L4 28" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>

                    {/* Selected check */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-[#e07a28] rounded-full flex items-center justify-center shadow-md">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Template info */}
                  <div className="px-3 py-2.5 bg-white flex flex-col gap-0.5">
                    <p className="text-[#2e1e12] text-[13px] font-semibold font-sans truncate">
                      {t.name}
                    </p>
                    <p className="text-[#6e5c50] text-[11px] font-sans">
                      {t.id === "custom-design"
                        ? "20 × 15 cm · 8 × 6 in"
                        : `${t.photoSlots.length} photo${t.photoSlots.length > 1 ? "s" : ""}${
                            t.textFields.length > 0 ? ` · ${t.textFields.length} text` : ""
                          }`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Bottom Sheet (vaul Drawer) ─────────────────────
function TemplateMobileSheet({
  open,
  onClose,
  templates,
  selectedId,
  onSelect,
}: TemplateBottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Drawer.Portal>
        {/* Backdrop */}
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />

        {/* Sheet */}
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[#faf7f2] rounded-t-2xl border-t border-[#e5ddd0] shadow-2xl max-h-[80vh]"
          style={{ outline: "none" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-10 h-1 bg-[#c9b99f] rounded-full" />
          </div>

          {/* Sheet header */}
          <div className="px-5 pb-3 border-b border-[#e5ddd0] shrink-0">
            <h2
              className="text-[#2e1e12] text-[18px] font-semibold"
              style={{ fontFamily: "var(--font-family-serif)" }}
            >
              Choose Your Template
            </h2>
            <p className="text-[#6e5c50] text-[12px] font-sans mt-0.5">
              {templates.length} designs available
            </p>
          </div>

          {/* Scrollable template grid */}
          <div className="overflow-y-auto flex-1 px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              {templates.map((t) => {
                const isSelected = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    className={`relative flex flex-col rounded-sm overflow-hidden border-2 text-left transition-all active:scale-[0.97] ${
                      isSelected
                        ? "border-[#e07a28] shadow-[0_0_0_3px_rgba(224,122,40,0.12)]"
                        : "border-[#e5ddd0] hover:border-[#c9b99f]"
                    }`}
                  >
                    {/* Template thumbnail */}
                    <div className="relative bg-[#f2ebdc] w-full" style={{ aspectRatio: "4/3" }}>
                      <Image
                        src={t.thumbnailSrc}
                        alt={t.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 200px"
                        className="object-cover"
                        unoptimized={t.thumbnailSrc.startsWith("data:") || t.thumbnailSrc.endsWith(".svg") || t.thumbnailSrc.includes("figma.com")}
                      />
                      {/* Fallback */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#c9b99f]" fill="none" viewBox="0 0 32 32" stroke="currentColor" aria-hidden="true">
                          <rect x="4" y="4" width="24" height="24" rx="3" strokeWidth="1.5" />
                          <circle cx="11" cy="11" r="2" strokeWidth="1.5" />
                          <path d="M28 20l-7-7L4 28" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* Selected check */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#e07a28] rounded-full flex items-center justify-center shadow-md">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Template info */}
                    <div className="px-3 py-2.5 bg-white flex flex-col gap-0.5">
                      <p className="text-[#2e1e12] text-[13px] font-semibold font-sans truncate">
                        {t.name}
                      </p>
                      <p className="text-[#6e5c50] text-[11px] font-sans">
                        {t.id === "custom-design"
                          ? "20 × 15 cm · 8 × 6 in"
                          : `${t.photoSlots.length} photo${t.photoSlots.length > 1 ? "s" : ""}${
                              t.textFields.length > 0 ? ` · ${t.textFields.length} text` : ""
                            }`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom safe area padding */}
            <div className="h-6" />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// ─── Responsive Wrapper ────────────────────────────────────
export default function TemplateBottomSheet(props: TemplateBottomSheetProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isDesktop) {
    return <TemplateDesktopModal {...props} />;
  }
  return <TemplateMobileSheet {...props} />;
}
