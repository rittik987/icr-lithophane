"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImageFile, type PixelCrop } from "@/lib/cropImage";

interface CropperModalProps {
  imageSrc: string;
  /** Slot aspect ratio: slot.w / slot.h */
  aspectRatio: number;
  slotLabel: string;
  polygon?: [number, number][];
  slotBounds?: { x: number; y: number; w: number; h: number };
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function CropperModal({
  imageSrc,
  aspectRatio,
  slotLabel,
  polygon,
  slotBounds,
  onConfirm,
  onCancel,
}: CropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [cropSize, setCropSize] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

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

  // Convert polygon vertices from canvas space to slot-local space
  const localPointsString =
    polygon && slotBounds
      ? polygon
          .map(([px, py]) => `${px - slotBounds.x},${py - slotBounds.y}`)
          .join(" ")
      : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-[#faf7f2] font-sans lg:bg-black/60 lg:backdrop-blur-sm lg:items-center lg:justify-center lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Crop photo for ${slotLabel}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="flex flex-col w-full h-full lg:h-[620px] lg:max-h-[85vh] lg:max-w-2xl lg:bg-[#faf7f2] lg:rounded-2xl lg:overflow-hidden lg:shadow-2xl lg:border lg:border-[#e5ddd0]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 shrink-0 bg-[#faf7f2] border-b border-[#e5ddd0]">
          <button
            type="button"
            onClick={onCancel}
            className="text-[#6e5c50] hover:text-[#2e1e12] text-sm font-medium py-1.5 px-3 rounded-sm hover:bg-[#f2ebdc] transition-colors cursor-pointer"
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
        <div className="relative flex-1 min-h-[300px] w-full overflow-hidden bg-[#1e130b]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onCropSizeChange={setCropSize}
            showGrid
            style={{
              containerStyle: { backgroundColor: "#1e130b" },
              cropAreaStyle: {
                border: "2px solid #e07a28",
                boxShadow: "0 0 0 9999px rgba(18, 11, 6, 0.75)",
              },
            }}
          />

          {/* Dynamic Shape Mask & 3mm Margin Guide Overlay */}
          {cropSize && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
              style={{ width: cropSize.width, height: cropSize.height }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${slotBounds?.w || 100} ${slotBounds?.h || 100}`}
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                {/* 3mm Frame Margin Guide (12px at 4px/mm) for outer edges */}
                {slotBounds && (
                  <rect
                    x={slotBounds.x === 0 ? 12 : 0}
                    y={slotBounds.y === 0 ? 12 : 0}
                    width={
                      slotBounds.w -
                      (slotBounds.x === 0 ? 12 : 0) -
                      (slotBounds.x + slotBounds.w >= 798 ? 12 : 0)
                    }
                    height={
                      slotBounds.h -
                      (slotBounds.y === 0 ? 12 : 0) -
                      (slotBounds.y + slotBounds.h >= 598 ? 12 : 0)
                    }
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Angled Polygon Cut Mask (Shades cutoff portions) */}
                {localPointsString && (
                  <>
                    <defs>
                      <mask id="angled-slot-mask">
                        <rect width="100%" height="100%" fill="white" />
                        <polygon points={localPointsString} fill="black" />
                      </mask>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="rgba(18, 11, 6, 0.65)"
                      mask="url(#angled-slot-mask)"
                    />
                    <polygon
                      points={localPointsString}
                      fill="none"
                      stroke="#e07a28"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                    />
                  </>
                )}
              </svg>
            </div>
          )}
        </div>

        {/* Bottom Zoom & Adjustment Controls */}
        <div className="shrink-0 bg-[#faf7f2] border-t border-[#e5ddd0] px-6 py-3.5 sm:py-4 flex flex-col items-center gap-2.5">
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
              onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.2) * 100) / 100))}
              aria-label="Zoom out"
              className="w-8 h-8 rounded-sm bg-[#f2ebdc] border border-[#e5ddd0] text-[#5a3a1a] hover:bg-[#e8ded0] flex items-center justify-center font-bold text-base shrink-0 transition-colors shadow-2xs cursor-pointer"
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
              onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.2) * 100) / 100))}
              aria-label="Zoom in"
              className="w-8 h-8 rounded-sm bg-[#f2ebdc] border border-[#e5ddd0] text-[#5a3a1a] hover:bg-[#e8ded0] flex items-center justify-center font-bold text-base shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Framing guidance */}
          <p className="text-[#8c786a] text-[11px] text-center px-2">
            {polygon ? (
              <>
                Drag photo so faces stay within the <span className="font-semibold text-[#e07a28]">clear cut</span> • White dashed line = 3mm frame safe zone
              </>
            ) : (
              <>
                Drag &amp; zoom to position • <span className="font-semibold text-[#2e1e12]">White dashed line = 3mm frame margin</span> (keep text &amp; faces inside)
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
