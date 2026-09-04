"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ASSETS } from "@/lib/assets";

interface PriceBlockProps {
  onOrder?: (file: File | null) => void;
}

export default function PriceBlock({ onOrder }: PriceBlockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    setSelectedFile(file);
  };

  return (
    <div className="bg-white border border-[#e5ddd0] rounded-xl p-4 flex flex-col gap-4 shadow-sm w-full">
      {/* Pricing row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2 leading-none">
            <span className="text-[#2e1e12] text-[28px] font-bold leading-none font-serif">
              ₹2,999
            </span>
            <span className="text-[#6e5c50] text-sm line-through font-sans">
              MRP ₹4,999
            </span>
          </div>
          <p className="text-[#6e5c50] text-[11px] font-medium mt-1 font-sans">
            All taxes &amp; pan-India courier included
          </p>
        </div>

        {/* Discount badge */}
        <div className="bg-[#eaf5ec] border border-[#c6e6ca] rounded px-3 py-1.5 shrink-0">
          <span className="text-[#1e7234] text-xs font-bold tracking-wider uppercase font-sans">
            SAVE 40% OFF
          </span>
        </div>
      </div>

      {/* Photo upload box */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload your photo"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`bg-[#faf7f2] border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-2.5 cursor-pointer transition-colors ${
          isDragging
            ? "border-[#e07a28] bg-[#fdf3e8]"
            : "border-[rgba(224,122,40,0.5)] hover:border-[#e07a28] hover:bg-[#fdf3e8]"
        }`}
      >
        {/* Upload icon */}
        <div className="bg-[#f2ebdc] border border-[#e5ddd0] rounded-full w-12 h-12 flex items-center justify-center shadow-sm shrink-0">
          <div className="relative w-5 h-5">
            <Image
              src={ASSETS.iconUpload}
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>

        <div className="text-center">
          {selectedFile ? (
            <p className="text-[#2e1e12] text-[13px] font-semibold font-sans">
              ✓ {selectedFile.name}
            </p>
          ) : (
            <>
              <p className="text-[#2e1e12] text-[13px] font-semibold font-sans">
                Tap to Select Photo from Gallery
              </p>
              <p className="text-[#6e5c50] text-[11px] mt-0.5 font-sans">
                (JPEG, PNG, HEIC)
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.heic,.heif"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>

      {/* Primary CTA button - Orange background with white text */}
      <button
        onClick={() => onOrder?.(selectedFile)}
        style={{ backgroundColor: "#e07a28" }}
        className="w-full hover:bg-[#c96a1f] active:bg-[#b85d1a] rounded-lg flex items-center justify-center gap-2.5 px-5 py-4 shadow-md transition-all"
      >
        <div className="relative w-5 h-5 shrink-0">
          <Image
            src={ASSETS.iconCart}
            alt=""
            fill
            style={{ filter: "brightness(0) invert(1)" }}
            className="object-contain"
            unoptimized
          />
        </div>
        <span 
          className="font-semibold font-sans px-2 py-2"
          style={{ color: "#ffffff", fontSize: "15px", letterSpacing: "0.02em" }}
        >
          Upload Photo & Order
        </span>
      </button>

      {/* Trust line */}
      <div className="flex items-center justify-center gap-1.5 w-full">
        <div className="relative w-3 h-3 shrink-0">
          <Image
            src={ASSETS.iconShield}
            alt=""
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <p className="text-[#6e5c50] text-[11px] font-medium text-center leading-tight font-sans">
          100% Quality Guarantee • Free Pan-India Courier • Cash on Delivery
          Available
        </p>
      </div>
    </div>
  );
}
