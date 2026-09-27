"use client";

import { useEffect, useRef, useState } from "react";

interface SizeSliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  kind?: "text" | "photo";
}

export default function SizeSlider({
  label = "Size",
  value,
  min,
  max,
  onChange,
  kind = "text",
}: SizeSliderProps) {
  const [draft, setDraft] = useState(value);
  const draggingRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!draggingRef.current) setDraft(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  function flush(next: number) {
    pendingRef.current = next;
    if (frameRef.current != null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      if (pendingRef.current == null) return;
      onChangeRef.current(pendingRef.current);
    });
  }

  function handleInput(next: number) {
    setDraft(next);
    flush(next);
  }

  function stopDrag() {
    draggingRef.current = false;
    if (pendingRef.current != null) onChangeRef.current(pendingRef.current);
  }

  const sizeWord =
    draft <= min + (max - min) * 0.25 ? "Small" : draft >= min + (max - min) * 0.7 ? "Big" : "Medium";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-semibold text-[#2e1e12]">{label}</p>
        <span className="text-[11px] text-[#6e5c50] font-sans">{sizeWord}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[#8a7b6e] font-sans w-5 text-center leading-none" aria-hidden="true">
          {kind === "text" ? <span className="text-[12px]">A</span> : <span className="text-[11px]">▢</span>}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={0.5}
          value={draft}
          onPointerDown={() => {
            draggingRef.current = true;
          }}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onChange={(e) => handleInput(Number(e.target.value))}
          className="icr-slider flex-1"
          aria-label={label}
        />
        <span className="text-[#8a7b6e] font-sans w-5 text-center leading-none" aria-hidden="true">
          {kind === "text" ? <span className="text-[18px]">A</span> : <span className="text-[16px]">▢</span>}
        </span>
      </div>
    </div>
  );
}
