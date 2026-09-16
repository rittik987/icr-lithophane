import { StorefrontProduct } from "./api";

export interface Slide {
  id: number | string;
  src: string;
  alt: string;
  label: string;
  isVideo: boolean;
  isGif: boolean;
  posterUrl?: string;
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

  return sortedMedia.map((m, index) => {
    const isVideo = m.type === "VIDEO" || /\.(mp4|webm|mov)(\?|$)/i.test(m.url);
    const isGif = m.type === "GIF" || /\.gif(\?|$)/i.test(m.url);

    return {
      id: m.id || index,
      src: m.url,
      alt: m.altText || product.name || "ICR Lithophane Lamp",
      label: m.caption || (isVideo ? "Video Demo" : isGif ? "Animated Preview" : m.isPrimary ? "Primary View" : `Detail ${index + 1}`),
      isVideo,
      isGif,
      posterUrl: m.thumbnailUrl || undefined,
    };
  });
}
