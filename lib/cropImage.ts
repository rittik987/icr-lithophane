/**
 * Generates a cropped image File from a source image URL and pixel crop coordinates.
 * Used by CropperModal after the user confirms their crop selection.
 */

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: PixelCrop,
  fileName = "cropped.jpg"
): Promise<File> {
  const image = await loadImage(imageSrc);
  const x = Math.max(0, Math.round(pixelCrop.x));
  const y = Math.max(0, Math.round(pixelCrop.y));
  const width = Math.max(1, Math.min(Math.round(pixelCrop.width), image.naturalWidth - x));
  const height = Math.max(1, Math.min(Math.round(pixelCrop.height), image.naturalHeight - y));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.95
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    // NOTE: Do NOT set img.crossOrigin here.
    // This is a blob:// URL from URL.createObjectURL() — always same-origin.
    // Setting crossOrigin on a blob URL causes a CORS error and breaks the crop.
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for cropping"));
    img.src = src;
  });
}
