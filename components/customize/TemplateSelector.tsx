"use client";

import { TemplateConfig } from "@/lib/templates";
import Image from "next/image";
import { ASSETS } from "@/lib/assets";

interface TemplateSelectorProps {
  template: TemplateConfig;
  onChoose: () => void;
  sellingPrice?: number;
  mrp?: number;
  isOpen?: boolean;
}

export default function TemplateSelector({
  template,
  onChoose,
  sellingPrice,
  mrp,
  isOpen = false,
}: TemplateSelectorProps) {
  return (
    <div className="bg-white border border-[#e5ddd0] rounded-sm overflow-hidden shadow-sm mt-4">

      {/* Template info */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Thumbnail */}
          <div className="w-16 h-14 rounded-sm bg-[#f2ebdc] border border-[#e5ddd0] flex items-center justify-center shrink-0 overflow-hidden relative">
            <Image
              src={template.thumbnailSrc}
              alt={template.name}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized={template.thumbnailSrc.startsWith("data:") || template.thumbnailSrc.endsWith(".svg") || template.thumbnailSrc.includes("figma.com")}
            />
            {/* Fallback */}
            <svg
              className="w-6 h-6 text-[#c9b99f] absolute"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
              <path d="M21 15l-5-5L5 21" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Name + meta */}
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            {/* Selected dot + label */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1e7234] shrink-0" />
              <span className="text-[#1e7234] text-[11px] font-semibold font-sans">
                Selected Template
              </span>
            </div>
            {/* Template name */}
            <p className="text-[#2e1e12] text-[15px] font-semibold font-sans truncate">
              {template.name}
            </p>
            {/* Slot count */}
            <p className="text-[#6e5c50] text-[11px] font-sans">
              {template.id === "custom-design"
                ? "20 × 15 cm · 8 × 6 in · Custom artwork"
                : `${template.photoSlots.length} photo${template.photoSlots.length > 1 ? "s" : ""}${
                    template.textFields.length > 0
                      ? ` · ${template.textFields.length} text field${template.textFields.length > 1 ? "s" : ""}`
                      : ""
                  }`}
            </p>
          </div>
        </div>

        {/* Price display */}
        {sellingPrice !== undefined && (
          <div className="flex flex-col items-end shrink-0 pl-2 text-right">
            <span className="text-[#2e1e12] text-[17px] font-bold font-sans leading-none">
              ₹{sellingPrice.toLocaleString("en-IN")}
            </span>
            {mrp && mrp > 0 ? (
              <span className="text-[#8a7b6e] text-[11px] line-through font-sans mt-0.5">
                ₹{mrp.toLocaleString("en-IN")}
              </span>
            ) : null}
            <span className="text-[#1e7234] text-[10px] font-semibold font-sans mt-0.5">
              Free Delivery
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#e5ddd0] mx-4" />

      {/* Choose Another Template — outlined border with chevron down */}
      <div className="px-4 pt-3 pb-4">
        <button
          type="button"
          onClick={onChoose}
          style={{ border: isOpen ? "1.5px solid #d47124" : "1.5px solid #e5ddd0" }}
          className={`w-full bg-white hover:bg-[#fffbf7] hover:border-[#d47124] active:scale-[0.99] flex items-center justify-center gap-2 py-2.5 rounded-sm shadow-2xs transition-all cursor-pointer group ${
            isOpen ? "bg-[#fffbf7]" : ""
          }`}
        >
          <span
            className={`font-semibold font-sans text-[14px] transition-colors whitespace-nowrap ${
              isOpen ? "text-[#d47124]" : "text-[#2e1e12] group-hover:text-[#d47124]"
            }`}
          >
            Choose Another Template
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            className={
              isOpen ? "text-[#d47124]" : "text-[#6e5c50] group-hover:text-[#d47124]"
            }
            aria-hidden="true"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
