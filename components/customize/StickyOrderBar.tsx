"use client";

import Image from "next/image";
import { ASSETS } from "@/lib/assets";

interface StickyOrderBarProps {
  isReady: boolean;
  totalSlots: number;
  uploadedCount: number;
  onPlaceOrder?: () => void;
  loading?: boolean;
  sellingPrice?: number;
  mrp?: number;
}

export default function StickyOrderBar({
  isReady,
  totalSlots,
  uploadedCount,
  onPlaceOrder,
  loading = false,
  sellingPrice = 2999,
  mrp = 4999,
}: StickyOrderBarProps) {
  const remaining = totalSlots - uploadedCount;

  return (
    <aside
      aria-label="Order bar"
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.98)] border-t border-[#e5ddd0] shadow-[0_-4px_12px_rgba(46,30,18,0.08)] px-5 py-3"
      style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">

        {/* Left — price + status */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2 leading-none">
            <span className="text-[#2e1e12] text-xl font-bold leading-none font-sans">
              ₹{sellingPrice.toLocaleString("en-IN")}
            </span>
            {mrp > 0 && (
              <span className="text-[#6e5c50] text-xs line-through font-sans">
                ₹{mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          {isReady ? (
            <span className="text-[#1e7234] text-[10px] font-semibold tracking-wide uppercase font-sans">
              Ready to order ✓
            </span>
          ) : (
            <span className="text-[#6e5c50] text-[10px] font-semibold tracking-wide uppercase font-sans">
              {remaining} photo{remaining > 1 ? "s" : ""} remaining
            </span>
          )}
        </div>

        {/* Right — CTA button (same style as StickyBottomBar) */}
        <button
          disabled={!isReady || loading}
          onClick={onPlaceOrder}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-md transition-all shrink-0 ${
            isReady && !loading
              ? "hover:bg-[#c96a1f] active:bg-[#b85d1a]"
              : "opacity-50 cursor-not-allowed"
          }`}
          style={{ backgroundColor: isReady ? "#e07a28" : "#c9b99f" }}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="font-bold font-sans uppercase whitespace-nowrap text-white text-[13px] tracking-[0.06em]">
                Processing...
              </span>
            </div>
          ) : (
            <>
              <span
                className="font-bold font-sans uppercase whitespace-nowrap"
                style={{ color: "#ffffff", fontSize: "13px", letterSpacing: "0.06em" }}
              >
                Place Order
              </span>
              <div className="relative w-3 h-3 shrink-0">
                <Image
                  src={ASSETS.iconArrow}
                  alt=""
                  fill
                  sizes="12px"
                  style={{ filter: "brightness(0) invert(1)" }}
                  className="object-contain"
                  unoptimized
                />
              </div>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
