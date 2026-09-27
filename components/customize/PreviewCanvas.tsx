"use client";

import { useEffect, useState } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Text, Group } from "react-konva";
import type { Stage as StageType } from "konva/lib/Stage";
import { TemplateConfig, PhotoSlot } from "@/lib/templates";
import type { SceneObject } from "@/lib/canvasScene";
import { CANVAS_H, CANVAS_W } from "@/lib/canvasScene";

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
function ScenePhotoImage({ obj }: { obj: Extract<SceneObject, { kind: "photo" }> }) {
  const img = useFileImage(obj.file);
  if (!img) return null;
  return (
    <KonvaImage
      image={img}
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      rotation={obj.rotation}
    />
  );
}

interface PreviewCanvasProps {
  template: TemplateConfig;
  uploadedFiles: Record<string, File>;
  textValues: Record<string, string>;
  stageRef: React.RefObject<StageType | null>;
  containerWidth: number;
  sceneObjects?: SceneObject[];
}

export default function PreviewCanvas({
  template,
  uploadedFiles,
  textValues,
  stageRef,
  containerWidth,
  sceneObjects,
}: PreviewCanvasProps) {
  if (sceneObjects) {
    const scale = containerWidth / CANVAS_W;
    const stageH = CANVAS_H * scale;
    return (
      <Stage ref={stageRef} width={containerWidth} height={stageH} scaleX={scale} scaleY={scale}>
        <Layer>
          <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="#fffdf8" />
          {sceneObjects
            .filter((obj): obj is Extract<SceneObject, { kind: "photo" }> => obj.kind === "photo")
            .map((obj) => (
              <ScenePhotoImage key={obj.id} obj={obj} />
            ))}
          {sceneObjects
            .filter((obj): obj is Extract<SceneObject, { kind: "text" }> => obj.kind === "text")
            .map((obj) => (
              <Text
                key={obj.id}
                text={obj.text}
                x={obj.x}
                y={obj.y}
                width={obj.width}
                fontSize={obj.fontSize}
                fontFamily={obj.fontFamily || "Georgia, serif"}
                fontStyle={obj.fontStyle}
                fill={obj.fill}
                align={obj.align}
                rotation={obj.rotation}
              />
            ))}
        </Layer>
      </Stage>
    );
  }

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
