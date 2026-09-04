"use client";

import Image from "next/image";
import { ASSETS } from "@/lib/assets";

interface StickyBottomBarProps {
  onOrder?: () => void;
}

export default function StickyBottomBar({ onOrder }: StickyBottomBarProps) {
  return (
    <aside
      aria-label="Quick order bar"
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.98)] border-t border-[#e5ddd0] shadow-[0_-4px_12px_rgba(46,30,18,0.08)] px-4 py-3"
      style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
        {/* Price info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2 leading-none">
            <span className="text-[#2e1e12] text-xl font-bold leading-none font-serif">
              ₹2,999
            </span>
            <span className="text-[#6e5c50] text-xs line-through font-sans">
              ₹4,999
            </span>
          </div>
          <span className="text-[#1e7234] text-[10px] font-semibold tracking-wide uppercase font-sans">
            40% OFF • FREE DELIVERY
          </span>
        </div>

        {/* Order CTA - Orange with white text */}
        <button
          onClick={onOrder}
          style={{ backgroundColor: "#e07a28" }}
          className="hover:bg-[#c96a1f] active:bg-[#b85d1a] flex items-center gap-2 px-6 py-3 rounded-sm shadow-md transition-all"
        >
          <div className="flex items-center gap-2 px-2 py-2">
          <span 
            className="font-bold font-sans uppercase whitespace-nowrap"
            style={{ color: "#ffffff", fontSize: "14px", letterSpacing: "0.06em" }}
          >
            ORDER NOW
          </span>
          <div className="relative w-3 h-3 shrink-0">
            <Image
              src={ASSETS.iconArrow}
              alt=""
              fill
              style={{ filter: "brightness(0) invert(1)" }}
              className="object-contain"
              unoptimized
            />
          </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
