"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";
import { useAuth } from "@/context/AuthContext";
import { orderApi, ServerOrder } from "@/lib/api";

function formatRupees(paiseOrRupees: number): string {
  const rupees = paiseOrRupees > 50000 ? Math.round(paiseOrRupees / 100) : paiseOrRupees;
  return `₹${rupees.toLocaleString("en-IN")}`;
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

interface ModalPhotoState {
  url: string;
  slotLabel: string;
  dimensions?: string;
  fileName?: string;
  templateName?: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [order, setOrder] = useState<ServerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  // In-App Photo Modal with warm brand schema (NO BLACK BACKGROUND)
  const [activePhoto, setActivePhoto] = useState<ModalPhotoState | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setActivePhoto(null);
    }
    if (activePhoto) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [activePhoto]);

  // Guard: Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user && orderId) {
      router.replace(`/login?redirect=/orders/${orderId}`);
    }
  }, [isAuthLoading, user, router, orderId]);

  // Fetch Order details
  useEffect(() => {
    if (!user || !orderId) return;

    let mounted = true;
    setIsLoading(true);
    setErrorMessage("");

    orderApi
      .getOrder(orderId)
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data?.order) {
          setOrder(res.data.order);
        } else {
          setErrorMessage(res.error || "Order not found.");
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setErrorMessage(err instanceof Error ? err.message : "Failed to load order details.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user, orderId]);

  const handleCopyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-8 h-8 border-2 border-[#D47124] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-[#786F66] uppercase font-sans">
            Loading Account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1412] flex flex-col font-sans antialiased selection:bg-[#FED7AA] selection:text-[#92400E]">
      {/* ── Precision Header ─────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[#FAF9F6]/90 border-b border-[#EAE4DC] transition-all">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6059] hover:text-[#1A1412] transition-colors py-1.5 px-2.5 -ml-2 rounded-lg hover:bg-black/[0.03]"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Orders</span>
          </Link>

          <Link href="/" className="relative w-12 h-9 shrink-0 opacity-95 hover:opacity-100 transition-opacity">
            <Image
              src={ASSETS.logo}
              alt="ICR Custom Creations"
              fill
              className="object-contain"
              priority
            />
          </Link>

          <Link
            href="/cart"
            className="text-xs font-bold text-[#D47124] hover:text-[#BA5D17] transition-colors py-1.5 px-2.5 -mr-2 rounded-lg hover:bg-[#D47124]/5"
          >
            Bag
          </Link>
        </div>
      </header>

      {/* ── Main Order Inspection View ───────────────────────── */}
      <main className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 w-full flex-1">
        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-6 bg-[#FEF2F2] border border-[#FCA5A5]/40 text-[#991B1B] text-xs sm:text-sm p-4 rounded-2xl flex items-center justify-between shadow-xs">
            <span>{errorMessage}</span>
            <Link href="/orders" className="font-semibold underline text-xs ml-3 hover:opacity-80">
              Return to Orders
            </Link>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-8 h-8 border-2 border-[#D47124] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-[#786F66]">Retrieving order details...</p>
          </div>
        ) : !order ? (
          <div className="bg-white border border-[#EAE4DC] rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto my-8 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-[#1A1412] mb-2">Order Not Found</h2>
            <p className="text-xs text-[#786F66] mb-6 leading-relaxed">
              The order you are looking for does not exist or belongs to a different account.
            </p>
            <Link
              href="/orders"
              className="bg-[#D47124] hover:bg-[#BA5D17] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl inline-block transition-all shadow-sm"
            >
              View My Orders
            </Link>
          </div>
        ) : (
          /* ── Human-Crafted Detailed Order View ──────────────── */
          <div className="flex flex-col gap-6">
            {/* Top Order Metadata Card */}
            <article className="bg-white border border-[#EAE4DC] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_4px_24px_-4px_rgba(46,30,18,0.04)] flex flex-col gap-6">
              {/* Order Identification Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F0EAE1]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm sm:text-base font-bold text-[#1A1412] tracking-tight">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOrderId}
                      className="text-[11px] text-[#786F66] hover:text-[#1A1412] bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#EAE4DC] px-2 py-0.5 rounded-md transition-colors"
                      title="Copy full order ID"
                    >
                      {copiedId ? "Copied" : "Copy ID"}
                    </button>
                    <span className="text-[#C4BCB3]">·</span>
                    <span className="text-xs text-[#786F66]">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#786F66] mt-1 font-mono break-all hidden sm:block">
                    Full Reference: {order.id}
                  </p>
                </div>

                <div className="self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
                    <span>{order.status}</span>
                  </span>
                </div>
              </div>

              {/* ── Shipment & Production Status ──────────────── */}
              <div className="bg-[#FAF8F5] border border-[#EAE4DC] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F3EFE9] text-[#786F66] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  </div>

                  <div>
                    {order.trackingUrl ? (
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#1A1412]">
                        <span>Dispatched via {order.courierName || "Courier"}</span>
                        {order.trackingNumber && (
                          <span className="font-mono text-[11px] text-[#786F66]">
                            · AWB: {order.trackingNumber}
                          </span>
                        )}
                      </div>
                    ) : (
                      /* Exact text requested */
                      <span className="text-xs sm:text-sm font-semibold text-[#1A1412]">
                        Tracking link will be sharing soon
                      </span>
                    )}
                    <p className="text-[11px] text-[#786F66] mt-0.5 leading-relaxed">
                      Each lithophane lamp is precision 3D laser-engraved and handcrafted in 2–4 business days.
                    </p>
                  </div>
                </div>

                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 bg-[#D47124] hover:bg-[#BA5D17] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-auto"
                  >
                    <span>Track Shipment</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                )}
              </div>

              {/* ── Keepsakes Gallery & Assets ────────────────── */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#786F66]">
                    Custom Keepsakes ({(order.items as unknown[])?.length || 0})
                  </span>
                </div>

                <div className="flex flex-col divide-y divide-[#F0EAE1]">
                  {(order.items || []).map((item, idx) => {
                    const photos = Array.isArray(item.photos) ? item.photos : [];
                    const texts = Array.isArray(item.texts) ? item.texts : [];

                    return (
                      <div key={idx} className="py-5 first:pt-0 last:pb-0 flex flex-col gap-4">
                        {/* Main Item Row */}
                        <div className="flex gap-4 items-start">
                          {item.previewUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={item.previewUrl}
                              alt={item.templateName || "Keepsake"}
                              className="w-18 h-18 sm:w-22 sm:h-22 object-cover rounded-2xl border border-[#EAE4DC] shrink-0 shadow-xs"
                            />
                          ) : (
                            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DC] flex items-center justify-center text-[11px] font-semibold text-[#786F66] shrink-0">
                              Lamp
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="text-[10px] bg-[#F5EFE6] text-[#785B3C] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                {item.templateName || "Personalized Lamp"}
                              </span>
                            </div>

                            <h3 className="text-sm sm:text-base font-serif font-bold text-[#1A1412] leading-snug">
                              Personalized Lithophane Lamp
                            </h3>

                            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#786F66]">
                              <span>Quantity: {item.quantity}</span>
                              <span className="text-[#C4BCB3]">·</span>
                              <span className="font-bold text-[#1A1412]">
                                {formatRupees(item.unitPrice * (item.quantity || 1))}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Uploaded Photo Assets (Intimate Gallery Grid) */}
                        {photos.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#786F66] block mb-2.5">
                              Uploaded Customer Photos ({photos.length}):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {photos.map((p, pIdx) => (
                                <div
                                  key={pIdx}
                                  onClick={() =>
                                    setActivePhoto({
                                      url: p.url,
                                      slotLabel: p.slotLabel || `Photo ${pIdx + 1}`,
                                      dimensions: p.cmLabel,
                                      fileName: p.fileName,
                                      templateName: item.templateName,
                                    })
                                  }
                                  className="group flex items-center gap-3 p-2.5 rounded-2xl border border-[#EAE4DC] bg-[#FAF8F5]/70 hover:bg-[#FAF8F5] hover:border-[#D47124]/40 cursor-pointer transition-all shadow-2xs"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={p.url}
                                    alt={p.slotLabel || "Photo"}
                                    className="w-13 h-13 sm:w-14 sm:h-14 object-cover rounded-xl border border-[#EAE4DC] shrink-0 transition-transform group-hover:scale-105"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <span className="text-xs font-semibold text-[#1A1412] block truncate">
                                      {p.slotLabel || `Photo ${pIdx + 1}`}
                                    </span>
                                    {p.cmLabel && (
                                      <span className="text-[10px] text-[#786F66] block">
                                        Print Size: {p.cmLabel}
                                      </span>
                                    )}
                                    <span className="text-[11px] text-[#D47124] font-semibold inline-flex items-center gap-1 mt-0.5 group-hover:underline">
                                      <span>View Photo</span>
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                        <line x1="11" y1="8" x2="11" y2="14"></line>
                                        <line x1="8" y1="11" x2="14" y2="11"></line>
                                      </svg>
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Customer Custom Text Engravings */}
                        {texts.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#786F66] block mb-2">
                              Custom Text Engravings:
                            </span>
                            <div className="flex flex-wrap gap-2.5">
                              {texts.map((t, tIdx) => (
                                <div
                                  key={tIdx}
                                  className="bg-[#FAF8F5] border border-[#EAE4DC] px-3.5 py-2 rounded-xl text-xs"
                                >
                                  <span className="text-[10px] font-bold text-[#786F66] uppercase tracking-wider block">
                                    {t.label}
                                  </span>
                                  <span className="font-serif italic font-semibold text-[#1A1412] text-sm mt-0.5 block">
                                    &ldquo;{t.value}&rdquo;
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Shipping & Financial Summary ─────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-[#F0EAE1] text-xs">
                {/* Shipping Destination */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#786F66] block mb-2">
                    Shipping Destination
                  </span>
                  <p className="font-bold text-[#1A1412] text-sm">
                    {order.shippingAddress?.fullName || user?.name || "Recipient"}
                  </p>
                  <p className="text-[#5C534E] mt-1 leading-relaxed">
                    {order.shippingAddress?.line1}
                    {order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ""}
                  </p>
                  <p className="text-[#5C534E] mt-0.5">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} —{" "}
                    <span className="font-mono font-medium">{order.shippingAddress?.pincode}</span>
                  </p>
                  {order.shippingAddress?.phone && (
                    <p className="text-[#786F66] mt-1.5 text-[11px]">
                      Contact: {order.shippingAddress.phone}
                    </p>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="sm:text-right flex flex-col justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#786F66] block mb-1">
                      Payment Breakdown
                    </span>
                    <div className="flex sm:justify-end gap-2 text-[#5C534E]">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-[#1A1412]">
                        {formatRupees(order.subtotal)}
                      </span>
                    </div>

                    {order.discountAmount > 0 && (
                      <div className="flex sm:justify-end gap-2 text-[#047857]">
                        <span>
                          Discount {order.coupon?.code ? `(${order.coupon.code})` : ""}:
                        </span>
                        <span className="font-semibold">- {formatRupees(order.discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex sm:justify-end gap-2 text-[#5C534E]">
                      <span>Shipping:</span>
                      <span className="font-semibold text-[#047857]">Complimentary</span>
                    </div>

                    <div className="flex sm:justify-end gap-2 text-sm font-bold text-[#1A1412] pt-2 mt-1 border-t border-[#F0EAE1]">
                      <span>Total Paid:</span>
                      <span className="text-[#D47124] text-base font-bold">
                        {formatRupees(order.finalAmount)}
                      </span>
                    </div>
                  </div>

                  {order.payment && (
                    <div className="mt-3 text-[11px] text-[#047857] flex sm:justify-end items-center gap-1 font-semibold">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      <span>
                        {order.payment.status === "CAPTURED" ? "Verified Paid" : order.payment.status} via{" "}
                        {order.payment.method?.toUpperCase() || "Razorpay"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Notes */}
              {order.notes && (
                <div className="bg-[#FAF8F5] border border-[#EAE4DC] rounded-xl p-3.5 text-xs text-[#5C534E]">
                  <span className="font-bold text-[#786F66] text-[10px] uppercase block mb-0.5">
                    Gift / Delivery Notes:
                  </span>
                  <span>{order.notes}</span>
                </div>
              )}
            </article>
          </div>
        )}
      </main>

      {/* ── In-App Photo Modal Matching App Schema (NO BLACK BG!) ── */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1A1412]/50 backdrop-blur-md animate-fadeIn"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="bg-white border border-[#EAE4DC] rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-[0_25px_60px_-15px_rgba(46,30,18,0.22)] flex flex-col gap-4 text-[#1A1412] animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F0EAE1]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#785B3C] bg-[#F5EFE6] px-2 py-0.5 rounded">
                    {activePhoto.templateName || "Custom Keepsake"}
                  </span>
                  {activePhoto.dimensions && (
                    <span className="text-[10px] font-bold text-[#786F66] bg-[#FAF8F5] border border-[#EAE4DC] px-2 py-0.5 rounded-full">
                      {activePhoto.dimensions}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A1412]">
                  {activePhoto.slotLabel}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="w-9 h-9 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#EAE4DC] text-[#5C534E] hover:text-[#1A1412] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Warm Ivory Image Frame (App Aesthetics) */}
            <div className="bg-[#FAF8F5] border border-[#EAE4DC] rounded-2xl p-3 sm:p-4 flex items-center justify-center min-h-[260px] max-h-[64vh] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.url}
                alt={activePhoto.slotLabel}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-xs"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between text-xs text-[#786F66] pt-1">
              <span className="truncate max-w-[240px]">
                {activePhoto.fileName || "Customer photo"}
              </span>

              <a
                href={activePhoto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D47124] hover:text-[#BA5D17] hover:underline font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Full Resolution</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
