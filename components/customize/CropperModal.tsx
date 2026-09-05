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
      className="fixed inset-0 z-[60] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={`Crop photo for ${slotLabel}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <button
          onClick={onCancel}
          className="text-white/70 text-[14px] font-sans font-medium py-1 px-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>

        <div className="flex flex-col items-center gap-0.5">
          <p className="text-white text-[14px] font-semibold font-sans leading-none">
            Crop Photo
          </p>
          <p className="text-white/50 text-[11px] font-sans">
            {slotLabel}
          </p>
        </div>

        <button
          onClick={handleConfirm}
          disabled={isProcessing || !croppedAreaPixels}
          className="text-[14px] font-sans font-bold py-1.5 px-4 rounded-lg transition-all"
          style={{
            backgroundColor: isProcessing ? "rgba(224,122,40,0.5)" : "#e07a28",
            color: "#ffffff",
          }}
        >
          {isProcessing ? "Applying…" : "Apply"}
        </button>
      </div>

      {/* Cropper area */}
      <div className="relative flex-1 overflow-hidden">
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
            containerStyle: { backgroundColor: "#000" },
            cropAreaStyle: {
              border: "2px solid #e07a28",
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
            },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="shrink-0 bg-black/80 backdrop-blur-sm border-t border-white/10 px-6 py-4 flex flex-col items-center gap-2">
        <p className="text-white/50 text-[11px] font-sans tracking-wide uppercase">
          Pinch or scroll to zoom
        </p>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full max-w-xs accent-[#e07a28]"
          aria-label="Zoom"
        />

        {/* Tip */}
        <p className="text-white/40 text-[10px] font-sans text-center mt-1">
          Drag to reposition · Crop fits the {slotLabel} slot exactly
        </p>
      </div>
    </div>
  );
}
