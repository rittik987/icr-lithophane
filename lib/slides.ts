import { ASSETS } from "./assets";

export interface Slide {
  id: number;
  src: string;
  alt: string;
  label: string;
  isVideo: boolean;
}

export const SLIDES: Slide[] = [
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
