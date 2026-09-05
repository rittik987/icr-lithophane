"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "@/lib/cart";
import { ASSETS } from "@/lib/assets";

export default function CartPage() {
  const router = useRouter();
  const { items, totalCount, subtotal, isLoaded, updateQty, remove, clear } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<CartItem | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  function toggleExpand(id: string) {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleApplyPromo() {
    setPromoError("");
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === "WELCOME10") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedPromo({ code: "WELCOME10 (10% OFF)", discount });
    } else if (code === "ICR500") {
      setAppliedPromo({ code: "ICR500 (₹500 OFF)", discount: 500 });
    } else {
      setPromoError("Invalid coupon code. Try WELCOME10 or ICR500");
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  }

  const discountAmount = appliedPromo ? Math.min(appliedPromo.discount, subtotal) : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-[#e07a28]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-[#6e5c50] text-sm font-sans">Loading your bag...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] flex flex-col">
      {/* ── Top Header ─────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#6e5c50] hover:text-[#2e1e12] font-sans text-sm font-medium transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>

          <Link href="/" className="relative w-10 h-10 shrink-0">
            <Image
              src={ASSETS.logo}
              alt="ICR Custom Creations"
              fill
              className="object-contain"
              priority
            />
          </Link>

          <div className="flex items-center gap-1 text-[#1e7234] text-xs font-semibold font-sans bg-[#eaf5ec] px-2.5 py-1 rounded-full border border-[#c6e6ca]">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.707 6.707l-4.5 4.5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l3.793-3.793a1 1 0 011.414 1.414z"/>
            </svg>
            <span>100% Secure</span>
          </div>
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
              Your Bag is Empty
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
              <span><strong>Free Insured Express Shipping</strong> unlocked! Delivery in 3-5 business days across India.</span>
            </div>

            <div className="flex items-baseline justify-between mb-6">
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#2e1e12]">
                Shopping Bag ({totalCount})
              </h1>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear your bag?")) clear();
                }}
                className="text-xs text-[#6e5c50] hover:text-[#b83a3a] transition-colors font-sans underline"
              >
                Clear all
              </button>
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
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={item.previewDataUrl}
                              alt={item.templateName}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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

                          <h3 className="text-[15px] sm:text-base font-serif font-semibold text-[#2e1e12] leading-snug mt-1 truncate">
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
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={photo.dataUrl}
                                            alt={photo.slotLabel}
                                            className="w-full h-full object-cover"
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
              </div>

              {/* Right Column: Order Summary & Checkout */}
              <div className="flex flex-col gap-4 sticky top-24">
                <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 lg:p-6 shadow-sm">
                  <h2 className="text-lg font-serif font-bold text-[#2e1e12] mb-4">
                    Order Summary
                  </h2>

                  {/* Coupon Code input */}
                  <div className="mb-4">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6e5c50] font-sans block mb-1.5">
                      Have a Promo Code?
                    </label>
                    {appliedPromo ? (
                      <div className="flex items-center justify-between bg-[#eaf5ec] border border-[#c6e6ca] rounded-xl px-3 py-2 text-xs text-[#1e7234] font-sans">
                        <span className="font-semibold">✓ {appliedPromo.code}</span>
                        <button
                          onClick={handleRemovePromo}
                          className="text-[#6e5c50] hover:text-[#b83a3a] text-xs font-bold ml-2"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. WELCOME10"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="flex-1 bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3 py-2 text-xs font-sans text-[#2e1e12] placeholder:text-[#a39485] focus:outline-none focus:border-[#e07a28]"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="bg-[#2e1e12] hover:bg-[#443021] text-white text-xs font-bold font-sans px-4 py-2 rounded-xl transition-colors shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                    {promoError && (
                      <p className="text-[11px] text-[#b83a3a] font-sans mt-1">
                        {promoError}
                      </p>
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
                        <span>Discount ({appliedPromo?.code})</span>
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
                    onClick={() => router.push("/checkout")}
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
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selectedPreviewItem.previewDataUrl}
                  alt={selectedPreviewItem.templateName}
                  className="max-h-[60vh] w-auto object-contain rounded-lg border border-[#e5ddd0] shadow-md"
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
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden backdrop-blur-md bg-[rgba(250,247,242,0.98)] border-t border-[#e5ddd0] shadow-[0_-4px_12px_rgba(46,30,18,0.08)] px-6 py-3.5"
          style={{ paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#6e5c50] font-sans block leading-none font-medium">
                Total Payable
              </span>
              <span className="text-xl font-sans font-bold text-[#e07a28] mt-0.5">
                ₹{finalTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="bg-[#e07a28] hover:bg-[#c96a1f] text-white font-bold font-sans text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-2 shrink-0"
            >
              <span>Checkout</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
