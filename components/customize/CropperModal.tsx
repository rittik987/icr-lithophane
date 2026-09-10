"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImageFile, type PixelCrop } from "@/lib/cropImage";

interface CropperModalProps {
  imageSrc: string;
  /** Slot aspect ratio: slot.w / slot.h */
  aspectRatio: number;
  slotLabel: string;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function CropperModal({
  imageSrc,
  aspectRatio,
  slotLabel,
  onConfirm,
  onCancel,
}: CropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback(
    (_: unknown, cropPixels: PixelCrop) => {
      setCroppedAreaPixels(cropPixels);
    },
    []
  );

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const file = await getCroppedImageFile(imageSrc, croppedAreaPixels);
      onConfirm(file);
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-[#faf7f2] font-sans"
      role="dialog"
      aria-modal="true"
      aria-label={`Crop photo for ${slotLabel}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0 bg-[#faf7f2] border-b border-[#e5ddd0] shadow-xs">
        <button
          type="button"
          onClick={onCancel}
          className="text-[#6e5c50] hover:text-[#2e1e12] text-sm font-medium py-1.5 px-3 rounded-sm hover:bg-[#f2ebdc] transition-colors"
        >
          Cancel
        </button>

        <div className="flex flex-col items-center gap-0.5">
          <p className="text-[#2e1e12] text-sm sm:text-base font-bold leading-tight">
            Crop Photo
          </p>
          <p className="text-[#e07a28] text-[12px] font-semibold">
            {slotLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isProcessing || !croppedAreaPixels}
          className="text-xs font-semibold py-2 px-5 rounded-sm transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          style={{
            backgroundColor: "#e07a28",
            color: "#ffffff",
          }}
        >
          {isProcessing ? "Applying…" : "Apply"}
        </button>
      </div>

      {/* Cropper Viewport Stage */}
      <div className="relative flex-1 overflow-hidden bg-[#24170e]">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid
          style={{
            containerStyle: { backgroundColor: "#24170e" },
            cropAreaStyle: {
              border: "2px solid #e07a28",
              boxShadow: "0 0 0 9999px rgba(36, 23, 14, 0.72)",
            },
          }}
        />
      </div>

      {/* Bottom Zoom & Adjustment Controls */}
      <div className="shrink-0 bg-[#faf7f2] border-t border-[#e5ddd0] px-6 pt-4 pb-8 flex flex-col items-center gap-3 shadow-xs">
        <div className="flex items-center justify-between w-full max-w-xs text-xs">
          <span className="text-[#6e5c50] font-semibold text-[12px]">
            Zoom Photo
          </span>
          <span className="font-bold text-[#e07a28] bg-[#fdf3e7] border border-[#f3d3b0] px-2 py-0.5 rounded-full text-[11px]">
            {zoom.toFixed(1)}×
          </span>
        </div>

        <div className="flex items-center gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
            aria-label="Zoom out"
            className="w-8 h-8 rounded-sm bg-[#f2ebdc] border border-[#e5ddd0] text-[#5a3a1a] hover:bg-[#e8ded0] flex items-center justify-center font-bold text-base shrink-0 transition-colors shadow-2xs"
          >
            −
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#e07a28] h-2 bg-[#e5ddd0] rounded-lg cursor-pointer"
            aria-label="Zoom slider"
          />
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            aria-label="Zoom in"
            className="w-8 h-8 rounded-sm bg-[#f2ebdc] border border-[#e5ddd0] text-[#5a3a1a] hover:bg-[#e8ded0] flex items-center justify-center font-bold text-base shrink-0 transition-colors shadow-2xs"
          >
            +
          </button>
        </div>

        {/* Framing guidance */}
        <p className="text-[#8c786a] text-[11px] text-center">
          Drag to reposition • Crop fits the <span className="font-semibold text-[#4a3220]">{slotLabel}</span> frame
        </p>
      </div>
    </div>
  );
}
