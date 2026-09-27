/**
 * Match the real lamp: light off = white carved plate,
 * light on = the same photo glowing warm gold.
 */
export async function makeLithophaneLooks(src: string): Promise<{ day: string; night: string }> {
  const img = await load(src);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the lamp preview");
  ctx.drawImage(img, 0, 0, w, h);
  const pixels = ctx.getImageData(0, 0, w, h);
  const srcPx = pixels.data;
  const count = w * h;
  const gray = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const o = i * 4;
    gray[i] = 0.299 * srcPx[o] + 0.587 * srcPx[o + 1] + 0.114 * srcPx[o + 2];
  }

  const day = ctx.createImageData(w, h);
  const night = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const o = i * 4;
      const g = gray[i];
      const right = gray[y * w + Math.min(w - 1, x + 1)];
      const down = gray[Math.min(h - 1, y + 1) * w + x];
      const relief = (g - right) * 0.9 + (g - down) * 0.9;
      const t = Math.max(0, Math.min(1, ((g / 255 - 0.5) * 1.45 + 0.5)));

      const carved = 172 + t * 80 + relief * 0.7;
      const dayV = Math.max(158, Math.min(255, carved));
      day.data[o] = dayV;
      day.data[o + 1] = dayV - 1;
      day.data[o + 2] = dayV - 4;
      day.data[o + 3] = 255;

      night.data[o] = Math.min(255, 58 + t * 197);
      night.data[o + 1] = Math.min(255, 34 + t * 178);
      night.data[o + 2] = Math.min(255, 8 + t * 128);
      night.data[o + 3] = 255;
    }
  }

  ctx.putImageData(day, 0, 0);
  const dayUrl = canvas.toDataURL("image/jpeg", 0.9);
  ctx.putImageData(night, 0, 0);
  const nightUrl = canvas.toDataURL("image/jpeg", 0.9);
  return { day: dayUrl, night: nightUrl };
}

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not open the design for the lamp preview"));
    img.src = src;
  });
}
