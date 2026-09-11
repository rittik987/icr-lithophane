/**
 * Static asset paths — all served from /public/ (permanent, never expire).
 * Slide images come from product media via Cloudinary (admin-controlled).
 */

export const ASSETS = {
  // Brand
  logo: "/logo.png",

  // Icons (SVG) — locally hosted, never expire
  iconVideo:      "/icons/video.svg",
  iconPlay:       "/icons/play.svg",
  iconUpload:     "/icons/upload.svg",
  iconCart:       "/icons/cart.svg",
  iconShield:     "/icons/shield.svg",
  iconProportion: "/icons/proportion.svg",
  iconLed:        "/icons/led.svg",
  iconWood:       "/icons/wood.svg",
  iconPower:      "/icons/power.svg",
  iconStar:       "/icons/star.svg",
  iconStarSm:     "/icons/star-sm.svg",
  iconCartNav:    "/icons/cart-nav.svg",
  iconArrow:      "/icons/arrow.svg",
  iconUploadCTA:  "/icons/upload-cta.svg",
} as const;

