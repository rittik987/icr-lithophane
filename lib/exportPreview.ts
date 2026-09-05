import { TemplateConfig } from "./templates";

/**
 * Loads an HTMLImageElement from a File or data URL safely without CORS issues.
 */
export function loadImageSource(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Failed to load image: " + err));
    img.src = src;
  });
}

/**
 * Converts a File into a compressed Base64 data URL to prevent exceeding localStorage quota.
 * Resizes the image to max dimension 1000px and 85% JPEG quality (~80-150 KB).
 */
export async function fileToCompressedDataUrl(
  file: File,
  maxDim = 1000,
  quality = 0.85
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageSource(objectUrl);
    let { naturalWidth: w, naturalHeight: h } = img;

    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");

    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Pure 2D Canvas compositor that generates the exact lithophane preview image.
 * Independent of React-Konva so it can run offscreen anytime.
 */
export async function generateLithophanePreview(
  template: TemplateConfig,
  uploadedFiles: Record<string, File>,
  textValues: Record<string, string>
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = template.canvasW;
  canvas.height = template.canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not supported");

  // 1. Warm lithophane base background
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, template.canvasW, template.canvasH);

  // 2. Render each photo slot with cover-fit clipping
  for (const slot of template.photoSlots) {
    const file = uploadedFiles[slot.id];
    if (!file) {
      // Placeholder if missing
      ctx.fillStyle = "#f2ebdc";
      ctx.strokeStyle = "#e5ddd0";
      ctx.lineWidth = 1;
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
      ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
      continue;
    }

    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await loadImageSource(objectUrl);
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      // Cover-fit calculation
      const scale = Math.max(slot.w / imgW, slot.h / imgH);
      const w = imgW * scale;
      const h = imgH * scale;
      const x = slot.x + (slot.w - w) / 2;
      const y = slot.y + (slot.h - h) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(slot.x, slot.y, slot.w, slot.h);
      ctx.clip();
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  // 3. Template-specific frames & dividers
  if (template.id === "anniversary-trio") {
    // Top banner panel
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, template.canvasW, 140);
    // Bottom caption panel
    ctx.fillRect(0, 539, template.canvasW, 61);
    // White dividers between the 3 photos
    ctx.fillRect(260, 140, 10, 399);
    ctx.fillRect(530, 140, 10, 399);

    // Fixed title "Happy Anniversary" with margin-top y=28
    ctx.font = "italic 38px Georgia, serif";
    ctx.fillStyle = "#3d1a08";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Happy Anniversary", template.canvasW / 2, 28);
  }

  // 4. Custom user text fields
  for (const field of template.textFields) {
    const textVal = textValues[field.id] ?? field.defaultValue;
    if (!textVal) continue;

    const stylePrefix = field.fontStyle ? `${field.fontStyle} ` : "";
    ctx.font = `${stylePrefix}${field.fontSize}px Georgia, serif`;
    ctx.fillStyle = field.fill ?? "#3d1a08";
    ctx.textAlign = field.align;
    ctx.textBaseline = "top";

    // Align coordinates
    let textX = field.x;
    if (field.align === "left") {
      textX = field.x - template.canvasW / 2;
    }
    ctx.fillText(textVal, textX, field.y);
  }

  // Return crisp, compressed JPEG data URL (~120KB)
  return canvas.toDataURL("image/jpeg", 0.9);
}
