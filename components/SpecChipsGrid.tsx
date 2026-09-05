import Image from "next/image";
import { ASSETS } from "@/lib/assets";

interface SpecChip {
  icon: string;
  iconW: number;
  iconH: number;
  label: string;
  value: string;
  altText: string;
}

const SPECS: SpecChip[] = [
  {
    icon: ASSETS.iconProportion,
    iconW: 16.67,
    iconH: 13.33,
    label: "PROPORTION",
    value: "Single Size: 8 × 6 Inches",
    altText: "Proportion icon",
  },
  {
    icon: ASSETS.iconLed,
    iconW: 18.33,
    iconH: 18.33,
    label: "LIGHT ENGINE",
    value: "Warm 2400K LED Core",
    altText: "LED icon",
  },
  {
    icon: ASSETS.iconWood,
    iconW: 20,
    iconH: 16.67,
    label: "WOOD FRAMING",
    value: "Solid Walnut Wood",
    altText: "Wood icon",
  },
  {
    icon: ASSETS.iconPower,
    iconW: 10,
    iconH: 15,
    label: "POWER & CABLE",
    value: "Power DC adapter",
    altText: "Power icon",
  },
];

export default function SpecChipsGrid() {
  return (
    <section className="px-4 py-2 w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {SPECS.map((spec) => (
          <div
            key={spec.label}
            className="bg-white border border-[#e5ddd0] rounded-lg p-[13px] flex items-center gap-2.5 h-20 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
          >
            <div
              className="relative shrink-0"
              style={{ width: spec.iconW, height: spec.iconH }}
            >
              <Image
                src={spec.icon}
                alt={spec.altText}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span
                className="text-[#6e5c50] text-[10px] font-bold tracking-[0.05em] uppercase leading-[1.5]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {spec.label}
              </span>
              <span
                className="text-[#2e1e12] text-[13px] font-semibold leading-[1.5]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {spec.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
