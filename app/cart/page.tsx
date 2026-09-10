"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "@/lib/cart";
import { ASSETS } from "@/lib/assets";
import { couponApi, CouponValidation } from "@/lib/api";
import { CartItemSkeleton } from "@/components/Skeleton";
import CouponDrawer from "@/components/cart/CouponDrawer";

export default function CartPage() {
  const router = useRouter();
  const { items, totalCount, subtotal, isLoaded, updateQty, remove, clear } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<CouponValidation | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [isCouponDrawerOpen, setIsCouponDrawerOpen] = useState(false);
  const [availableCouponsCount, setAvailableCouponsCount] = useState<number | null>(null);
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<CartItem | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  // Inline "clear cart" confirmation — avoids native window.confirm()
  const [confirmClear, setConfirmClear] = useState(false);

  function handleCartBack() {
    if (
      typeof window !== "undefined" &&
      window.history.length > 2 &&
      typeof document !== "undefined" &&
      !document.referrer.includes("/checkout")
    ) {
      const prev = sessionStorage.getItem("icr_prev_route");
      if (prev && prev !== "/checkout" && prev !== "/cart") {
        router.back();
        return;
      }
    }
    router.replace("/");
  }

  // Fetch count of available coupons on mount
  useEffect(() => {
    couponApi
      .listAvailable()
      .then((res) => {
        if (res.success && res.data?.coupons) {
          setAvailableCouponsCount(res.data.coupons.length);
        }
      })
      .catch(() => {});
  }, []);

  function toggleExpand(id: string) {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleApplyPromoCode(code: string): Promise<boolean> {
    setPromoError("");
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return false;

    setPromoLoading(true);
    // subtotal from useCart is in rupees (price * qty), backend expects paise
    const subtotalPaise = Math.round(subtotal * 100);
    const res = await couponApi.validate(cleanCode, subtotalPaise);
    setPromoLoading(false);

    if (res.success && res.data?.coupon) {
      setAppliedPromo(res.data);
      setPromoInput(cleanCode);
      return true;
    } else {
      const msg = res.error ?? "Invalid or expired coupon code.";
      setPromoError(msg);
      throw new Error(msg);
    }
  }

  async function handleApplyPromo() {
    try {
      await handleApplyPromoCode(promoInput);
    } catch {
      // handled inside handleApplyPromoCode
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  }

  // discountAmount from server is in paise; convert to rupees for display
  const discountAmount = appliedPromo ? appliedPromo.discountAmount / 100 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col">
        {/* Skeleton header */}
        <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0] h-16" />

        <main className="pt-20 pb-40 lg:pb-16 max-w-[1200px] mx-auto px-4 lg:px-8 w-full">
          <div className="mt-4 flex flex-col gap-4">
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] flex flex-col">
      {/* ── Top Header ─────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]">
        <div className="relative max-w-[1200px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={handleCartBack}
            className="flex items-center gap-1.5 text-[#6e5c50] hover:text-[#2e1e12] font-sans text-sm font-medium transition-colors z-10 cursor-pointer"
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>

          {/* Center: Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex items-center justify-center">
            <Link
              href="/"
              className="relative w-24 h-24 flex items-center justify-center shrink-0 block hover:opacity-90 transition-opacity"
              aria-label="ICR Custom Creations Home"
            >
              <Image
                src={ASSETS.logo}
                alt="ICR Custom Creations"
                fill
                sizes="96px"
                className="object-contain object-center"
                priority
                loading="eager"
              />
            </Link>
          </div>

          {/* Right empty spacer for balanced alignment */}
          <div className="w-12" aria-hidden="true" />
        </div>
      </header>

      {/* ── Page Body ──────────────────────────────────────── */}
      <main className="pt-20 pb-40 lg:pb-16 flex-1 max-w-[1200px] mx-auto px-4 lg:px-8 w-full">
        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#f2ebdc] flex items-center justify-center text-[#e07a28] mb-6 shadow-inner">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#2e1e12] mb-2">
              Your Cart is Empty
            </h1>
            <p className="text-[#6e5c50] text-sm font-sans mb-8 leading-relaxed">
              Looks like you haven&apos;t added any personalized lithophanes yet. Turn your cherished memories into a warm glowing keepsake!
            </p>
            <Link
              href="/customize"
              className="bg-[#e07a28] hover:bg-[#c96a1f] text-white font-bold font-sans text-sm uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-[0_4px_14px_rgba(224,122,40,0.35)] transition-all active:scale-[0.98]"
            >
              Start Customizing
            </Link>
          </div>
        ) : (
          /* Populated Cart */
          <div className="mt-4">
            {/* Shipping Banner */}
            <div className="bg-[#eaf5ec] border border-[#c6e6ca] rounded-xl px-4 py-2.5 mb-6 flex items-center gap-2.5 text-xs text-[#1e7234] font-medium font-sans">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#1e7234]">
                <rect x="1" y="4" width="12" height="11" rx="1"/>
                <path d="M13 8h3l3 3v4h-6V8z"/>
                <circle cx="5.5" cy="15.5" r="2"/>
                <circle cx="15.5" cy="15.5" r="2"/>
              </svg>
              <span><strong>Free Insured Express Shipping</strong> unlocked! Delivery in 5–7 business days across India.</span>
            </div>

            <div className="flex items-baseline justify-between mb-6">
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#2e1e12]">
                Shopping Cart ({totalCount})
              </h1>
              {/* Inline clear confirmation — no native window.confirm() */}
              {confirmClear ? (
                <div className="flex items-center gap-2 text-xs font-sans">
                  <span className="text-[#6e5c50]">Clear all items?</span>
                  <button
                    onClick={() => { clear(); setConfirmClear(false); }}
                    className="text-[#b83a3a] font-bold hover:underline"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="text-[#6e5c50] font-medium hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="text-xs text-[#6e5c50] hover:text-[#b83a3a] transition-colors font-sans underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
              {/* Left Column: Cart Items List */}
              <div className="flex flex-col gap-4">
                {items.map((item) => {
                  const isExpanded = !!expandedDetails[item.id];
                  const photoList = Object.values(item.photos || {});
                  const textList = Object.values(item.texts || {});

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-[#e5ddd0] rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md"
                    >
                      {/* Top row: Thumbnail + Details + Remove Button */}
                      <div className="flex gap-3.5 sm:gap-4 items-start">
                        {/* Lithophane Preview Thumbnail */}
                        <div
                          onClick={() => setSelectedPreviewItem(item)}
                          className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-[#e5ddd0] bg-[#fffdf8] shrink-0 cursor-zoom-in group shadow-inner"
                          title="Click to view full preview"
                        >
                          {item.previewDataUrl ? (
                            <Image
                              src={item.previewDataUrl}
                              alt={item.templateName}
                              fill
                              sizes="(max-width: 640px) 80px, 112px"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#6e5c50] text-xs">
                              Preview
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-sans font-medium gap-1">
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="6.5" cy="6.5" r="4.5"/>
                              <path d="M10 10l4 4"/>
                            </svg>
                            <span>Zoom</span>
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="inline-block bg-[#f2ebdc] text-[#5a3a1a] text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                              {item.templateName}
                            </span>

                            {/* Remove Button */}
                            <button
                              onClick={() => remove(item.id)}
                              aria-label="Remove item"
                              className="text-[#8c786a] hover:text-[#b83a3a] p-1 rounded-lg hover:bg-[#faf7f2] transition-colors shrink-0"
                            >
                              <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                                <path d="M4 6h12M8 6V4a1 1 0 011-1h2a1 1 0 011 1v2m3 0v11a2 2 0 01-2 2H7a2 2 0 01-2-2V6h10z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>

                          <h3 className="text-[15px] sm:text-base font-serif font-semibold text-[#2e1e12] leading-snug mt-1 break-words">
                            Personalized Lithophane Lamp
                          </h3>
                          <p className="text-xs text-[#6e5c50] font-sans mt-0.5">
                            20×15cm · Solid Walnut Base · Warm LED
                          </p>
                        </div>
                      </div>

                      {/* Full-width bottom row: Quantity Selector on left, Price on right with ample spacing */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f2ebdc]">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-[#e5ddd0] rounded-lg bg-[#faf7f2] overflow-hidden shadow-xs">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center text-[#2e1e12] hover:bg-[#ede5d6] active:bg-[#e0d6c4] font-sans text-sm font-bold transition-colors"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold font-sans text-[#2e1e12]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-[#2e1e12] hover:bg-[#ede5d6] active:bg-[#e0d6c4] font-sans text-sm font-bold transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Price — clean normal sans font, no serif slant */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-base sm:text-lg font-sans font-bold text-[#2e1e12] tracking-tight">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-[#8c786a] line-through font-sans">
                            ₹{(item.originalPrice * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Customization Details Dropdown */}
                      {(photoList.length > 0 || textList.length > 0) && (
                        <div className="mt-3 pt-3 border-t border-[#f0e8dc]">
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center justify-between w-full text-left text-xs font-medium text-[#6e5c50] hover:text-[#2e1e12] transition-colors py-1"
                          >
                            <span className="flex items-center gap-1.5 font-sans">
                              <span>Customization details ({photoList.length} photos{textList.length > 0 ? `, ${textList.length} texts` : ""})</span>
                            </span>
                            <svg
                              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>

                          {isExpanded && (
                            <div className="mt-3 bg-[#faf7f2] rounded-xl p-3 text-xs font-sans flex flex-col gap-3 border border-[#f0e8dc]">
                              {/* Photos list */}
                              {photoList.length > 0 && (
                                <div>
                                  <span className="font-semibold text-[#5a3a1a] block mb-2">
                                    Uploaded Photos:
                                  </span>
                                  <div className="grid grid-cols-3 gap-2">
                                    {photoList.map((photo) => (
                                      <div key={photo.slotId} className="flex flex-col items-center text-center gap-1">
                                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-[#e5ddd0] bg-white">
                                          <Image
                                            src={photo.dataUrl}
                                            alt={photo.slotLabel}
                                            fill
                                            sizes="80px"
                                            className="w-full h-full object-cover"
                                            unoptimized
                                          />
                                        </div>
                                        <span className="text-[10px] text-[#6e5c50] truncate w-full">
                                          {photo.slotLabel}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Texts list */}
                              {textList.length > 0 && (
                                <div className="border-t border-[#e5ddd0] pt-2">
                                  <span className="font-semibold text-[#5a3a1a] block mb-1">
                                    Custom Engraved Texts:
                                  </span>
                                  <ul className="flex flex-col gap-1 text-[11px] text-[#2e1e12]">
                                    {textList.map((txt) => (
                                      <li key={txt.fieldId} className="flex items-baseline justify-between gap-2">
                                        <span className="text-[#6e5c50]">{txt.label}:</span>
                                        <span className="font-medium italic text-right">&ldquo;{txt.value}&rdquo;</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                <Link
                  href="/customize"
                  className="self-start text-xs font-bold font-sans text-[#e07a28] hover:text-[#c96a1f] flex items-center gap-1.5 mt-2 transition-colors"
                >
                  <span>+ Customize another lithophane</span>
                </Link>

                {/* ── Offers & Coupons Card (Zepto / Blinkit style) ──────── */}
                <section aria-label="Available offers and coupons" className="mt-2.5">
                  {!appliedPromo ? (
                    <div
                      onClick={() => setIsCouponDrawerOpen(true)}
                      className="bg-white border border-[#e5ddd0] hover:border-[#e07a28]/60 active:bg-[#fbf7f0] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#fdf2e8] text-[#e07a28] flex items-center justify-center shrink-0 border border-[#f5dbca]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-[#2e1e12] leading-tight">
                              Avail Offers / Coupons
                            </span>
                            {availableCouponsCount !== null && availableCouponsCount > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#fdf0e6] text-[#e07a28] border border-[#f8dec8] leading-none shrink-0">
                                {availableCouponsCount} available
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs text-[#6e5c50] font-sans mt-0.5 leading-tight truncate">
                            Save more with discount coupons
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCouponDrawerOpen(true);
                        }}
                        className="flex items-center gap-0.5 text-xs font-bold text-[#e07a28] group-hover:translate-x-0.5 transition-transform shrink-0 font-sans cursor-pointer whitespace-nowrap pl-1"
                      >
                        <span>View Coupons</span>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0">
                          <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#f0f9f2] border border-[#bfe5c6] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-2.5 shadow-2xs animate-fadeIn">
                      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#e0f3e4] text-[#1e7234] flex items-center justify-center shrink-0 border border-[#bfe5c6]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#1e7234] flex items-center gap-1.5">
                            <span>{appliedPromo.coupon.code} applied</span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-[#2e6e3c] font-sans font-medium leading-tight truncate">
                            You saved ₹{(appliedPromo.discountAmount / 100).toLocaleString("en-IN")} on this order
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsCouponDrawerOpen(true)}
                          className="text-xs font-bold text-[#6e5c50] hover:text-[#2e1e12] underline font-sans cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-xs font-bold text-[#b83a3a] hover:bg-[#fdeeee] px-2 py-1 rounded-lg transition-colors font-sans cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* ── Mobile Bill Details (Visible on < lg screens) ──────── */}
                <div className="lg:hidden bg-white border border-[#e5ddd0] rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col gap-3 mt-2.5">
                  <h2 className="text-sm font-serif font-bold text-[#2e1e12]">
                    Bill Details
                  </h2>

                  <div className="flex flex-col gap-2.5 text-xs font-sans text-[#6e5c50]">
                    <div className="flex justify-between items-center">
                      <span>Items Total ({totalCount} {totalCount === 1 ? "item" : "items"})</span>
                      <span className="text-[#2e1e12] font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-[#1e7234]">
                        <span>Coupon Discount ({appliedPromo?.coupon.code})</span>
                        <span className="font-semibold">-₹{discountAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span>Custom Wood Crafting &amp; LED</span>
                      <span className="text-[#1e7234] font-semibold uppercase text-[11px]">FREE</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Insured Express Shipping</span>
                      <span className="text-[#1e7234] font-semibold uppercase text-[11px]">FREE</span>
                    </div>

                    <div className="border-t border-[#f2ebdc] pt-2.5 mt-1 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-[#2e1e12]">To Pay</span>
                      <div className="text-right">
                        <span className="text-base font-bold font-sans text-[#e07a28]">
                          ₹{finalTotal.toLocaleString("en-IN")}
                        </span>
                        <span className="block text-[9px] text-[#6e5c50] font-sans">
                          (Inclusive of all taxes)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Checkout */}
              <div className="hidden lg:flex flex-col gap-4 sticky top-24">
                <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 lg:p-6 shadow-sm">
                  <h2 className="text-lg font-serif font-bold text-[#2e1e12] mb-4">
                    Order Summary
                  </h2>

                  {/* Coupon Section */}
                  <div className="mb-4">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6e5c50] font-sans block mb-1.5">
                      Coupons &amp; Offers
                    </label>
                    {appliedPromo ? (
                      <div className="flex items-center justify-between bg-[#eaf5ec] border border-[#c6e6ca] rounded-xl px-3 py-2.5 text-xs text-[#1e7234] font-sans">
                        <div>
                          <span className="font-semibold block">✓ {appliedPromo.coupon.code} applied</span>
                          <span className="text-[11px] text-[#2e6e3c]">Saving ₹{(appliedPromo.discountAmount / 100).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            type="button"
                            onClick={() => setIsCouponDrawerOpen(true)}
                            className="text-xs font-bold text-[#6e5c50] hover:text-[#2e1e12] underline cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={handleRemovePromo}
                            className="text-[#b83a3a] hover:text-[#901c1c] text-xs font-bold cursor-pointer"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsCouponDrawerOpen(true)}
                        className="w-full bg-[#fdfbf7] hover:bg-[#fbf4ea] border border-dashed border-[#e07a28]/60 hover:border-[#e07a28] rounded-xl px-3 py-2.5 text-left flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#e07a28]">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                          </svg>
                          <span className="text-xs font-bold text-[#2e1e12] font-sans">Avail Offers / Coupons</span>
                        </div>
                        <span className="text-xs font-bold text-[#e07a28] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          View &gt;
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="flex flex-col gap-2.5 text-sm font-sans border-t border-[#f2ebdc] pt-4">
                    <div className="flex justify-between text-[#6e5c50]">
                      <span>Subtotal ({totalCount} items)</span>
                      <span className="text-[#2e1e12] font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[#1e7234]">
                        <span>Discount ({appliedPromo?.coupon.code})</span>
                        <span className="font-semibold">-₹{discountAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#6e5c50]">
                      <span>Custom Wood Crafting & LED</span>
                      <span className="text-[#1e7234] font-semibold uppercase text-xs">FREE</span>
                    </div>

                    <div className="flex justify-between text-[#6e5c50]">
                      <span>Insured Express Shipping</span>
                      <span className="text-[#1e7234] font-semibold uppercase text-xs">FREE</span>
                    </div>

                    <div className="border-t border-[#e5ddd0] pt-3 mt-1 flex justify-between items-baseline">
                      <span className="text-base font-bold text-[#2e1e12]">Total Amount</span>
                      <div className="text-right">
                        <span className="text-2xl font-sans font-bold text-[#e07a28]">
                          ₹{finalTotal.toLocaleString("en-IN")}
                        </span>
                        <span className="block text-[10px] text-[#6e5c50] font-sans">
                          (Inclusive of all taxes)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={() => router.push(`/checkout${appliedPromo ? `?coupon=${appliedPromo.coupon.code}` : ""}`)}
                    className="w-full mt-6 bg-[#e07a28] hover:bg-[#c96a1f] text-white font-bold font-sans text-sm uppercase tracking-wider py-4 rounded-xl shadow-[0_4px_14px_rgba(224,122,40,0.35)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                  >
                    <span>Proceed to Checkout</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* Trust badges */}
                  <div className="mt-5 pt-4 border-t border-[#f2ebdc] flex flex-col gap-2.5 text-[11px] text-[#6e5c50] font-sans">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#e07a28] shrink-0">
                        <path d="M2 3h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <span>100% Genuine Solid Walnut Wood Base</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#e07a28] shrink-0">
                        <path d="M8 1.5l6 2.5v4.5c0 4-2.5 6.5-6 7.5-3.5-1-6-3.5-6-7.5V4l6-2.5z" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <span>Free Breakage Replacement in Transit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#e07a28] shrink-0">
                        <rect x="3" y="6" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M5 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <span>Razorpay &amp; UPI Verified Secure Payments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Lightbox Modal for Lithophane Preview ────────────── */}
      {selectedPreviewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPreviewItem(null)}
        >
          <div
            className="bg-[#faf7f2] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5ddd0]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#2e1e12]">
                  {selectedPreviewItem.templateName}
                </h3>
                <p className="text-xs text-[#6e5c50] font-sans">
                  Composite Lithophane Preview
                </p>
              </div>
              <button
                onClick={() => setSelectedPreviewItem(null)}
                className="w-8 h-8 rounded-lg hover:bg-[#ede5d6] flex items-center justify-center text-[#2e1e12]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex items-center justify-center bg-[#fffdf8]">
              {selectedPreviewItem.previewDataUrl && (
                <Image
                  src={selectedPreviewItem.previewDataUrl}
                  alt={selectedPreviewItem.templateName}
                  width={600}
                  height={600}
                  className="max-h-[60vh] w-auto object-contain rounded-lg border border-[#e5ddd0] shadow-md"
                  unoptimized
                />
              )}
            </div>

            <div className="p-4 border-t border-[#e5ddd0] flex justify-end">
              <button
                onClick={() => setSelectedPreviewItem(null)}
                className="bg-[#2e1e12] text-white px-5 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Sticky Checkout Bar ──────────────────────── */}
      {items.length > 0 && (
        <aside
          aria-label="Mobile checkout bar"
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden backdrop-blur-md bg-[rgba(250,247,242,0.98)] border-t border-[#e5ddd0] shadow-[0_-4px_16px_rgba(46,30,18,0.08)] px-4 py-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
        >
          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#6e5c50] font-sans block leading-none font-medium">
                Total Payable
              </span>
              <span className="text-xl font-sans font-bold text-[#e07a28] mt-1 leading-none">
                ₹{finalTotal.toLocaleString("en-IN")}
              </span>
              {discountAmount > 0 && (
                <span className="text-[10px] text-[#1e7234] font-sans font-bold mt-1">
                  Saved ₹{discountAmount.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <button
              onClick={() => router.push(`/checkout${appliedPromo ? `?coupon=${appliedPromo.coupon.code}` : ""}`)}
              className="bg-[#e07a28] hover:bg-[#c96a1f] text-white font-bold font-sans text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Checkout</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </aside>
      )}

      {/* ── Coupon Drawer / Bottom Sheet (Zepto / Blinkit style) ── */}
      <CouponDrawer
        isOpen={isCouponDrawerOpen}
        onClose={() => setIsCouponDrawerOpen(false)}
        subtotal={subtotal}
        appliedCouponCode={appliedPromo?.coupon.code ?? null}
        onApplyCoupon={handleApplyPromoCode}
        onRemoveCoupon={handleRemovePromo}
      />
    </div>
  );
}
