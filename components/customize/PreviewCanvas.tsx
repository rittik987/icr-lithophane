"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Text, Group, Line } from "react-konva";
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

// ─── Per-slot image renderer (supports polygon clipping) ──
function SlotImage({ slot, file }: { slot: PhotoSlot; file: File | null }) {
  const img = useFileImage(file);
  if (!img) return null;
  const fit = coverFit(slot.x, slot.y, slot.w, slot.h, img.naturalWidth, img.naturalHeight);

  if (slot.polygon && slot.polygon.length > 2) {
    return (
      <Group
        clipFunc={(ctx) => {
          ctx.beginPath();
          slot.polygon!.forEach(([px, py], i) => {
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.closePath();
        }}
      >
        <KonvaImage image={img} {...fit} />
      </Group>
    );
  }

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

  return (
    <Stage
      ref={stageRef}
      width={containerWidth}
      height={stageH}
      scaleX={scale}
      scaleY={scale}
    >
      <Layer>
        {/* Canvas background base */}
        <Rect
          x={0}
          y={0}
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
            slot.polygon ? (
              <Line
                key={`ph-${slot.id}`}
                points={slot.polygon.flat()}
                closed
                fill="#f2ebdc"
                stroke="#e5ddd0"
                strokeWidth={1}
              />
            ) : (
              <Rect
                key={`ph-${slot.id}`}
                x={slot.x} y={slot.y}
                width={slot.w} height={slot.h}
                fill="#f2ebdc"
                stroke="#e5ddd0"
                strokeWidth={1}
              />
            )
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

        {/* ── Soft backlight gradient for birthday script right-side readability ── */}
        {template.id === "birthday-script" && (
          <Rect
            x={420}
            y={0}
            width={380}
            height={template.canvasH}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 380, y: 0 }}
            fillLinearGradientColorStops={[
              0, "rgba(255, 252, 245, 0)",
              0.35, "rgba(255, 252, 245, 0.45)",
              1, "rgba(255, 250, 240, 0.82)"
            ]}
          />
        )}

        {/* ── Angled slot dividers & backlight for birthday boy collage ── */}
        {template.id === "birthday-boy" && (
          <>
            {/* Soft backlight gradient on top right photo for text readability */}
            <Rect
              x={438}
              y={0}
              width={362}
              height={200}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 0, y: 200 }}
              fillLinearGradientColorStops={[
                0, "rgba(255, 252, 245, 0.8)",
                0.55, "rgba(255, 252, 245, 0.4)",
                1, "rgba(255, 252, 245, 0)"
              ]}
            />
            {/* Slanted white divider between left main photo and right stack */}
            <Line
              points={[460, 0, 412, template.canvasH]}
              stroke="#fffdf8"
              strokeWidth={8}
              lineCap="square"
            />
            {/* Horizontal white divider between top right and bottom right photos */}
            <Line
              points={[436, 385, template.canvasW, 385]}
              stroke="#fffdf8"
              strokeWidth={8}
              lineCap="square"
            />
          </>
        )}

        {/* ── Slot dividers & backlight for family template ── */}
        {template.id === "family" && (
          <>
            {/* Soft warm backlight glow at top left behind title & quote */}
            <Rect
              x={0}
              y={0}
              width={380}
              height={240}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 300, y: 220 }}
              fillLinearGradientColorStops={[
                0, "rgba(255, 252, 245, 0.78)",
                0.45, "rgba(255, 252, 245, 0.42)",
                1, "rgba(255, 252, 245, 0)"
              ]}
            />
            {/* Vertical white divider separating left main photo and right stack */}
            <Line
              points={[500, 0, 500, template.canvasH]}
              stroke="#fffdf8"
              strokeWidth={6}
              lineCap="square"
            />
            {/* Horizontal white divider separating top right and bottom right photos */}
            <Line
              points={[500, 238, template.canvasW, 238]}
              stroke="#fffdf8"
              strokeWidth={6}
              lineCap="square"
            />
          </>
        )}

        {/* ── User editable text overlays ── */}
        {template.textFields.map((field) => {
          const fieldWidth = field.width ?? template.canvasW;
          const fieldX = field.width
            ? (field.align === "center" ? field.x - field.width / 2 : field.x)
            : field.x - template.canvasW / 2;

          return (
            <Text
              key={field.id}
              text={textValues[field.id] ?? field.defaultValue}
              x={fieldX}
              y={field.y}
              width={fieldWidth}
              fontSize={field.fontSize}
              fontFamily={field.fontFamily ?? "Georgia, serif"}
              fontStyle={field.fontStyle ?? ""}
              fill={field.fill ?? "#3d1a08"}
              align={field.align}
              letterSpacing={field.letterSpacing ?? 0}
              wrap={field.id === "wish" || field.id === "quote" ? "word" : "none"}
              lineHeight={field.lineHeight ? field.lineHeight / field.fontSize : 1.2}
            />
          );
        })}

        {/* ── 3mm Frame Margin Safe Zone (12px outer frame channel indicator) ── */}
        {/* Subtle wooden frame lip overlay around perimeter */}
        <Rect
          x={0}
          y={0}
          width={template.canvasW}
          height={template.canvasH}
          stroke="rgba(46, 30, 18, 0.18)"
          strokeWidth={24}
          listening={false}
        />
        {/* Dashed safe-margin guide (12px = 3mm from outer edge) */}
        <Rect
          x={12}
          y={12}
          width={template.canvasW - 24}
          height={template.canvasH - 24}
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth={1}
          dash={[6, 6]}
          listening={false}
        />
      </Layer>
    </Stage>
  );
}
