"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Text, Transformer } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as StageType } from "konva/lib/Stage";
import type Konva from "konva";
import {
  CANVAS_H,
  CANVAS_W,
  DEFAULT_TEXT_FONT,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  MIN_PHOTO_SIZE,
  TEXT_PLACEHOLDER,
  clampPhoto,
  clampText,
  type SceneObject,
  type ScenePhoto,
  type SceneText,
} from "@/lib/canvasScene";

function useFileImage(file: File | null): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!file) {
      setImg(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const el = new window.Image();
    el.src = url;
    el.onload = () => setImg(el);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return img;
}

function touchDistance(touches: TouchList): number {
  const a = touches[0];
  const b = touches[1];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function PhotoNode({
  photo,
  onSelect,
  onChange,
  onReady,
}: {
  photo: ScenePhoto;
  onSelect: () => void;
  onChange: (next: ScenePhoto) => void;
  onReady: () => void;
}) {
  const img = useFileImage(photo.file);
  const nodeRef = useRef<Konva.Image>(null);

  useEffect(() => {
    if (img) onReady();
  }, [img, onReady]);

  if (!img) return null;

  return (
    <KonvaImage
      id={photo.id}
      ref={nodeRef}
      image={img}
      x={photo.x}
      y={photo.y}
      width={photo.width}
      height={photo.height}
      rotation={photo.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onTouchStart={onSelect}
      onDragEnd={() => {
        const node = nodeRef.current;
        if (!node) return;
        onChange(
          clampPhoto({
            ...photo,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
          })
        );
      }}
      onTransformEnd={() => {
        const node = nodeRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange(
          clampPhoto({
            ...photo,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(MIN_PHOTO_SIZE, node.width() * scaleX),
            height: Math.max(MIN_PHOTO_SIZE, node.height() * scaleY),
          })
        );
      }}
    />
  );
}

function TextNode({
  item,
  selected,
  onSelect,
  onChange,
  onEdit,
}: {
  item: SceneText;
  selected: boolean;
  onSelect: () => void;
  onChange: (next: SceneText) => void;
  onEdit: () => void;
}) {
  const nodeRef = useRef<Konva.Text>(null);
  const justSelectedRef = useRef(false);

  function handleTap() {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    if (selected) onEdit();
    else onSelect();
  }

  return (
    <Text
      id={item.id}
      ref={nodeRef}
      text={item.text.trim() ? item.text : TEXT_PLACEHOLDER}
      x={item.x}
      y={item.y}
      width={item.width}
      fontSize={item.fontSize}
      fontFamily={item.fontFamily || DEFAULT_TEXT_FONT}
      fontStyle={item.fontStyle === "normal" ? "" : item.fontStyle}
      fill={item.text.trim() ? item.fill : "#b8a798"}
      align={item.align}
      rotation={item.rotation}
      draggable
      onClick={handleTap}
      onTap={handleTap}
      onDblClick={onEdit}
      onDblTap={onEdit}
      onTouchStart={() => {
        if (!selected) {
          justSelectedRef.current = true;
          onSelect();
        }
      }}
      onDragEnd={() => {
        const node = nodeRef.current;
        if (!node) return;
        onChange(
          clampText({
            ...item,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
          })
        );
      }}
      onTransformEnd={() => {
        const node = nodeRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange(
          clampText({
            ...item,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(80, node.width() * scaleX),
            fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, item.fontSize * scaleY)),
          })
        );
      }}
    />
  );
}

interface LithophaneEditorProps {
  objects: SceneObject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChangeObject: (next: SceneObject) => void;
  onEditText: (id: string) => void;
  containerWidth: number;
  stageRef: React.RefObject<StageType | null>;
}

export default function LithophaneEditor({
  objects,
  selectedId,
  onSelect,
  onChangeObject,
  onEditText,
  containerWidth,
  stageRef,
}: LithophaneEditorProps) {
  const transformerRef = useRef<Konva.Transformer>(null);
  const [readyTick, setReadyTick] = useState(0);
  const markReady = useCallback(() => setReadyTick((n) => n + 1), []);
  const scale = containerWidth / CANVAS_W;
  const stageH = CANVAS_H * scale;
  const objectsRef = useRef(objects);
  const selectedIdRef = useRef(selectedId);
  objectsRef.current = objects;
  selectedIdRef.current = selectedId;

  const pinchRef = useRef<{
    dist: number;
    photo?: { width: number; height: number; x: number; y: number };
    text?: { fontSize: number; width: number; x: number; y: number };
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) setReadyTick((n) => n + 1);
      });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    if (!selectedId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const node = stage.findOne(`#${selectedId}`);
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, stageRef, readyTick]);

  useEffect(() => {
    transformerRef.current?.forceUpdate();
    transformerRef.current?.getLayer()?.batchDraw();
  }, [objects]);

  const handleStageMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        onSelect(null);
      }
    },
    [onSelect]
  );

  const handleStageTouchStart = useCallback(
    (e: KonvaEventObject<TouchEvent>) => {
      const touches = e.evt.touches;
      if (touches.length === 2) {
        const id = selectedIdRef.current;
        const obj = objectsRef.current.find((item) => item.id === id);
        if (!obj) return;
        if (e.evt.cancelable) e.evt.preventDefault();
        stageRef.current?.find("Image,Text").forEach((node) => node.draggable(false));
        transformerRef.current?.listening(false);
        if (obj.kind === "photo") {
          pinchRef.current = {
            dist: touchDistance(touches),
            photo: { width: obj.width, height: obj.height, x: obj.x, y: obj.y },
          };
        } else {
          pinchRef.current = {
            dist: touchDistance(touches),
            text: { fontSize: obj.fontSize, width: obj.width, x: obj.x, y: obj.y },
          };
        }
        return;
      }
      if (e.target === e.target.getStage()) {
        onSelect(null);
      }
    },
    [onSelect]
  );

  const handleStageTouchMove = useCallback(
    (e: KonvaEventObject<TouchEvent>) => {
      if (e.evt.touches.length !== 2 || !pinchRef.current) return;
      if (e.evt.cancelable) e.evt.preventDefault();
      const id = selectedIdRef.current;
      const obj = objectsRef.current.find((item) => item.id === id);
      if (!obj) return;
      const pinchScale = touchDistance(e.evt.touches) / pinchRef.current.dist;

      if (obj.kind === "photo" && pinchRef.current.photo) {
        const start = pinchRef.current.photo;
        const width = Math.max(MIN_PHOTO_SIZE, start.width * pinchScale);
        const height = Math.max(MIN_PHOTO_SIZE, start.height * pinchScale);
        const cx = start.x + start.width / 2;
        const cy = start.y + start.height / 2;
        onChangeObject(
          clampPhoto({
            ...obj,
            width,
            height,
            x: cx - width / 2,
            y: cy - height / 2,
          })
        );
        return;
      }

      if (obj.kind === "text" && pinchRef.current.text) {
        const start = pinchRef.current.text;
        const fontSize = Math.min(
          MAX_FONT_SIZE,
          Math.max(MIN_FONT_SIZE, start.fontSize * pinchScale)
        );
        const width = Math.max(80, start.width * pinchScale);
        const cx = start.x + start.width / 2;
        const cy = start.y + start.fontSize / 2;
        onChangeObject(
          clampText({
            ...obj,
            fontSize,
            width,
            x: cx - width / 2,
            y: cy - fontSize / 2,
          })
        );
      }
    },
    [onChangeObject]
  );

  const handleStageTouchEnd = useCallback(() => {
    pinchRef.current = null;
    stageRef.current?.find("Image,Text").forEach((node) => node.draggable(true));
    transformerRef.current?.listening(true);
  }, [stageRef]);

  return (
    <Stage
      ref={stageRef}
      width={containerWidth}
      height={stageH}
      scaleX={scale}
      scaleY={scale}
      onMouseDown={handleStageMouseDown}
      onTouchStart={handleStageTouchStart}
      onTouchMove={handleStageTouchMove}
      onTouchEnd={handleStageTouchEnd}
    >
      <Layer>
        <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="#fffdf8" listening={false} />
        <Rect
          x={16}
          y={16}
          width={CANVAS_W - 32}
          height={CANVAS_H - 32}
          stroke="#e5ddd0"
          dash={[8, 6]}
          strokeWidth={1}
          listening={false}
        />

        {objects
          .filter((obj): obj is ScenePhoto => obj.kind === "photo")
          .map((obj) => (
            <PhotoNode
              key={obj.id}
              photo={obj}
              onSelect={() => onSelect(obj.id)}
              onChange={(next) => onChangeObject(next)}
              onReady={markReady}
            />
          ))}
        {objects
          .filter((obj): obj is SceneText => obj.kind === "text")
          .map((obj) => (
            <TextNode
              key={obj.id}
              item={obj}
              selected={selectedId === obj.id}
              onSelect={() => onSelect(obj.id)}
              onChange={(next) => onChangeObject(next)}
              onEdit={() => onEditText(obj.id)}
            />
          ))}

        <Transformer
          ref={transformerRef}
          rotateEnabled
          keepRatio
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < MIN_PHOTO_SIZE || newBox.height < MIN_FONT_SIZE) return oldBox;
            return newBox;
          }}
          anchorSize={28}
          anchorCornerRadius={14}
          borderStroke="#e07a28"
          borderStrokeWidth={3}
          anchorStroke="#ffffff"
          anchorStrokeWidth={3}
          anchorFill="#e07a28"
          rotateAnchorOffset={26}
          anchorStyleFunc={(anchor) => {
            if (anchor.hasName("rotater")) {
              anchor.fill("#2e1e12");
              anchor.stroke("#ffffff");
              anchor.strokeWidth(3);
              anchor.width(32);
              anchor.height(32);
              anchor.offsetX(16);
              anchor.offsetY(16);
              anchor.cornerRadius(16);
            }
          }}
        />
      </Layer>
    </Stage>
  );
}
