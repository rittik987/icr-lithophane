import { ASSETS } from "./assets";
import { StorefrontProduct } from "./api";

export interface Slide {
  id: number | string;
  src: string;
  alt: string;
  label: string;
  isVideo: boolean;
}

export const DEFAULT_SLIDES: Slide[] = [
  {
    id: 0,
    src: ASSETS.slideBacklitDimRoom,
    alt: "ICR Lithophane backlit demo in dim room",
    label: "Video Demo • 0:15",
    isVideo: true,
  },
  {
    id: 1,
    src: ASSETS.slideUnlitDaytime,
    alt: "Artisanal unlit state daytime",
    label: "Natural Daylight (Unlit)",
    isVideo: false,
  },
  {
    id: 2,
    src: ASSETS.slideLivingRoom,
    alt: "Glowing solid walnut lithophane in living room",
    label: "Living Room Ambient Glow",
    isVideo: false,
  },
  {
    id: 3,
    src: ASSETS.slideWalnutDetail,
    alt: "Handcrafted solid walnut joinery close-up",
    label: "Solid Walnut Handcraft",
    isVideo: false,
  },
];

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
