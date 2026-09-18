

export interface PhotoSlot {
  id: string;
  label: string;
  /** Pixel position on 800×600 canvas */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Optional polygon vertices [[x, y], ...] in canvas coordinates */
  polygon?: [number, number][];
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
  fontFamily?: string;
  fontStyle?: string; // "italic" | "bold" | ""
  fill?: string;
  align: "left" | "center" | "right";
  width?: number;
  lineHeight?: number;
  letterSpacing?: number;
  multiline?: boolean;
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
        id: "title",
        label: "Title Heading",
        defaultValue: "Happy Anniversary",
        maxLength: 30,
        x: 400,
        y: 28,
        fontSize: 38,
        fontStyle: "italic",
        fill: "#3d1a08",
        align: "center",
      },
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

  // ── 3. Birthday Script (Full photo + script overlay) ──
  {
    id: "birthday-script",
    name: "Happy Birthday",
    description: "One photo · Script overlay on right",
    thumbnailSrc: "/templates/birthday-girl.png",
    isDefault: false,
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
        aspectHint: "4:3 landscape · Subject on left recommended",
        cmLabel: "20 × 15 cm",
      },
    ],
    textFields: [
      {
        id: "eyebrow",
        label: "Top Eyebrow",
        defaultValue: "H A P P Y",
        maxLength: 15,
        x: 625,
        y: 78,
        fontSize: 26,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontStyle: "bold",
        fill: "#24170e",
        align: "center",
        width: 380,
        letterSpacing: 6,
      },
      {
        id: "headline",
        label: "Script Title",
        defaultValue: "Birthday",
        maxLength: 20,
        x: 625,
        y: 118,
        fontSize: 98,
        fontFamily: "'Dancing Script', cursive",
        fontStyle: "bold",
        fill: "#24170e",
        align: "center",
        width: 400,
      },
      {
        id: "wish",
        label: "Personal Wish",
        defaultValue: "May your day be as bright and special as you are",
        maxLength: 60,
        x: 625,
        y: 335,
        fontSize: 16,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontStyle: "500",
        fill: "#2e1e12",
        align: "center",
        width: 280,
        lineHeight: 25,
      },
      {
        id: "signoff",
        label: "Sign-off / Heart",
        defaultValue: "♡",
        maxLength: 20,
        x: 625,
        y: 435,
        fontSize: 32,
        fontFamily: "Georgia, serif",
        fontStyle: "",
        fill: "#24170e",
        align: "center",
        width: 200,
      },
    ],
  },

  // ── 4. Birthday Collage (3 photos asymmetric collage) ──
  {
    id: "birthday-boy",
    name: "Birthday Collage",
    description: "Three photos · Birthday collage layout",
    thumbnailSrc: "/templates/birthday-boy.png",
    isDefault: false,
    canvasW: 800,
    canvasH: 600,
    photoSlots: [
      {
        id: "left",
        label: "Main Photo (Left)",
        x: 0,
        y: 0,
        w: 456,
        h: 600,
        polygon: [
          [0, 0],
          [456, 0],
          [408, 600],
          [0, 600],
        ],
        aspectHint: "Tall portrait photo · Slanted right edge",
        cmLabel: "11.4 × 15 cm",
      },
      {
        id: "topRight",
        label: "Top Right Photo",
        x: 439,
        y: 0,
        w: 361,
        h: 381,
        polygon: [
          [464, 0],
          [800, 0],
          [800, 381],
          [439, 381],
        ],
        aspectHint: "Landscape photo · Slanted left edge",
        cmLabel: "9.0 × 9.5 cm",
      },
      {
        id: "bottomRight",
        label: "Bottom Right Photo",
        x: 416,
        y: 389,
        w: 384,
        h: 211,
        polygon: [
          [433, 389],
          [800, 389],
          [800, 600],
          [416, 600],
        ],
        aspectHint: "Wide landscape photo · Slanted left edge",
        cmLabel: "9.6 × 5.3 cm",
      },
    ],
    textFields: [
      {
        id: "eyebrow",
        label: "Top Eyebrow",
        defaultValue: "H A P P Y",
        maxLength: 15,
        x: 619,
        y: 45,
        fontSize: 16,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontStyle: "bold",
        fill: "#24170e",
        align: "center",
        width: 320,
        letterSpacing: 5,
      },
      {
        id: "headline",
        label: "Script Title",
        defaultValue: "Birthday",
        maxLength: 20,
        x: 619,
        y: 72,
        fontSize: 60,
        fontFamily: "'Dancing Script', cursive",
        fontStyle: "bold",
        fill: "#24170e",
        align: "center",
        width: 320,
      },
      {
        id: "accent",
        label: "Subtitle / Tagline",
        defaultValue: "——",
        maxLength: 25,
        x: 619,
        y: 145,
        fontSize: 14,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontStyle: "bold",
        fill: "#24170e",
        align: "center",
        width: 200,
      },
    ],
  },

  // ── 5. Family Memories (3 photos with script text) ──
  {
    id: "family",
    name: "Family Memories",
    description: "Three photos · Family script layout",
    thumbnailSrc: "/templates/family.png",
    isDefault: false,
    canvasW: 800,
    canvasH: 600,
    photoSlots: [
      {
        id: "left",
        label: "Main Photo (Left)",
        x: 0,
        y: 0,
        w: 497,
        h: 600,
        aspectHint: "Full-height portrait family photo",
        cmLabel: "12.4 × 15 cm",
      },
      {
        id: "topRight",
        label: "Top Right Photo",
        x: 503,
        y: 0,
        w: 297,
        h: 235,
        aspectHint: "Landscape photo · Top right",
        cmLabel: "7.4 × 5.9 cm",
      },
      {
        id: "bottomRight",
        label: "Bottom Right Photo",
        x: 503,
        y: 241,
        w: 297,
        h: 359,
        aspectHint: "Portrait photo · Bottom right",
        cmLabel: "7.4 × 9.0 cm",
      },
    ],
    textFields: [
      {
        id: "headline",
        label: "Script Title",
        defaultValue: "Family",
        maxLength: 20,
        x: 135,
        y: 18,
        fontSize: 82,
        fontFamily: "'Dancing Script', cursive",
        fontStyle: "bold",
        fill: "#24140a",
        align: "center",
        width: 230,
      },
      {
        id: "signoff",
        label: "Heart Symbol",
        defaultValue: "♡",
        maxLength: 10,
        x: 282,
        y: 32,
        fontSize: 42,
        fontFamily: "Georgia, serif",
        fontStyle: "bold",
        fill: "#24140a",
        align: "center",
        width: 60,
      },
      {
        id: "quote",
        label: "Family Motto / Subtitle",
        defaultValue: "ALWAYS\nA GOOD\nFEELING",
        maxLength: 50,
        multiline: true,
        x: 110,
        y: 124,
        fontSize: 11,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontStyle: "bold",
        fill: "#24140a",
        align: "center",
        width: 90,
        letterSpacing: 4,
        lineHeight: 18,
      },
      {
        id: "accent",
        label: "Accent Line",
        defaultValue: "————",
        maxLength: 15,
        x: 110,
        y: 178,
        fontSize: 12,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontStyle: "bold",
        fill: "#24140a",
        align: "center",
        width: 80,
      },
    ],
  },

  // ── 6. Custom Design ──
  {
    id: "custom-design",
    name: "Custom Design",
    description: "20 × 15 cm (8 × 6 in) · Upload your own design",
    thumbnailSrc: "/templates/custom-design.svg",
    isDefault: false,
    canvasW: 800,
    canvasH: 600,
    photoSlots: [
      {
        id: "main",
        label: "Custom Design",
        x: 0,
        y: 0,
        w: 800,
        h: 600,
        aspectHint: "20 × 15 cm · 8 × 6 in · 4:3 ratio",
        cmLabel: "20 × 15 cm (8 × 6 in)",
      },
    ],
    textFields: [],
  },
];

export function getDefaultTemplate(): TemplateConfig {
  return TEMPLATES.find((t) => t.isDefault) ?? TEMPLATES[0];
}

export function getTemplateById(id: string): TemplateConfig {
  return TEMPLATES.find((t) => t.id === id) ?? getDefaultTemplate();
}
