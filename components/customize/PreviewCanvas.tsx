"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Text, Group } from "react-konva";
import type { Stage as StageType } from "konva/lib/Stage";
import { TemplateConfig, PhotoSlot } from "@/lib/templates";

// ─── Hook: load HTMLImageElement from a File ──────────────
function useFileImage(file: File | null): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!file) { setImg(null); return; }
    const url = URL.createObjectURL(file);
    const el = new window.Image();
    el.src = url;
    el.onload = () => setImg(el);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return img;
}

// ─── Cover-fit calculation ────────────────────────────────
function coverFit(
  slotX: number, slotY: number, slotW: number, slotH: number,
  imgW: number, imgH: number
) {
  const scale = Math.max(slotW / imgW, slotH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  const x = slotX + (slotW - w) / 2;
  const y = slotY + (slotH - h) / 2;
  return { x, y, width: w, height: h };
}

// ─── Per-slot image renderer ──────────────────────────────
function SlotImage({ slot, file }: { slot: PhotoSlot; file: File | null }) {
  const img = useFileImage(file);
  if (!img) return null;
  const fit = coverFit(slot.x, slot.y, slot.w, slot.h, img.naturalWidth, img.naturalHeight);
  return (
    <Group clipX={slot.x} clipY={slot.y} clipWidth={slot.w} clipHeight={slot.h}>
      <KonvaImage image={img} {...fit} />
    </Group>
  );
}

// ─── Main canvas component ────────────────────────────────
interface PreviewCanvasProps {
  template: TemplateConfig;
  uploadedFiles: Record<string, File>;
  textValues: Record<string, string>;
  stageRef: React.RefObject<StageType | null>;
  containerWidth: number;
}

export default function PreviewCanvas({
  template,
  uploadedFiles,
  textValues,
  stageRef,
  containerWidth,
}: PreviewCanvasProps) {
  const scale = containerWidth / template.canvasW;
  const stageH = template.canvasH * scale;

  // Anniversary-specific title (fixed, baked into the template design)
  const showAnniversaryTitle = template.id === "anniversary-trio";

  return (
    <Stage
      ref={stageRef}
      width={containerWidth}
      height={stageH}
      scaleX={scale}
      scaleY={scale}
    >
      <Layer>
        {/* ── Background ── */}
        <Rect
          x={0} y={0}
          width={template.canvasW}
          height={template.canvasH}
          fill="#fffdf8"
        />

        {/* ── Photo slots ── */}
        {template.photoSlots.map((slot) => (
          <SlotImage
            key={slot.id}
            slot={slot}
            file={uploadedFiles[slot.id] ?? null}
          />
        ))}

        {/* ── Slot placeholder boxes (when no photo uploaded) ── */}
        {template.photoSlots.map((slot) =>
          !uploadedFiles[slot.id] ? (
            <Rect
              key={`ph-${slot.id}`}
              x={slot.x} y={slot.y}
              width={slot.w} height={slot.h}
              fill="#f2ebdc"
              stroke="#e5ddd0"
              strokeWidth={1}
            />
          ) : null
        )}

        {/* ── Slot dividers for trio template ── */}
        {template.id === "anniversary-trio" && (
          <>
            {/* Top text area background */}
            <Rect x={0} y={0} width={template.canvasW} height={140} fill="#fffdf8" />
            {/* Bottom text area background */}
            <Rect x={0} y={539} width={template.canvasW} height={61} fill="#fffdf8" />
            {/* White gaps between photos */}
            <Rect x={260} y={140} width={10} height={399} fill="#fffdf8" />
            <Rect x={530} y={140} width={10} height={399} fill="#fffdf8" />
          </>
        )}

        {/* ── Fixed title for anniversary ── */}
        {showAnniversaryTitle && (
          <>
            <Text
              text="Happy Anniversary"
              x={0} y={28}
              width={template.canvasW}
              fontSize={38}
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fill="#3d1a08"
              align="center"
            />
          </>
        )}

        {/* ── User editable text overlays ── */}
        {template.textFields.map((field) => (
          <Text
            key={field.id}
            text={textValues[field.id] ?? field.defaultValue}
            x={field.x - template.canvasW / 2}
            y={field.y}
            width={template.canvasW}
            fontSize={field.fontSize}
            fontFamily="Georgia, serif"
            fontStyle={field.fontStyle ?? ""}
            fill={field.fill ?? "#3d1a08"}
            align={field.align}
          />
        ))}
      </Layer>
    </Stage>
  );
}
