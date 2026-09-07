"use client";

import { TemplateConfig } from "@/lib/templates";
import Image from "next/image";
import { ASSETS } from "@/lib/assets";

interface TemplateSelectorProps {
  template: TemplateConfig;
  onChoose: () => void;
}

export default function TemplateSelector({ template, onChoose }: TemplateSelectorProps) {
  return (
    <div className="bg-white border border-[#e5ddd0] rounded-2xl overflow-hidden shadow-sm mt-4">

      {/* Template info */}
      <div className="flex items-center gap-4 px-4 pt-4 pb-3">
        {/* Thumbnail */}
        <div className="w-20 h-16 rounded-xl bg-[#f2ebdc] border border-[#e5ddd0] flex items-center justify-center shrink-0 overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={template.thumbnailSrc}
            alt={template.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
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
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {/* Selected dot + label */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1e7234] shrink-0" />
            <span className="text-[#1e7234] text-[11px] font-bold tracking-[0.1em] uppercase font-sans">
              Selected Template
            </span>
          </div>
          {/* Template name */}
          <p className="text-[#2e1e12] text-[16px] font-semibold font-sans truncate">
            {template.name}
          </p>
          {/* Slot count */}
          <p className="text-[#6e5c50] text-[12px] font-sans">
            {template.photoSlots.length} photo{template.photoSlots.length > 1 ? "s" : ""}
            {template.textFields.length > 0
              ? ` · ${template.textFields.length} text field${template.textFields.length > 1 ? "s" : ""}`
              : ""}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#e5ddd0] mx-4" />

      {/* Choose Another Template — same style as Customize & Order CTA */}
      <div className="px-4 pt-3 pb-4">
        <button
          onClick={onChoose}
          style={{ backgroundColor: "#e07a28" }}
          className="w-full hover:bg-[#c96a1f] active:bg-[#b85d1a] flex items-center justify-center gap-2 py-3 rounded-xl shadow-md transition-all"
        >
          <span
            className="font-bold font-sans uppercase whitespace-nowrap"
            style={{ color: "#ffffff", fontSize: "13px", letterSpacing: "0.06em" }}
          >
            Choose Another Template
          </span>
          <div className="relative w-3 h-3 shrink-0">
            <Image
              src={ASSETS.iconArrow}
              alt=""
              fill
              sizes="12px"
              style={{ filter: "brightness(0) invert(1)" }}
              className="object-contain"
              unoptimized
            />
          </div>
        </button>
      </div>
    </div>
  );
}
