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
      if (slot.polygon && slot.polygon.length > 2) {
        slot.polygon.forEach(([px, py], i) => {
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
      } else {
        ctx.rect(slot.x, slot.y, slot.w, slot.h);
      }
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
  }

  if (template.id === "birthday-script") {
    // Soft backlight gradient for right side text readability
    const grad = ctx.createLinearGradient(420, 0, 800, 0);
    grad.addColorStop(0, "rgba(255, 252, 245, 0)");
    grad.addColorStop(0.35, "rgba(255, 252, 245, 0.45)");
    grad.addColorStop(1, "rgba(255, 250, 240, 0.82)");
    ctx.fillStyle = grad;
    ctx.fillRect(420, 0, 380, template.canvasH);
  }

  if (template.id === "birthday-boy") {
    // Soft backlight gradient on top right photo for text readability
    const grad = ctx.createLinearGradient(438, 0, 438, 200);
    grad.addColorStop(0, "rgba(255, 252, 245, 0.8)");
    grad.addColorStop(0.55, "rgba(255, 252, 245, 0.4)");
    grad.addColorStop(1, "rgba(255, 252, 245, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(438, 0, 362, 200);

    // Angled white dividers matching live preview
    ctx.strokeStyle = "#fffdf8";
    ctx.lineWidth = 8;
    ctx.lineCap = "square";
    // Slanted divider between left main photo and right stack
    ctx.beginPath();
    ctx.moveTo(460, 0);
    ctx.lineTo(412, template.canvasH);
    ctx.stroke();
    // Horizontal divider between top right and bottom right photos
    ctx.beginPath();
    ctx.moveTo(436, 385);
    ctx.lineTo(template.canvasW, 385);
    ctx.stroke();
  }

  if (template.id === "family") {
    // Soft warm backlight glow at top left behind title & quote
    const grad = ctx.createLinearGradient(0, 0, 300, 220);
    grad.addColorStop(0, "rgba(255, 252, 245, 0.78)");
    grad.addColorStop(0.45, "rgba(255, 252, 245, 0.42)");
    grad.addColorStop(1, "rgba(255, 252, 245, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 380, 240);

    // Straight white dividers
    ctx.strokeStyle = "#fffdf8";
    ctx.lineWidth = 6;
    ctx.lineCap = "square";
    // Vertical divider
    ctx.beginPath();
    ctx.moveTo(500, 0);
    ctx.lineTo(500, template.canvasH);
    ctx.stroke();
    // Horizontal divider
    ctx.beginPath();
    ctx.moveTo(500, 238);
    ctx.lineTo(template.canvasW, 238);
    ctx.stroke();
  }

  // 4. Custom user text fields
  for (const field of template.textFields) {
    const textVal = textValues[field.id] ?? field.defaultValue;
    if (!textVal) continue;

    const stylePrefix = field.fontStyle ? `${field.fontStyle} ` : "";
    const fontFamily = field.fontFamily ?? "Georgia, serif";
    ctx.font = `${stylePrefix}${field.fontSize}px ${fontFamily}`;
    ctx.fillStyle = field.fill ?? "#3d1a08";
    ctx.textAlign = field.align;
    ctx.textBaseline = "top";
    if (field.letterSpacing && "letterSpacing" in ctx) {
      (ctx as unknown as { letterSpacing: string }).letterSpacing = `${field.letterSpacing}px`;
    } else if ("letterSpacing" in ctx) {
      (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
    }

    // Explicit newlines (\n) or word wrap if field.width is provided
    if (textVal.includes("\n")) {
      const lines = textVal.split("\n");
      const lineHeight = field.lineHeight ?? Math.round(field.fontSize * 1.3);
      lines.forEach((line, lineIdx) => {
        let textX = field.x;
        if (field.align === "left" && !field.width) {
          textX = field.x - template.canvasW / 2;
        }
        ctx.fillText(line, textX, field.y + lineIdx * lineHeight);
      });
    } else if (field.width && textVal.length > 20) {
      const words = textVal.split(" ");
      let currentLine = "";
      const lines: string[] = [];

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > field.width && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const lineHeight = field.lineHeight ?? Math.round(field.fontSize * 1.3);
      lines.forEach((line, lineIdx) => {
        ctx.fillText(line, field.x, field.y + lineIdx * lineHeight);
      });
    } else {
      let textX = field.x;
      if (field.align === "left" && !field.width) {
        textX = field.x - template.canvasW / 2;
      }
      ctx.fillText(textVal, textX, field.y);
    }
  }

  // 5. 3mm Frame Lip Margin Safe Zone (12px outer lip on 800x600 canvas)
  ctx.strokeStyle = "rgba(46, 30, 18, 0.18)";
  ctx.lineWidth = 24;
  ctx.strokeRect(0, 0, template.canvasW, template.canvasH);

  // Return crisp, compressed JPEG data URL (~120KB)
  return canvas.toDataURL("image/jpeg", 0.9);
}
