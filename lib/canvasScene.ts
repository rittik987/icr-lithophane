import { TEMPLATES, type PhotoSlot, type TemplateConfig } from "./templates";

export const CANVAS_W = 800;
export const CANVAS_H = 600;
export const MIN_PHOTO_SIZE = 100;
export const MIN_FONT_SIZE = 32;
export const MAX_FONT_SIZE = 200;
export const MAX_PHOTOS = 4;
export const MAX_TEXTS = 5;
export const TEXT_PLACEHOLDER = "Type here";

export const TEXT_COLORS = [
  { id: "brown", label: "Brown", value: "#3d1a08" },
  { id: "black", label: "Black", value: "#1a1412" },
  { id: "white", label: "White", value: "#ffffff" },
  { id: "cream", label: "Cream", value: "#f4e8d0" },
  { id: "orange", label: "Orange", value: "#e07a28" },
  { id: "red", label: "Red", value: "#c62828" },
  { id: "green", label: "Green", value: "#1e7234" },
  { id: "navy", label: "Navy", value: "#1d4e89" },
  { id: "gold", label: "Gold", value: "#c9a227" },
  { id: "pink", label: "Pink", value: "#c2185b" },
] as const;

export const FONT_CHOICES = [
  { id: "simple", label: "Simple", family: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { id: "fancy", label: "Fancy", family: "'Playfair Display', Georgia, serif" },
  { id: "script", label: "Handwriting", family: "'Dancing Script', cursive" },
  { id: "soft", label: "Soft", family: "'Cormorant Garamond', Georgia, serif" },
  { id: "love", label: "Love", family: "'Great Vibes', cursive" },
  { id: "strong", label: "Strong", family: "Oswald, system-ui, sans-serif" },
] as const;

export function isBoldStyle(style: string): boolean {
  return style.includes("bold");
}

export function isItalicStyle(style: string): boolean {
  return style.includes("italic");
}

export function composeFontStyle(bold: boolean, italic: boolean): string {
  if (bold && italic) return "bold italic";
  if (bold) return "bold";
  if (italic) return "italic";
  return "normal";
}

export const DEFAULT_TEXT_FONT = FONT_CHOICES[0].family;

export type ScenePhoto = {
  id: string;
  kind: "photo";
  file: File;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  slotId?: string;
};

export type SceneText = {
  id: string;
  kind: "text";
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fill: string;
  fontStyle: string;
  fontFamily: string;
  align: "left" | "center" | "right";
  rotation: number;
};

export type SceneObject = ScenePhoto | SceneText;

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function scenePhotos(objects: SceneObject[]): ScenePhoto[] {
  return objects.filter((o): o is ScenePhoto => o.kind === "photo");
}

export function sceneTexts(objects: SceneObject[]): SceneText[] {
  return objects.filter((o): o is SceneText => o.kind === "text");
}

export function filesFromScene(objects: SceneObject[]): Record<string, File> {
  const files: Record<string, File> = {};
  for (const photo of scenePhotos(objects)) {
    files[photo.id] = photo.file;
  }
  return files;
}

export function textsFromScene(objects: SceneObject[]): Record<string, string> {
  const texts: Record<string, string> = {};
  for (const item of sceneTexts(objects)) {
    texts[item.id] = item.text;
  }
  return texts;
}

function fitContain(
  boxW: number,
  boxH: number,
  imgW: number,
  imgH: number
): { width: number; height: number } {
  const scale = Math.min(boxW / imgW, boxH / imgH);
  return { width: Math.round(imgW * scale), height: Math.round(imgH * scale) };
}

export function nextLayoutSlot(
  template: TemplateConfig,
  objects: SceneObject[]
): PhotoSlot | undefined {
  return emptySlots(template, objects)[0];
}

export function emptySlots(template: TemplateConfig, objects: SceneObject[]): PhotoSlot[] {
  const used = new Set(
    scenePhotos(objects)
      .map((photo) => photo.slotId)
      .filter((id): id is string => Boolean(id))
  );
  return template.photoSlots.filter((slot) => !used.has(slot.id));
}

export function placePhotoInSlot(file: File, slot: PhotoSlot): ScenePhoto {
  return {
    id: newId("photo"),
    kind: "photo",
    file,
    x: slot.x,
    y: slot.y,
    width: slot.w,
    height: slot.h,
    rotation: 0,
    slotId: slot.id,
  };
}

export function placeNewPhoto(
  objects: SceneObject[],
  file: File,
  imgW: number,
  imgH: number,
  slot?: PhotoSlot
): ScenePhoto {
  if (slot) {
    const fitted = fitContain(slot.w, slot.h, imgW, imgH);
    return {
      id: newId("photo"),
      kind: "photo",
      file,
      width: fitted.width,
      height: fitted.height,
      x: slot.x + Math.round((slot.w - fitted.width) / 2),
      y: slot.y + Math.round((slot.h - fitted.height) / 2),
      rotation: 0,
    };
  }

  const photos = scenePhotos(objects);
  const offset = photos.length * 28;

  if (photos.length === 0) {
    const fitted = fitContain(CANVAS_W - 80, CANVAS_H - 120, imgW, imgH);
    return {
      id: newId("photo"),
      kind: "photo",
      file,
      width: fitted.width,
      height: fitted.height,
      x: Math.round((CANVAS_W - fitted.width) / 2),
      y: Math.round((CANVAS_H - fitted.height) / 2),
      rotation: 0,
    };
  }

  const fitted = fitContain(360, 280, imgW, imgH);
  return {
    id: newId("photo"),
    kind: "photo",
    file,
    width: fitted.width,
    height: fitted.height,
    x: Math.min(CANVAS_W - fitted.width - 24, 160 + offset),
    y: Math.min(CANVAS_H - fitted.height - 24, 120 + offset),
    rotation: 0,
  };
}

export function createTextObject(text = ""): SceneText {
  return {
    id: newId("text"),
    kind: "text",
    text,
    x: 200,
    y: 250,
    width: 400,
    fontSize: 40,
    fill: "#3d1a08",
    fontStyle: "",
    fontFamily: DEFAULT_TEXT_FONT,
    align: "center",
    rotation: 0,
  };
}

export function isPlaceholderText(text: string): boolean {
  const value = text.trim().toLowerCase();
  return (
    value === "" ||
    value === "your message" ||
    value === "tap to edit" ||
    value === "type here"
  );
}

/** Place existing work into a ready design. Photos keep their real shape. */
export function applyLayout(
  template: TemplateConfig,
  objects: SceneObject[]
): SceneObject[] {
  if (template.kind !== "layout") {
    return objects.map((item) =>
      item.kind === "photo" ? { ...item, slotId: undefined } : item
    );
  }

  const photos = scenePhotos(objects);
  const existingTexts = sceneTexts(objects);
  const next: SceneObject[] = [];

  template.photoSlots.forEach((slot, index) => {
    const photo = photos[index];
    if (!photo) return;
    const fitted = fitContain(slot.w, slot.h, photo.width, photo.height);
    next.push({
      ...photo,
      width: fitted.width,
      height: fitted.height,
      x: slot.x + Math.round((slot.w - fitted.width) / 2),
      y: slot.y + Math.round((slot.h - fitted.height) / 2),
      rotation: 0,
      slotId: slot.id,
    });
  });

  photos.slice(template.photoSlots.length).forEach((photo, i) => {
    next.push({
      ...photo,
      slotId: undefined,
      x: Math.min(photo.x, CANVAS_W - MIN_PHOTO_SIZE),
      y: Math.min(40 + i * 24, CANVAS_H - MIN_PHOTO_SIZE),
    });
  });

  template.textFields.forEach((field) => {
    const already = existingTexts.find((t) => t.text === field.defaultValue);
    const x = field.align === "center" ? 40 : field.x;
    const width = field.align === "center" ? 720 : 400;
    if (already) {
      next.push({
        ...already,
        x,
        y: field.y,
        width,
        fontSize: Math.max(MIN_FONT_SIZE, field.fontSize),
        fill: field.fill ?? already.fill,
        fontStyle: field.fontStyle ?? already.fontStyle,
        align: field.align,
        rotation: 0,
      });
      return;
    }
    next.push({
      id: newId("text"),
      kind: "text",
      text: field.defaultValue,
      x,
      y: field.y,
      width,
      fontSize: Math.max(MIN_FONT_SIZE, field.fontSize),
      fill: field.fill ?? "#3d1a08",
      fontStyle: field.fontStyle ?? "",
      fontFamily: FONT_CHOICES[1].family,
      align: field.align,
      rotation: 0,
    });
  });

  const designCopy = new Set(
    TEMPLATES.flatMap((item) => item.textFields.map((field) => field.defaultValue))
  );
  const claimed = new Set(next.filter((o) => o.kind === "text").map((o) => o.id));
  for (const text of existingTexts) {
    if (claimed.has(text.id) || isPlaceholderText(text.text) || designCopy.has(text.text)) {
      continue;
    }
    next.push(text);
  }

  return next;
}

export function clampPhoto(photo: ScenePhoto): ScenePhoto {
  const width = Math.max(MIN_PHOTO_SIZE, photo.width);
  const height = Math.max(MIN_PHOTO_SIZE, photo.height);
  return {
    ...photo,
    width,
    height,
    x: Math.min(Math.max(photo.x, -width + 40), CANVAS_W - 40),
    y: Math.min(Math.max(photo.y, -height + 40), CANVAS_H - 40),
  };
}

export function clampText(text: SceneText): SceneText {
  return {
    ...text,
    fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, text.fontSize)),
    width: Math.max(80, text.width),
    x: Math.min(Math.max(text.x, -text.width + 40), CANVAS_W - 40),
    y: Math.min(Math.max(text.y, 0), CANVAS_H - 24),
  };
}
