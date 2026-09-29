"use client";

import { useState, useEffect } from "react";
import { couponApi, AvailableCoupon } from "@/lib/api";

/**
 * CouponOfferBanner — "NEW CUSTOMER OFFER" + "HAVE A COUPON?" accordion.
 * Fetches available coupons from the API and displays them in a
 * premium promotional banner matching the ICR brand design language.
 *
 * Used on the homepage (product hero) — both mobile and desktop layouts.
 */
export default function CouponOfferBanner() {
  const [coupons, setCoupons] = useState<AvailableCoupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [haveCouponOpen, setHaveCouponOpen] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    couponApi
      .listAvailable()
      .then((res) => {
        if (res.success && res.data?.coupons) {
          setCoupons(res.data.coupons);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = code;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Don't render anything while loading or if there are no coupons
  if (!isLoaded || coupons.length === 0) return null;

  // Find "welcome" / new-customer type coupons for the primary banner
  const welcomeCoupon = coupons.find(
    (c) => c.code.toUpperCase().includes("WELCOME") && !c.isUsedByUser
  );

  // Other coupons to mention in "HAVE A COUPON?" section
  const otherCoupons = coupons.filter((c) => c !== welcomeCoupon);

  // Format discount value for display
  const formatDiscount = (coupon: AvailableCoupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}%`;
    }
    return `₹${Math.round(coupon.discountValue / 100).toLocaleString("en-IN")}`;
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* ─── NEW CUSTOMER OFFER Banner ─────────────────────── */}
      {welcomeCoupon && (
        <div className="bg-[#fff1eb] border border-[#f5dbca] rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-3.5 sm:px-4 py-3">
            {/* Gift icon */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#e07a28] text-white flex items-center justify-center shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] text-[#e07a28] font-sans leading-tight">
                New Customer Offer
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[12px] sm:text-[13px] font-semibold text-[#2e1e12] font-sans">
                  Use code
                </span>
                <span className="inline-flex items-center px-2 py-0.5 bg-white border border-dashed border-[#2e1e12] rounded text-[12px] sm:text-[13px] font-mono font-bold text-[#2e1e12] tracking-wider uppercase">
                  {welcomeCoupon.code}
                </span>
              </div>
              <p className="text-[11px] sm:text-[12px] text-[#6e5c50] font-sans mt-0.5">
                Get{" "}
                <span className="font-bold text-[#2e1e12]">
                  {formatDiscount(welcomeCoupon)} OFF
                </span>{" "}
                on your first order
              </p>
            </div>

            {/* Copy Code button */}
            <button
              type="button"
              onClick={() => handleCopy(welcomeCoupon.code)}
              className="shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white border border-[#2e1e12] rounded-md text-[11px] sm:text-[12px] font-bold text-[#2e1e12] font-sans hover:bg-[#faf7f2] active:scale-95 transition-all cursor-pointer"
            >
              {copiedCode === welcomeCoupon.code ? (
                <>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1e7234"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#1e7234]">Copied!</span>
                </>
              ) : (
                <>
                  <span>Copy Code</span>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── "HAVE A COUPON?" Collapsible Section ──────────── */}
      <div className="bg-[#faf7f2] border border-[#e5ddd0] rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setHaveCouponOpen(!haveCouponOpen)}
          className="w-full flex items-center gap-3 px-3.5 sm:px-4 py-3 cursor-pointer hover:bg-[#f5efe5] transition-colors"
        >
          {/* Coupon/tag icon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#f2ebdc] text-[#e07a28] flex items-center justify-center shrink-0 border border-[#e5ddd0]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>

          <div className="flex-1 text-left min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] text-[#e07a28] font-sans leading-tight">
              Have a Coupon?
            </p>
            <p className="text-[11px] sm:text-[12px] text-[#6e5c50] font-sans mt-0.5">
              You may get additional savings with your coupon code.
            </p>
          </div>

        </button>

        {/* Collapsible content */}
        
      </div>
    </div>
  );
}
