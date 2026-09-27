"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCroppedImageFile } from "@/lib/cropImage";

interface CropperModalProps {
  imageSrc: string;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
  /** When set, crop stays this width/height ratio — used by ready-design slots only. */
  aspect?: number;
}

type Rect = { x: number; y: number; w: number; h: number };
type Handle = "move" | "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const MIN_BOX = 0.08;

function clampBox(box: Rect): Rect {
  let { x, y, w, h } = box;
  w = Math.max(MIN_BOX, Math.min(1, w));
  h = Math.max(MIN_BOX, Math.min(1, h));
  x = Math.max(0, Math.min(1 - w, x));
  y = Math.max(0, Math.min(1 - h, y));
  return { x, y, w, h };
}

function boxForAspect(ratio: number): Rect {
  if (ratio >= 1) {
    const h = 1 / ratio;
    return { x: 0, y: (1 - h) / 2, w: 1, h };
  }
  return { x: (1 - ratio) / 2, y: 0, w: ratio, h: 1 };
}

export default function CropperModal({ imageSrc, onConfirm, onCancel, aspect }: CropperModalProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    startBox: Rect;
    displayW: number;
    displayH: number;
  } | null>(null);

  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [display, setDisplay] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [box, setBox] = useState<Rect>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [isProcessing, setIsProcessing] = useState(false);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img || !img.naturalWidth) return;
    const wrapR = wrap.getBoundingClientRect();
    const imgR = img.getBoundingClientRect();
    setDisplay({
      x: imgR.left - wrapR.left,
      y: imgR.top - wrapR.top,
      w: imgR.width,
      h: imgR.height,
    });
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    if (!aspect || natural.w <= 0 || natural.h <= 0) return;
    const boxRatio = aspect * (natural.h / natural.w);
    setBox(clampBox(boxForAspect(boxRatio)));
  }, [aspect, imageSrc, natural.w, natural.h]);

  function startDrag(handle: Handle, event: React.PointerEvent) {
    if (display.w <= 0 || display.h <= 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startBox: box,
      displayW: display.w,
      displayH: display.h,
    };

    const onMove = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = (moveEvent.clientX - drag.startX) / drag.displayW;
      const dy = (moveEvent.clientY - drag.startY) / drag.displayH;
      const s = drag.startBox;
      let next = { ...s };

      if (drag.handle === "move") {
        next = { ...s, x: s.x + dx, y: s.y + dy };
      } else if (aspect) {
        const boxRatio = s.w / s.h;
        let w = s.w;
        if (drag.handle.includes("e") || drag.handle.includes("w")) w = s.w + (drag.handle.includes("w") ? -dx : dx);
        else w = s.w + (drag.handle.includes("n") ? -dy : dy) * boxRatio;
        const h = w / boxRatio;
        next = { ...s, w, h };
        if (drag.handle.includes("w")) next.x = s.x + s.w - w;
        if (drag.handle.includes("n")) next.y = s.y + s.h - h;
      } else {
        if (drag.handle.includes("e")) next.w = s.w + dx;
        if (drag.handle.includes("w")) {
          next.x = s.x + dx;
          next.w = s.w - dx;
        }
        if (drag.handle.includes("s")) next.h = s.h + dy;
        if (drag.handle.includes("n")) {
          next.y = s.y + dy;
          next.h = s.h - dy;
        }
      }
      setBox(clampBox(next));
    };

    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  async function handleConfirm() {
    if (natural.w <= 0 || natural.h <= 0) return;
    setIsProcessing(true);
    try {
      const file = await getCroppedImageFile(imageSrc, {
        x: Math.round(box.x * natural.w),
        y: Math.round(box.y * natural.h),
        width: Math.max(1, Math.round(box.w * natural.w)),
        height: Math.max(1, Math.round(box.h * natural.h)),
      });
      onConfirm(file);
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setIsProcessing(false);
    }
  }

  const ready = display.w > 0 && display.h > 0;
  const handles: { id: Handle; className: string }[] = aspect
    ? [
        { id: "nw", className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2" },
        { id: "ne", className: "right-0 top-0 translate-x-1/2 -translate-y-1/2" },
        { id: "se", className: "right-0 bottom-0 translate-x-1/2 translate-y-1/2" },
        { id: "sw", className: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2" },
      ]
    : [
        { id: "nw", className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2" },
        { id: "n", className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" },
        { id: "ne", className: "right-0 top-0 translate-x-1/2 -translate-y-1/2" },
        { id: "e", className: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2" },
        { id: "se", className: "right-0 bottom-0 translate-x-1/2 translate-y-1/2" },
        { id: "s", className: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2" },
        { id: "sw", className: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2" },
        { id: "w", className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" },
      ];

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-[#faf7f2] font-sans"
      role="dialog"
      aria-modal="true"
      aria-label="Choose the part of the photo you want"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0 bg-[#faf7f2] border-b border-[#e5ddd0]">
        <button
          type="button"
          onClick={onCancel}
          className="text-[#6e5c50] hover:text-[#2e1e12] text-sm font-medium py-1.5 px-3 rounded-sm hover:bg-[#f2ebdc] transition-colors"
        >
          Cancel
        </button>
        <div className="flex flex-col items-center">
          <p className="text-[#2e1e12] text-sm sm:text-base font-bold">
            {aspect ? "Pick the part that fits" : "Crop any size you want"}
          </p>
          <p className="text-[#6e5c50] text-[11px]">
            {aspect ? "This box matches the design space" : "Drag corners — tall, wide, or a small piece"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isProcessing || natural.w <= 0}
          className="text-xs font-semibold py-2 px-5 rounded-sm disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: "#e07a28", color: "#ffffff" }}
        >
          {isProcessing ? "Saving…" : "Use this"}
        </button>
      </div>

      <div
        ref={wrapRef}
        className="relative flex-1 overflow-hidden bg-[#24170e]"
        style={{ touchAction: "none" }}
      >
        <img
          ref={imgRef}
          src={imageSrc}
          alt=""
          onLoad={measure}
          className="absolute inset-0 m-auto max-w-full max-h-full object-contain select-none"
          draggable={false}
        />

        {ready && (
          <>
            <div
              className="absolute bg-[#24170e]/70 pointer-events-none"
              style={{ left: display.x, top: display.y, width: display.w, height: box.y * display.h }}
            />
            <div
              className="absolute bg-[#24170e]/70 pointer-events-none"
              style={{
                left: display.x,
                top: display.y + (box.y + box.h) * display.h,
                width: display.w,
                height: (1 - box.y - box.h) * display.h,
              }}
            />
            <div
              className="absolute bg-[#24170e]/70 pointer-events-none"
              style={{
                left: display.x,
                top: display.y + box.y * display.h,
                width: box.x * display.w,
                height: box.h * display.h,
              }}
            />
            <div
              className="absolute bg-[#24170e]/70 pointer-events-none"
              style={{
                left: display.x + (box.x + box.w) * display.w,
                top: display.y + box.y * display.h,
                width: (1 - box.x - box.w) * display.w,
                height: box.h * display.h,
              }}
            />

            <div
              className="absolute border-2 border-[#e07a28]"
              style={{
                left: display.x + box.x * display.w,
                top: display.y + box.y * display.h,
                width: box.w * display.w,
                height: box.h * display.h,
              }}
              onPointerDown={(event) => startDrag("move", event)}
            >
              {handles.map((handle) => (
                <button
                  key={handle.id}
                  type="button"
                  aria-label={`Resize ${handle.id}`}
                  className={`absolute w-7 h-7 rounded-full bg-[#e07a28] border-[3px] border-white shadow cursor-pointer ${handle.className}`}
                  onPointerDown={(event) => startDrag(handle.id, event)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* <div className="shrink-0 bg-[#faf7f2] border-t border-[#e5ddd0] px-5 pt-4 pb-8">
        <p className="text-[#8c786a] text-[12px] text-center">
          Pull the orange dots to any shape. Use a tiny piece or almost the whole photo.
        </p>
      </div> */}
    </div>
  );
}
