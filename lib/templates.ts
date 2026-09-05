

export interface PhotoSlot {
  id: string;
  label: string;
  /** Pixel position on 800×600 canvas */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Hint shown under the upload box */
  aspectHint: string;
  /** Physical size label */
  cmLabel: string;
}

export interface TextField {
  id: string;
  /** Label shown in the form */
  label: string;
  defaultValue: string;
  maxLength: number;
  /** Position on 800×600 canvas for preview rendering */
  x: number;
  y: number;
  fontSize: number;
  fontStyle?: string; // "italic" | "bold" | ""
  fill?: string;
  align: "left" | "center" | "right";
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  /** Path in /public/templates/ — used as thumbnail in bottom sheet */
  thumbnailSrc: string;
  isDefault?: boolean;
  /** Canvas dimensions — always 800×600 (20×15cm) */
  canvasW: number;
  canvasH: number;
  photoSlots: PhotoSlot[];
  textFields: TextField[];
}

// ─────────────────────────────────────────────────────────
// TEMPLATES — add future templates here only
// ─────────────────────────────────────────────────────────

export const TEMPLATES: TemplateConfig[] = [
  // ── 1. Single Portrait (DEFAULT) ─────────────────────
  {
    id: "single-portrait",
    name: "Single Portrait",
    description: "One full-frame photo · 20×15cm",
    thumbnailSrc: "/templates/single-portrait-frame.png",
    isDefault: true,
    canvasW: 800,
    canvasH: 600,
    photoSlots: [
      {
        id: "main",
        label: "Your Photo",
        x: 0,
        y: 0,
        w: 800,
        h: 600,
        aspectHint: "4:3 landscape recommended",
        cmLabel: "20 × 15 cm",
      },
    ],
    textFields: [],
  },

  // ── 2. Anniversary Trio (3 photos) ───────────────────
  {
    id: "anniversary-trio",
    name: "Happy Anniversary",
    description: "Three photos · anniversary frame",
    thumbnailSrc: "/templates/anniversary-trio-frame.png",
    isDefault: false,
    canvasW: 800,
    canvasH: 600,
    photoSlots: [
      {
        id: "left",
        label: "Left Photo",
        x: 0,
        y: 140,
        w: 260,
        h: 399,
        aspectHint: "Portrait recommended",
        cmLabel: "6.5 × 9.975 cm",
      },
      {
        id: "center",
        label: "Center Photo",
        x: 270,
        y: 140,
        w: 261,
        h: 399,
        aspectHint: "Portrait recommended",
        cmLabel: "6.525 × 9.975 cm",
      },
      {
        id: "right",
        label: "Right Photo",
        x: 540,
        y: 140,
        w: 260,
        h: 399,
        aspectHint: "Portrait recommended",
        cmLabel: "6.5 × 9.975 cm",
      },
    ],
    textFields: [
      {
        id: "subtitle",
        label: "Special Message (top)",
        defaultValue: "TO MY SPECIAL SOMEONE",
        maxLength: 40,
        x: 400,
        y: 95,
        fontSize: 13,
        fontStyle: "",
        fill: "#5a3a1a",
        align: "center",
      },
      {
        id: "caption",
        label: "Caption (bottom)",
        defaultValue: "Together is my favourite place",
        maxLength: 50,
        x: 400,
        y: 548,
        fontSize: 16,
        fontStyle: "italic",
        fill: "#3d1a08",
        align: "center",
      },
    ],
  },
];

export function getDefaultTemplate(): TemplateConfig {
  return TEMPLATES.find((t) => t.isDefault) ?? TEMPLATES[0];
}

export function getTemplateById(id: string): TemplateConfig {
  return TEMPLATES.find((t) => t.id === id) ?? getDefaultTemplate();
}
