import { StorefrontProduct } from "./api";

export interface Slide {
  id: number | string;
  src: string;
  alt: string;
  label: string;
  isVideo: boolean;
}

// Default slides shown when a product has no media uploaded yet.
// Add your own images to /public/slides/ and reference them here.
export const DEFAULT_SLIDES: Slide[] = [];

export const SLIDES: Slide[] = DEFAULT_SLIDES;

export function adaptProductMediaToSlides(product?: StorefrontProduct | null): Slide[] {
  if (!product || !Array.isArray(product.media) || product.media.length === 0) {
    return DEFAULT_SLIDES;
  }

  const sortedMedia = [...product.media].sort((a, b) => a.displayOrder - b.displayOrder);

  return sortedMedia.map((m, index) => ({
    id: m.id || index,
    src: m.url,
    alt: m.altText || product.name || "ICR Lithophane Lamp",
    label: m.caption || (m.type === "VIDEO" ? "Video Demo" : m.isPrimary ? "Primary View" : `Detail ${index + 1}`),
    isVideo: m.type === "VIDEO",
  }));
}
