export interface PhotoSlot {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  polygon?: [number, number][];
  aspectHint: string;
  cmLabel: string;
}

export interface TextField {
  id: string;
  label: string;
  defaultValue: string;
  maxLength: number;
  x: number;
  y: number;
  fontSize: number;
  fontFamily?: string;
  fontStyle?: string;
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
  shortLabel: string;
  occasion: string;
  kind: "free" | "layout";
  thumbnailSrc: string;
  isDefault?: boolean;
  canvasW: number;
  canvasH: number;
  photoSlots: PhotoSlot[];
  textFields: TextField[];
}

function slot(
  id: string,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number
): PhotoSlot {
  const portrait = h > w;
  return {
    id,
    label,
    x,
    y,
    w,
    h,
    aspectHint: portrait ? "Portrait" : "Landscape",
    cmLabel: portrait ? "Tall photo" : "Wide photo",
  };
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: "freeform",
    name: "Your own",
    description: "Place photos and wishes anywhere",
    shortLabel: "Your own",
    occasion: "Move everything yourself",
    kind: "free",
    thumbnailSrc: "",
    isDefault: true,
    canvasW: 800,
    canvasH: 600,
    photoSlots: [],
    textFields: [],
  },
  {
    id: "one-plus-wish",
    name: "One photo + wish",
    description: "One wide photo with a message under it",
    shortLabel: "1 photo + wish",
    occasion: "Any day",
    kind: "layout",
    thumbnailSrc: "",
    canvasW: 800,
    canvasH: 600,
    photoSlots: [slot("main", "Your photo", 40, 32, 720, 430)],
    textFields: [
      {
        id: "wish",
        label: "Your wish",
        defaultValue: "I love you",
        maxLength: 40,
        x: 400,
        y: 492,
        fontSize: 40,
        fontStyle: "italic",
        fill: "#3d1a08",
        align: "center",
      },
    ],
  },
  {
    id: "side-by-side",
    name: "Two together",
    description: "Two photos side by side",
    shortLabel: "2 photos",
    occasion: "Couple or siblings",
    kind: "layout",
    thumbnailSrc: "",
    canvasW: 800,
    canvasH: 600,
    photoSlots: [
      slot("left", "Left photo", 28, 28, 364, 544),
      slot("right", "Right photo", 408, 28, 364, 544),
    ],
    textFields: [],
  },
  {
    id: "anniversary-trio",
    name: "Happy Anniversary",
    description: "Three photos and a wish",
    shortLabel: "3 photos + wishes",
    occasion: "Good for anniversary",
    kind: "layout",
    thumbnailSrc: "",
    canvasW: 800,
    canvasH: 600,
    photoSlots: [
      slot("left", "Left photo", 24, 108, 240, 368),
      slot("center", "Center photo", 280, 108, 240, 368),
      slot("right", "Right photo", 536, 108, 240, 368),
    ],
    textFields: [
      {
        id: "title",
        label: "Title",
        defaultValue: "Happy Anniversary",
        maxLength: 28,
        x: 400,
        y: 28,
        fontSize: 36,
        fontStyle: "italic",
        fill: "#3d1a08",
        align: "center",
      },
      {
        id: "caption",
        label: "Wish",
        defaultValue: "Together is my favourite place",
        maxLength: 46,
        x: 400,
        y: 504,
        fontSize: 32,
        fontStyle: "italic",
        fill: "#3d1a08",
        align: "center",
      },
    ],
  },
  {
    id: "family-plus",
    name: "Family",
    description: "One big photo and two smaller ones",
    shortLabel: "1 big + 2 small",
    occasion: "Family",
    kind: "layout",
    thumbnailSrc: "",
    canvasW: 800,
    canvasH: 600,
    photoSlots: [
      slot("main", "Big photo", 24, 24, 464, 552),
      slot("top", "Top photo", 508, 24, 268, 264),
      slot("bottom", "Bottom photo", 508, 312, 268, 264),
    ],
    textFields: [],
  },
  {
    id: "birthday-wish",
    name: "Birthday",
    description: "One photo and a birthday wish",
    shortLabel: "Birthday wish",
    occasion: "Birthday",
    kind: "layout",
    thumbnailSrc: "",
    canvasW: 800,
    canvasH: 600,
    photoSlots: [slot("main", "Birthday photo", 80, 24, 640, 400)],
    textFields: [
      {
        id: "title",
        label: "Birthday line",
        defaultValue: "Happy Birthday",
        maxLength: 28,
        x: 400,
        y: 452,
        fontSize: 40,
        fontStyle: "",
        fill: "#3d1a08",
        align: "center",
      },
      {
        id: "wish",
        label: "Your wish",
        defaultValue: "With all my love",
        maxLength: 40,
        x: 400,
        y: 516,
        fontSize: 32,
        fontStyle: "italic",
        fill: "#3d1a08",
        align: "center",
      },
    ],
  },
  {
    id: "four-memories",
    name: "Four memories",
    description: "Four equal photos",
    shortLabel: "4 photos",
    occasion: "Many faces",
    kind: "layout",
    thumbnailSrc: "",
    canvasW: 800,
    canvasH: 600,
    photoSlots: [
      slot("tl", "Photo 1", 20, 20, 372, 272),
      slot("tr", "Photo 2", 408, 20, 372, 272),
      slot("bl", "Photo 3", 20, 308, 372, 272),
      slot("br", "Photo 4", 408, 308, 372, 272),
    ],
    textFields: [],
  },
  {
    id: "names-together",
    name: "You and me",
    description: "Two photos with names under them",
    shortLabel: "2 photos + names",
    occasion: "Couple or friends",
    kind: "layout",
    thumbnailSrc: "",
    canvasW: 800,
    canvasH: 600,
    photoSlots: [
      slot("left", "Left photo", 28, 24, 360, 448),
      slot("right", "Right photo", 412, 24, 360, 448),
    ],
    textFields: [
      {
        id: "leftName",
        label: "Left name",
        defaultValue: "You",
        maxLength: 18,
        x: 208,
        y: 496,
        fontSize: 36,
        fontStyle: "italic",
        fill: "#3d1a08",
        align: "center",
      },
      {
        id: "rightName",
        label: "Right name",
        defaultValue: "Me",
        maxLength: 18,
        x: 592,
        y: 496,
        fontSize: 36,
        fontStyle: "italic",
        fill: "#3d1a08",
        align: "center",
      },
    ],
  },
  {
    id: "thank-you",
    name: "Thank you",
    description: "One photo and a thank-you wish",
    shortLabel: "Thank you",
    occasion: "Mom, dad, or teacher",
    kind: "layout",
    thumbnailSrc: "",
    canvasW: 800,
    canvasH: 600,
    photoSlots: [slot("main", "Your photo", 40, 24, 720, 392)],
    textFields: [
      {
        id: "title",
        label: "Title",
        defaultValue: "Thank you",
        maxLength: 24,
        x: 400,
        y: 440,
        fontSize: 40,
        fontStyle: "italic",
        fill: "#3d1a08",
        align: "center",
      },
      {
        id: "wish",
        label: "Your wish",
        defaultValue: "For everything you do",
        maxLength: 40,
        x: 400,
        y: 508,
        fontSize: 32,
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
    shortLabel: "Birthday script",
    occasion: "Birthday",
    kind: "layout",
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
    shortLabel: "Birthday collage",
    occasion: "Birthday",
    kind: "layout",
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
    shortLabel: "Family memories",
    occasion: "Family",
    kind: "layout",
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
    shortLabel: "Your design",
    occasion: "Upload a ready file",
    kind: "layout",
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

export function isLayoutTemplate(template: TemplateConfig): boolean {
  return template.kind === "layout";
}

export function slotAspect(slot: PhotoSlot): number {
  return slot.w / slot.h;
}
