"use client";

import React, { useState, useEffect, useCallback } from "react";
import { couponApi, AvailableCoupon } from "@/lib/api";

interface CouponDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number; // in rupees
  appliedCouponCode: string | null;
  onApplyCoupon: (code: string) => Promise<boolean>;
  onRemoveCoupon: () => void;
}

export default function CouponDrawer({
  isOpen,
  onClose,
  subtotal,
  appliedCouponCode,
  onApplyCoupon,
  onRemoveCoupon,
}: CouponDrawerProps) {
  const [coupons, setCoupons] = useState<AvailableCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState<string | null>(null); // holds coupon code being applied
  const [errorMsg, setErrorMsg] = useState("");

  const subtotalPaise = Math.round(subtotal * 100);

  // Fetch available coupons when drawer opens
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg("");
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg("");

    couponApi
      .listAvailable()
      .then((res) => {
        if (isMounted && res.success && res.data?.coupons) {
          setCoupons(res.data.coupons);
        }
      })
      .catch((err) => {
        console.error("Failed to load available coupons:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animateIn, setAnimateIn] = useState(false);

  // Smooth entrance & exit transitions
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateIn(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleApply = async (codeToApply: string) => {
    const cleanCode = codeToApply.trim().toUpperCase();
    if (!cleanCode) return;

    setErrorMsg("");
    setIsApplying(cleanCode);

    try {
      const success = await onApplyCoupon(cleanCode);
      if (success) {
        onClose();
      } else {
        setErrorMsg("Coupon could not be applied. Please check the code or requirements.");
      }
    } catch (err: unknown) {
      const errString = err instanceof Error ? err.message : "Failed to apply coupon";
      setErrorMsg(errString);
    } finally {
      setIsApplying(null);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          animateIn ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-0 sm:p-4 pointer-events-none">
        {/* Drawer Panel with smooth slide-up */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Apply Coupon"
          className={`pointer-events-auto w-full sm:max-w-md bg-[#faf7f2] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[82vh] border border-[#e5ddd0] transition-all duration-300 ease-out transform ${
            animateIn
              ? "translate-y-0 opacity-100 sm:scale-100"
              : "translate-y-full opacity-0 sm:translate-y-4 sm:scale-95"
          }`}
        >
          {/* Mobile Handle Indicator */}
          <div className="w-10 h-1 rounded-full bg-[#d5c7b5] mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

          {/* Header */}
          <div className="px-5 pt-3 pb-3 border-b border-[#e5ddd0] flex items-center justify-between shrink-0 bg-white sm:rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#fdf2e8] text-[#e07a28] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2e1e12]">
                Apply Coupon
              </h2>
            </div>

            <button
              onClick={onClose}
              aria-label="Close coupons drawer"
              className="w-8 h-8 rounded-full bg-[#f2ebdc] hover:bg-[#e8decb] text-[#6e5c50] flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4 overscroll-contain">
            {/* Input field */}
            <div className="bg-white border border-[#e5ddd0] rounded-xl p-2 flex items-center gap-2 shadow-2xs">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApply(couponInput);
                }}
                className="flex-1 px-2.5 py-1.5 text-xs sm:text-sm font-sans font-semibold text-[#2e1e12] placeholder:text-[#a39485] placeholder:font-normal uppercase tracking-wider focus:outline-none bg-transparent"
              />
              <button
                type="button"
                disabled={!couponInput.trim() || isApplying !== null}
                onClick={() => handleApply(couponInput)}
                className="bg-[#2e1e12] hover:bg-[#443021] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold font-sans px-4 py-2 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                {isApplying === couponInput.trim() ? "..." : "APPLY"}
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-[#fdf2f2] border border-[#f5c6cb] text-[#901c1c] text-xs px-3.5 py-2.5 rounded-xl font-sans flex items-center justify-between animate-fadeIn">
                <span>{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => setErrorMsg("")}
                  className="text-[#901c1c] font-bold text-sm ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Available Coupons Header */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e5c50] font-sans">
                Available Coupons
              </span>
              <span className="text-xs text-[#8c7b6d] font-sans">
                {coupons.length} {coupons.length === 1 ? "offer" : "offers"}
              </span>
            </div>

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#e5ddd0] rounded-xl p-4 animate-pulse space-y-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-24 bg-[#ede5d6] rounded-md" />
                      <div className="h-6 w-16 bg-[#ede5d6] rounded-md" />
                    </div>
                    <div className="h-4 w-40 bg-[#f2ebdc] rounded" />
                    <div className="h-3 w-56 bg-[#f2ebdc] rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Coupons List */}
            {!isLoading && (
              <div className="flex flex-col gap-3">
                {coupons.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-white rounded-xl border border-[#e5ddd0] text-[#6e5c50]">
                    <div className="w-12 h-12 rounded-full bg-[#f2ebdc] text-[#e07a28] flex items-center justify-center mx-auto mb-2.5">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-[#2e1e12] mb-1">
                      No public coupons available
                    </p>
                    <p className="text-[11px] text-[#8c7b6d]">
                      If you have an exclusive coupon code, enter it above to apply.
                    </p>
                  </div>
                ) : (
                  coupons.map((coupon) => {
                    const isApplied = appliedCouponCode?.toUpperCase() === coupon.code.toUpperCase();
                    const isEligible = subtotalPaise >= coupon.minOrderAmount;
                    const shortfallRupees = Math.ceil((coupon.minOrderAmount - subtotalPaise) / 100);

                    return (
                      <div
                        key={coupon.id}
                        className={`relative bg-white rounded-xl p-4 border transition-all ${
                          isApplied
                            ? "border-[#2b8a3e] bg-[#f8fdf9] shadow-xs"
                            : "border-[#e5ddd0] hover:border-[#dfd2c0] shadow-2xs"
                        }`}
                      >
                        {/* Ticket decorative notch on left edge */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-2.5 py-1 bg-[#fdf2e8] text-[#e07a28] font-mono font-bold text-xs rounded-lg border border-[#f5dbca] tracking-wider uppercase">
                              {coupon.code}
                            </span>
                            {isApplied && (
                              <span className="text-[11px] font-bold text-[#2b8a3e] bg-[#eaf5ec] px-2 py-0.5 rounded-full border border-[#c6e6ca]">
                                ✓ Applied
                              </span>
                            )}
                          </div>

                          {/* Action button */}
                          {isApplied ? (
                            <button
                              type="button"
                              onClick={() => {
                                onRemoveCoupon();
                              }}
                              className="text-xs font-bold text-[#b83a3a] hover:text-[#901c1c] px-3 py-1 rounded-lg border border-[#f5c6cb] hover:bg-[#fdf2f2] transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          ) : isEligible ? (
                            <button
                              type="button"
                              disabled={isApplying === coupon.code}
                              onClick={() => handleApply(coupon.code)}
                              className="text-xs font-bold text-[#e07a28] hover:text-[#c96a1f] px-3.5 py-1.5 rounded-lg border border-[#e07a28] hover:bg-[#fdf2e8] active:scale-95 transition-all cursor-pointer font-sans"
                            >
                              {isApplying === coupon.code ? "..." : "APPLY"}
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-[#8c7b6d] bg-[#f2ebdc] px-2.5 py-1 rounded-lg">
                              Ineligible
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div className="mb-2">
                          <p className="text-xs sm:text-sm font-bold text-[#2e1e12] font-sans">
                            {coupon.discountType === "PERCENTAGE"
                              ? `Save ${coupon.discountValue}% ${
                                  coupon.maxDiscount
                                    ? `up to ₹${(coupon.maxDiscount / 100).toLocaleString("en-IN")}`
                                    : ""
                                }`
                              : `Flat ₹${(coupon.discountValue / 100).toLocaleString("en-IN")} OFF`}
                          </p>
                          {coupon.description && (
                            <p className="text-[11px] sm:text-xs text-[#6e5c50] font-sans mt-0.5 leading-relaxed">
                              {coupon.description}
                            </p>
                          )}
                        </div>

                        {/* Bottom terms */}
                        <div className="pt-2 border-t border-[#f2ebdc] flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px] text-[#8c7b6d] font-sans">
                          {coupon.minOrderAmount > 0 ? (
                            <span>
                              Min order: ₹{(coupon.minOrderAmount / 100).toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span>No minimum order required</span>
                          )}

                          {!isEligible && (
                            <span className="text-[#b83a3a] font-medium">
                              Add items worth ₹{shortfallRupees.toLocaleString("en-IN")} more to unlock
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
