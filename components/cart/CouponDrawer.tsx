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
          className={`pointer-events-auto w-full sm:max-w-md bg-[#faf7f2] rounded-t-xl sm:rounded-sm shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[82vh] border border-[#e5ddd0] transition-all duration-300 ease-out transform ${
            animateIn
              ? "translate-y-0 opacity-100 sm:scale-100"
              : "translate-y-full opacity-0 sm:translate-y-4 sm:scale-95"
          }`}
        >
          {/* Mobile Handle Indicator */}
          <div className="w-10 h-1 rounded-full bg-[#d5c7b5] mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

          {/* Header — unified seamless background */}
          <div className="px-5 pt-2.5 pb-3 border-b border-[#e8ded1] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-[#fdf2e8] text-[#e07a28] flex items-center justify-center border border-[#f5dbca] shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-[#2e1e12] leading-tight">
                  Offers &amp; Coupons
                </h2>
                <p className="text-[11px] text-[#8c786a] font-sans">
                  Apply discounts &amp; promo codes
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close coupons drawer"
              className="w-7 h-7 rounded-sm hover:bg-[#ede3d5] text-[#6e5c50] hover:text-[#2e1e12] flex items-center justify-center transition-colors cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4 overscroll-contain">
            {/* Input field with dynamic apply CTA */}
            <div className="bg-white border border-[#ded4c5] focus-within:border-[#e07a28] focus-within:ring-1 focus-within:ring-[#e07a28]/30 rounded-sm p-1.5 flex items-center gap-2 shadow-2xs transition-all">
              <div className="pl-2 text-[#a39485] shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
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
                className="flex-1 px-1 py-1.5 text-xs sm:text-sm font-mono font-semibold text-[#2e1e12] placeholder:text-[#a39485] placeholder:font-sans placeholder:font-normal uppercase tracking-wider focus:outline-none bg-transparent"
              />
              <button
                type="button"
                disabled={!couponInput.trim() || isApplying !== null}
                onClick={() => handleApply(couponInput)}
                className={`text-xs font-bold font-sans px-4 py-2 rounded-sm transition-all shrink-0 cursor-pointer ${
                  couponInput.trim()
                    ? "bg-[#e07a28] hover:bg-[#c96a1f] text-white shadow-2xs active:scale-95"
                    : "bg-[#ede5d8] text-[#9c8c7c] cursor-not-allowed opacity-80"
                }`}
              >
                {isApplying === couponInput.trim() ? "..." : "Apply"}
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-[#fdf2f2] border border-[#f5c6cb] text-[#901c1c] text-xs px-3.5 py-2.5 rounded-sm font-sans flex items-center justify-between animate-fadeIn">
                <span>{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => setErrorMsg("")}
                  className="text-[#901c1c] font-bold text-sm ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Available Coupons Header */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e5c50] font-sans">
                Available Offers
              </span>
              <span className="text-xs text-[#8c7b6d] font-sans font-medium">
                {coupons.length} {coupons.length === 1 ? "offer" : "offers"}
              </span>
            </div>

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#e5ddd0] rounded-sm p-4 animate-pulse space-y-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-24 bg-[#ede5d6] rounded-sm" />
                      <div className="h-6 w-16 bg-[#ede5d6] rounded-sm" />
                    </div>
                    <div className="h-4 w-40 bg-[#f2ebdc] rounded-sm" />
                    <div className="h-3 w-56 bg-[#f2ebdc] rounded-sm" />
                  </div>
                ))}
              </div>
            )}

            {/* Coupons List — Voucher Ticket Cards */}
            {!isLoading && (
              <div className="flex flex-col gap-3">
                {coupons.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-white rounded-sm border border-[#e5ddd0] text-[#6e5c50]">
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

                    // Formulate non-redundant title & description
                    const titleText = coupon.discountType === "PERCENTAGE"
                      ? `Save ${coupon.discountValue}% ${
                          coupon.maxDiscount
                            ? `up to ₹${(coupon.maxDiscount / 100).toLocaleString("en-IN")}`
                            : ""
                        }`
                      : `Flat ₹${(coupon.discountValue / 100).toLocaleString("en-IN")} OFF`;

                    // Generate clean description if backend description is redundant
                    const hasUniqueDesc = coupon.description &&
                      !coupon.description.toLowerCase().includes("flat discount") &&
                      coupon.description.trim().toLowerCase() !== titleText.toLowerCase();

                    const displayDesc = hasUniqueDesc
                      ? coupon.description
                      : coupon.discountType === "PERCENTAGE"
                        ? `Get ${coupon.discountValue}% instant savings at checkout`
                        : `Save ₹${(coupon.discountValue / 100).toLocaleString("en-IN")} instantly on your order`;

                    return (
                      <div
                        key={coupon.id}
                        className={`relative bg-white rounded-sm p-4 border transition-all overflow-hidden ${
                          isApplied
                            ? "border-[#2b8a3e] bg-[#f8fdf9] shadow-xs"
                            : "border-[#e5ddd0] hover:border-[#dbcbb7] shadow-2xs"
                        }`}
                      >
                        {/* Decorative ticket left accent strip */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${
                            isApplied ? "bg-[#2b8a3e]" : "bg-[#e07a28]"
                          }`}
                        />

                        {/* Top row: Code Badge + Action Button */}
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-block px-2.5 py-1 bg-[#fff8f2] text-[#c96a1f] font-mono font-bold text-xs rounded-sm border border-dashed border-[#e07a28]/60 tracking-wider uppercase">
                              {coupon.code}
                            </span>
                            {isApplied && (
                              <span className="text-[11px] font-bold text-[#2b8a3e] bg-[#eaf5ec] px-2 py-0.5 rounded-sm border border-[#c6e6ca] flex items-center gap-1">
                                ✓ Applied
                              </span>
                            )}
                          </div>

                          {/* Action button with real button affordance */}
                          {isApplied ? (
                            <button
                              type="button"
                              onClick={() => {
                                onRemoveCoupon();
                              }}
                              className="text-xs font-bold text-[#b83a3a] hover:text-[#901c1c] px-3 py-1 rounded-sm border border-[#f5c6cb] hover:bg-[#fdf2f2] transition-colors cursor-pointer font-sans"
                            >
                              Remove
                            </button>
                          ) : isEligible ? (
                            <button
                              type="button"
                              disabled={isApplying === coupon.code}
                              onClick={() => handleApply(coupon.code)}
                              className="text-xs font-bold text-[#e07a28] hover:text-white bg-[#fff8f2] hover:bg-[#e07a28] px-3.5 py-1.5 rounded-sm border border-[#e07a28] active:scale-95 transition-all cursor-pointer font-sans shadow-2xs"
                            >
                              {isApplying === coupon.code ? "Applying..." : "APPLY"}
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-[#8c7b6d] bg-[#f2ebdc] px-2.5 py-1 rounded-sm">
                              Ineligible
                            </span>
                          )}
                        </div>

                        {/* Title & Non-redundant Description */}
                        <div className="mb-2">
                          <h3 className="text-sm font-bold text-[#2e1e12] font-sans leading-snug">
                            {titleText}
                          </h3>
                          <p className="text-xs text-[#6e5c50] font-sans mt-0.5 leading-relaxed">
                            {displayDesc}
                          </p>
                        </div>

                        {/* Bottom terms with dashed voucher separator */}
                        <div className="pt-2.5 border-t border-dashed border-[#ebe0d2] flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-[#8c7b6d] font-sans">
                          {coupon.minOrderAmount > 0 ? (
                            <span>
                              Min. order: ₹{(coupon.minOrderAmount / 100).toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span>No minimum order required</span>
                          )}

                          {!isEligible && (
                            <span className="text-[#b83a3a] font-medium">
                              Add ₹{shortfallRupees.toLocaleString("en-IN")} more to unlock
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
