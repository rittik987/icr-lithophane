export interface PhotoSlot {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
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
  fontStyle?: string;
  fill?: string;
  align: "left" | "center" | "right";
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
