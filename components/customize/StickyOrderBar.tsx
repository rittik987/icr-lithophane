"use client";

import Image from "next/image";
import { ASSETS } from "@/lib/assets";

interface StickyOrderBarProps {
  isReady: boolean;
  totalSlots: number;
  uploadedCount: number;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  isAddingToCart?: boolean;
  isPlacingOrder?: boolean;
}

export default function StickyOrderBar({
  isReady,
  totalSlots,
  uploadedCount,
  onAddToCart,
  onBuyNow,
  isAddingToCart = false,
  isPlacingOrder = false,
}: StickyOrderBarProps) {
  const remaining = totalSlots - uploadedCount;

  return (
    <aside
      aria-label="Order actions"
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-t border-[#e5ddd0] shadow-[0_-4px_20px_rgba(46,30,18,0.08)] px-4 py-3 lg:hidden"
      style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto w-full">
        {/* Left Button — Add to Cart */}
        <button
          type="button"
          disabled={!isReady || isAddingToCart || isPlacingOrder}
          onClick={onAddToCart}
          style={{
            border: isReady ? "1px solid #1a1412" : "2px solid #d5c7b3",
          }}
          className={`flex-1 h-12 rounded-sm font-semibold font-sans text-[14px] sm:text-[15px] flex items-center justify-center gap-2 transition-all ${
            isReady && !isAddingToCart && !isPlacingOrder
              ? "bg-transparent text-[#1a1412] hover:bg-[#1a1412]/5 active:scale-[0.98] cursor-pointer"
              : "bg-transparent text-[#a89a8a] cursor-not-allowed opacity-50"
          }`}
          aria-label="Add custom lithophane to cart"
        >
          {isAddingToCart ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4 text-[#1a1412]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="truncate">Adding...</span>
            </div>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="truncate">Add to Cart</span>
            </>
          )}
        </button>

        {/* Right Button — Buy Now */}
        <button
          type="button"
          disabled={!isReady || isAddingToCart || isPlacingOrder}
          onClick={onBuyNow}
          className={`flex-1 h-12 rounded-sm font-semibold font-sans text-[14px] sm:text-[15px] flex items-center justify-center gap-2 transition-all shadow-md ${
            isReady && !isPlacingOrder && !isAddingToCart
              ? "bg-[#e07a28] hover:bg-[#c96a1f] active:scale-[0.98] text-white cursor-pointer shadow-[0_4px_14px_rgba(224,122,40,0.32)]"
              : "bg-[#c9b99f] text-white cursor-not-allowed opacity-60 shadow-none"
          }`}
          aria-label={isReady ? "Buy now" : `Upload ${remaining} photo to order`}
        >
          {isPlacingOrder ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="truncate">Processing...</span>
            </div>
          ) : (
            <>
              <span className="truncate">Buy Now</span>
              <div className="relative w-3.5 h-3.5 shrink-0">
                <Image
                  src={ASSETS.iconArrow}
                  alt=""
                  fill
                  sizes="14px"
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
