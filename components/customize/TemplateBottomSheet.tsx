"use client";

import { Drawer } from "vaul";
import { TemplateConfig } from "@/lib/templates";

interface TemplateBottomSheetProps {
  open: boolean;
  onClose: () => void;
  templates: TemplateConfig[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function LayoutThumb({ template }: { template: TemplateConfig }) {
  if (template.kind === "free") {
    return (
      <div className="relative w-full aspect-[4/3] bg-[#fffdf8] border-b border-[#e5ddd0]">
        <div className="absolute inset-3 border border-dashed border-[#c9b99f] rounded-sm flex items-center justify-center">
          <span className="text-[#c9b99f] text-[11px] font-sans font-semibold">Anywhere</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3] bg-[#f2ebdc] border-b border-[#e5ddd0]">
      {template.photoSlots.map((slot) => (
        <div
          key={slot.id}
          className="absolute bg-[#fffdf8] border border-dashed border-[#d47124] flex items-center justify-center"
          style={{
            left: `${(slot.x / template.canvasW) * 100}%`,
            top: `${(slot.y / template.canvasH) * 100}%`,
            width: `${(slot.w / template.canvasW) * 100}%`,
            height: `${(slot.h / template.canvasH) * 100}%`,
          }}
        >
          <span className="w-4 h-4 rounded-full bg-white border border-[#f3d2b0] flex items-center justify-center">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#d47124" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </span>
        </div>
      ))}
      {template.textFields.map((field) => (
        <div
          key={field.id}
          className="absolute bg-[#c9a27a] rounded-full opacity-70"
          style={{
            left: field.align === "center" ? "18%" : `${(field.x / template.canvasW) * 100}%`,
            top: `${(field.y / template.canvasH) * 100}%`,
            width: field.align === "center" ? "64%" : "28%",
            height: "5%",
          }}
        />
      ))}
    </div>
  );
}

export default function TemplateBottomSheet({
  open,
  onClose,
  templates,
  selectedId,
  onSelect,
}: TemplateBottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content
          className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 flex-col bg-[#faf7f2] rounded-t-2xl border-t border-[#e5ddd0] shadow-2xl max-h-[80vh]"
          style={{ outline: "none" }}
        >
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-10 h-1 bg-[#c9b99f] rounded-full" />
          </div>

          <div className="px-5 pb-3 border-b border-[#e5ddd0] shrink-0">
            <h2
              className="text-[#2e1e12] text-[18px] font-semibold"
              style={{ fontFamily: "var(--font-family-serif)" }}
            >
              Pick a ready design
            </h2>
            <p className="text-[#6e5c50] text-[13px] font-sans mt-0.5">
              Empty boxes are for photos. Tap a box, then crop to fit.
            </p>
          </div>

          <div className="overflow-y-auto flex-1 px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              {templates.map((t) => {
                const isSelected = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelect(t.id)}
                    className={`relative flex flex-col rounded-sm overflow-hidden border-2 text-left transition-all active:scale-[0.97] ${
                      isSelected
                        ? "border-[#e07a28] shadow-[0_0_0_3px_rgba(224,122,40,0.12)]"
                        : "border-[#e5ddd0] hover:border-[#c9b99f]"
                    }`}
                  >
                    <LayoutThumb template={t} />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-[#e07a28] rounded-full flex items-center justify-center shadow-md">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    <div className="px-3 py-2.5 bg-white flex flex-col gap-0.5">
                      <p className="text-[#2e1e12] text-[13px] font-semibold font-sans truncate">{t.shortLabel}</p>
                      <p className="text-[#6e5c50] text-[11px] font-sans">{t.occasion}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="h-6" />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
