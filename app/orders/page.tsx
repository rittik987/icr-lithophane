"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

export default function OrdersListPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [orders, setOrders] = useState<ServerOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Guard: Redirect to login if unauthenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login?redirect=/orders");
    }
  }, [isAuthLoading, user, router]);

  // Fetch user orders list
  useEffect(() => {
    if (!user) return;

    let mounted = true;
    setIsLoadingOrders(true);
    setErrorMessage("");

    orderApi
      .getOrders()
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data?.orders) {
          // Sort newest orders first
          const sorted = [...res.data.orders].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setOrders(sorted);
        } else {
          setErrorMessage(res.error || "Unable to retrieve orders at this time.");
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setErrorMessage(err instanceof Error ? err.message : "Failed to load orders.");
      })
      .finally(() => {
        if (mounted) setIsLoadingOrders(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

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
      {/* ── Precision Navigation Bar ─────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[#FAF9F6]/90 border-b border-[#EAE4DC] transition-all">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6B6059] hover:text-[#1A1412] transition-colors py-1 px-2 rounded-lg hover:bg-black/[0.03]"
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
            <span>Home</span>
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
            className="text-xs font-bold text-[#D47124] hover:text-[#BA5D17] transition-colors py-1 px-2 rounded-lg hover:bg-[#D47124]/5"
          >
            Bag
          </Link>
        </div>
      </header>

      {/* ── Orders List Canvas ───────────────────────────────── */}
      <main className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 w-full flex-1">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 pb-5 border-b border-[#EAE4DC]">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#1A1412]">
                My Orders
              </h1>
              {!isLoadingOrders && orders.length > 0 && (
                <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-[#F3EFE9] text-[#6B6059] border border-[#E2DDD5]">
                  {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#786F66] font-normal leading-relaxed">
              Track your handcrafted keepsakes, review uploaded photos, and monitor delivery progress.
            </p>
          </div>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-6 bg-[#FEF2F2] border border-[#FCA5A5]/40 text-[#991B1B] text-xs sm:text-sm px-4 py-3 rounded-xl flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => window.location.reload()}
              className="font-semibold underline text-xs ml-3 hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoadingOrders ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-8 h-8 border-2 border-[#D47124] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-[#786F66]">Retrieving your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty Orders View */
          <div className="bg-white border border-[#EAE4DC] rounded-3xl p-8 sm:p-14 text-center flex flex-col items-center max-w-md mx-auto shadow-[0_4px_20px_-2px_rgba(46,30,18,0.03)] my-8">
            <div className="w-14 h-14 rounded-full bg-[#F5EFE6] text-[#8C6D4F] flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#1A1412] mb-1.5">
              No Orders Found
            </h2>
            <p className="text-xs text-[#786F66] mb-6 leading-relaxed">
              You haven&apos;t placed any orders yet. Turn your cherished memories into handcrafted 3D laser-engraved lithophane lamps.
            </p>
            <Link
              href="/customize"
              className="bg-[#D47124] hover:bg-[#BA5D17] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(212,113,36,0.25)] active:scale-[0.98]"
            >
              Customize a Lamp
            </Link>
          </div>
        ) : (
          /* Clean, Scannable Orders List */
          <div className="flex flex-col gap-5">
            {orders.map((order) => {
              const itemsList = Array.isArray(order.items) ? order.items : [];
              const firstItem = itemsList[0];
              const totalItemsCount = itemsList.reduce((acc, it) => acc + (it.quantity || 1), 0);
              const shipping = order.shippingAddress || {};
              const hasTracking = Boolean(order.trackingUrl);

              return (
                <article
                  key={order.id}
                  className="bg-white border border-[#EAE4DC] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(46,30,18,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(46,30,18,0.08)] transition-all flex flex-col gap-4.5"
                >
                  {/* ── Order Header Row ──────────────────────── */}
                  <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#F0EAE1]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#1A1412] tracking-tight shrink-0">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[#C4BCB3] text-xs">·</span>
                      <span className="text-xs text-[#786F66] truncate font-medium">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 flex items-center">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
                        <span>{order.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* ── Order Overview & Visual Thumbnail Row ───── */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Item Thumbnail & Summary */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        {firstItem?.previewUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={firstItem.previewUrl}
                            alt={firstItem.templateName || "Keepsake"}
                            className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-xl border border-[#EAE4DC] shadow-xs"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-[#FAF8F5] border border-[#EAE4DC] flex items-center justify-center text-[11px] font-semibold text-[#786F66]">
                            Lamp
                          </div>
                        )}
                        {itemsList.length > 1 && (
                          <span className="absolute -bottom-1.5 -right-1.5 bg-[#1A1412] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-xs">
                            +{itemsList.length - 1}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="text-[10px] bg-[#F5EFE6] text-[#785B3C] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            {firstItem?.templateName || "Custom Keepsake"}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-serif font-bold text-[#1A1412] truncate">
                          Personalized Lithophane Lamp
                        </h3>
                        <p className="text-xs text-[#786F66] mt-0.5">
                          {totalItemsCount} {totalItemsCount === 1 ? "keepsake" : "keepsakes"} ·{" "}
                          <span className="text-[#5C534E]">
                            Delivering to {shipping.fullName || user?.name || "Recipient"}
                            {shipping.city ? `, ${shipping.city}` : ""}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Price & Payment Summary */}
                    <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#F0EAE1]">
                      <span className="text-[11px] uppercase tracking-wider text-[#786F66] font-medium hidden sm:block">
                        Total Amount
                      </span>
                      <span className="text-base sm:text-lg font-bold text-[#1A1412]">
                        {formatRupees(order.finalAmount)}
                      </span>
                      {order.payment && (
                        <span className="text-[11px] text-[#047857] font-semibold flex items-center gap-1 mt-0.5">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Verified Paid</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Shipment Tracking Strip ───────────────── */}
                  <div className="bg-[#FAF8F5] border border-[#EAE4DC] rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#F3EFE9] text-[#786F66] flex items-center justify-center shrink-0">
                        <svg
                          width="14"
                          height="14"
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
                        {hasTracking ? (
                          <div className="flex flex-wrap items-center gap-1.5 font-semibold text-[#1A1412]">
                            <span>Dispatched with {order.courierName || "Courier"}</span>
                            {order.trackingNumber && (
                              <span className="font-mono text-[11px] text-[#786F66]">
                                · AWB: {order.trackingNumber}
                              </span>
                            )}
                          </div>
                        ) : (
                          /* Exact user requirement */
                          <span className="font-semibold text-[#1A1412]">
                            Tracking link will be sharing soon
                          </span>
                        )}
                        <span className="text-[11px] text-[#786F66] block sm:inline sm:ml-2">
                          · Handcrafted & laser-engraved in 2–4 business days
                        </span>
                      </div>
                    </div>

                    {/* View Details CTA Button */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 bg-[#D47124] hover:bg-[#BA5D17] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs active:scale-[0.98] group"
                      >
                        <span>View Order Details</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 20 20"
                          fill="none"
                          className="transition-transform group-hover:translate-x-0.5"
                        >
                          <path
                            d="M7.5 15L12.5 10L7.5 5"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
