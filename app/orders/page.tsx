"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/lib/cart";
import { orderApi, ServerOrder } from "@/lib/api";
import { OrderCardSkeleton } from "@/components/Skeleton";

function formatRupees(paise: number = 0): string {
  const rupees = (paise || 0) / 100;
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
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

// Maps order status to a colour set: { bg, text, border, dot }
function statusStyle(status: string): { bg: string; text: string; border: string; dot: string; pulse: boolean } {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return { bg: "bg-[#eff6ff]", text: "text-[#1d4ed8]", border: "border-[#bfdbfe]", dot: "bg-[#3b82f6]", pulse: false };
    case "PROCESSING":
      return { bg: "bg-[#f0f9ff]", text: "text-[#0369a1]", border: "border-[#bae6fd]", dot: "bg-[#0ea5e9]", pulse: true };
    case "SHIPPED":
      return { bg: "bg-[#f5f3ff]", text: "text-[#6d28d9]", border: "border-[#ddd6fe]", dot: "bg-[#8b5cf6]", pulse: false };
    case "DELIVERED":
      return { bg: "bg-[#f0fdf4]", text: "text-[#15803d]", border: "border-[#bbf7d0]", dot: "bg-[#22c55e]", pulse: false };
    case "CANCELLED":
      return { bg: "bg-[#fef2f2]", text: "text-[#dc2626]", border: "border-[#fecaca]", dot: "bg-[#ef4444]", pulse: false };
    case "PENDING":
    default:
      return { bg: "bg-[#fefce8]", text: "text-[#92400e]", border: "border-[#fde68a]", dot: "bg-[#f59e0b]", pulse: true };
  }
}

export default function OrdersListPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { totalCount } = useCart();

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
  const fetchOrders = useCallback(() => {
    if (!user) return;
    setIsLoadingOrders(true);
    setErrorMessage("");

    orderApi
      .getOrders()
      .then((res) => {
        if (res.success && res.data?.orders) {
          const validOrders = res.data.orders.filter((o) => o.status !== "CANCELLED");
          const sorted = [...validOrders].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setOrders(sorted);
        } else {
          setErrorMessage(res.error || "Unable to retrieve orders at this time.");
        }
      })
      .catch((err) => {
        setErrorMessage("Network error while retrieving orders. Please check your connection.");
      })
      .finally(() => {
        setIsLoadingOrders(false);
      });
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle pull-to-refresh
  useEffect(() => {
    function handlePullRefresh() {
      fetchOrders();
    }
    window.addEventListener("app:pulled-to-refresh", handlePullRefresh);
    return () => window.removeEventListener("app:pulled-to-refresh", handlePullRefresh);
  }, [fetchOrders]);

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-40 h-16 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]" />
        <main className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 w-full flex-1">
          <div className="flex flex-col gap-5 mt-2">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] flex flex-col font-sans antialiased">
      {/* ── Navigation Bar ─────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[rgba(250,247,242,0.92)] border-b border-[#e5ddd0] transition-all">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6e5c50] hover:text-[#2e1e12] transition-colors py-1 px-2 rounded-lg hover:bg-black/[0.03] z-10"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Home</span>
          </Link>

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
              />
            </Link>
          </div>

          <Link
            href="/cart"
            aria-label={`View cart, ${totalCount} items`}
            className="relative w-10 h-10 -mr-1 rounded-full flex items-center justify-center text-[#2e1e12] hover:text-[#e07a28] hover:bg-[#f2ebdc] active:bg-[#e8dccb] transition-all cursor-pointer z-10"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#e07a28] text-white text-[10px] font-bold font-sans flex items-center justify-center leading-none shadow-xs border-2 border-[#faf7f2]">
              {totalCount}
            </span>
          </Link>
        </div>
      </header>

      {/* ── Orders List ─────────────────────────────────────── */}
      <main className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 w-full flex-1">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 pb-5 border-b border-[#e5ddd0]">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#2e1e12]">
                My Orders
              </h1>
              {!isLoadingOrders && orders.length > 0 && (
                <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-[#f2ebdc] text-[#6e5c50] border border-[#e5ddd0]">
                  {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#6e5c50] font-normal leading-relaxed">
              Track your handcrafted keepsakes and monitor delivery progress.
            </p>
          </div>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-6 bg-[#fef2f2] border border-[#fca5a5]/40 text-[#991b1b] text-xs sm:text-sm px-4 py-3 rounded-xl flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => window.location.reload()} className="font-semibold underline text-xs ml-3 hover:opacity-80">
              Retry
            </button>
          </div>
        )}

        {/* Orders loading skeleton */}
        {isLoadingOrders || isAuthLoading ? (
          <div className="flex flex-col gap-5">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        ) : orders.length === 0 ? (
          /* Empty Orders View */
          <div className="bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-10 text-center flex flex-col items-center max-w-md mx-auto shadow-sm my-8">
            <div className="w-14 h-14 rounded-full bg-[#f2ebdc] text-[#6e5c50] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#2e1e12] mb-1.5">No Orders Yet</h2>
            <p className="text-xs text-[#6e5c50] mb-6 leading-relaxed">
              Turn your cherished memories into handcrafted 3D laser-engraved lithophane lamps.
            </p>
            <Link
              href="/customize"
              className="bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              Customize a Lamp
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="flex flex-col gap-5">
            {orders.map((order) => {
              const itemsList = Array.isArray(order.items) ? order.items : [];
              const firstItem = itemsList[0];
              const totalItemsCount = itemsList.reduce((acc, it) => acc + (it.quantity || 1), 0);
              const shipping = order.shippingAddress || {};
              const hasTracking = Boolean(order.trackingUrl);
              const st = statusStyle(order.status);

              return (
                <article
                  key={order.id}
                  className="bg-white border border-[#e5ddd0] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
                >
                  {/* ── Order Header Row ──────────────────────── */}
                  <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#f0e8dc]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#2e1e12] tracking-tight shrink-0">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[#c4bcb3] text-xs">·</span>
                      <span className="text-xs text-[#6e5c50] truncate font-medium">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    {/* Status Badge — colour mapped per status */}
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase px-3 py-1 rounded-full border shrink-0 ${st.bg} ${st.text} ${st.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${st.pulse ? "animate-pulse" : ""}`} />
                      <span>{order.status}</span>
                    </span>
                  </div>

                  {/* ── Item Overview Row ─────────────────────── */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        {firstItem?.previewUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={firstItem.previewUrl}
                            alt={firstItem.templateName || "Keepsake"}
                            className="w-16 h-16 sm:w-[72px] sm:h-[72px] object-cover rounded-xl border border-[#e5ddd0] shadow-xs"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl bg-[#f2ebdc] border border-[#e5ddd0] flex items-center justify-center text-[11px] font-semibold text-[#6e5c50]">
                            Lamp
                          </div>
                        )}
                        {itemsList.length > 1 && (
                          <span className="absolute -bottom-1.5 -right-1.5 bg-[#2e1e12] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-xs">
                            +{itemsList.length - 1}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="text-[10px] bg-[#f2ebdc] text-[#5a3a1a] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            {firstItem?.templateName || "Custom Keepsake"}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-serif font-bold text-[#2e1e12] truncate">
                          Personalized Lithophane Lamp
                        </h3>
                        <p className="text-xs text-[#6e5c50] mt-0.5">
                          {totalItemsCount} {totalItemsCount === 1 ? "keepsake" : "keepsakes"} ·{" "}
                          <span className="text-[#5c534e]">
                            {shipping.fullName || user?.name || "Recipient"}
                            {shipping.city ? `, ${shipping.city}` : ""}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#f0e8dc]">
                      <span className="text-[11px] uppercase tracking-wider text-[#6e5c50] font-medium hidden sm:block">
                        Total
                      </span>
                      <span className="text-base sm:text-lg font-bold text-[#2e1e12]">
                        {formatRupees(order.finalAmount)}
                      </span>
                      {order.payment && (
                        <span className="text-[11px] text-[#15803d] font-semibold flex items-center gap-1 mt-0.5">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Verified Paid</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Tracking Strip ────────────────────────── */}
                  <div className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#f2ebdc] text-[#6e5c50] flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="3" width="15" height="13" />
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                          <circle cx="5.5" cy="18.5" r="2.5" />
                          <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                      </div>
                      <div>
                        {hasTracking ? (
                          <div className="flex flex-wrap items-center gap-1.5 font-semibold text-[#2e1e12]">
                            <span>Dispatched with {order.courierName || "Courier"}</span>
                            {order.trackingNumber && (
                              <span className="font-mono text-[11px] text-[#6e5c50]">· AWB: {order.trackingNumber}</span>
                            )}
                          </div>
                        ) : (
                          <span className="font-semibold text-[#2e1e12]">Tracking link will be shared soon</span>
                        )}
                        <span className="text-[11px] text-[#6e5c50] block sm:inline sm:ml-2">
                          · Handcrafted & laser-engraved in 2–4 business days
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs active:scale-[0.98] group self-end sm:self-auto shrink-0"
                    >
                      <span>View Details</span>
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none" className="transition-transform group-hover:translate-x-0.5">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
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
