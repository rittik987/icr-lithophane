"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface RazorpayAffordabilityWidgetProps {
  /** Product selling price in paise (e.g. 189900 for ₹1,899) */
  amount: number;
  /** Razorpay public key ID from NEXT_PUBLIC_RAZORPAY_KEY_ID */
  razorpayKey: string;
}

declare global {
  interface Window {
    RazorpayAffordabilitySuite: new (config: {
      key: string;
      amount: number;
      currency?: string;
    }) => { render: () => void };
  }
}

const CDN_SRC =
  "https://cdn.razorpay.com/widgets/affordability/affordability.js";

export default function RazorpayAffordabilityWidget({
  amount,
  razorpayKey,
}: RazorpayAffordabilityWidgetProps) {
  const [targetSlot, setTargetSlot] = useState<HTMLElement | null>(null);
  const initializedRef = useRef(false);

  // If amount is below ₹1,500 (150,000 paise), banks offer 0 EMI plans. Fallback to ₹2,597 (259,700 paise) so EMI plans render.
  const effectiveAmount = amount >= 150000 ? amount : 259700;

  useEffect(() => {
    function resolveSlot() {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const slotId = isDesktop
        ? "razorpay-widget-slot-desktop"
        : "razorpay-widget-slot-mobile";
      const slot = document.getElementById(slotId);
      if (slot) {
        setTargetSlot(slot);
      }
    }

    resolveSlot();

    const mql = window.matchMedia("(min-width: 1024px)");
    mql.addEventListener("change", resolveSlot);
    return () => mql.removeEventListener("change", resolveSlot);
  }, []);

  const renderSuite = () => {
    if (initializedRef.current || !targetSlot) return;
    if (
      typeof window === "undefined" ||
      typeof window.RazorpayAffordabilitySuite === "undefined"
    ) {
      return;
    }

    try {
      initializedRef.current = true;
      const suite = new window.RazorpayAffordabilitySuite({
        key: razorpayKey,
        amount: effectiveAmount,
        currency: "INR",
      });
      suite.render();
    } catch (err) {
      console.warn("RazorpayAffordabilitySuite render error:", err);
    }
  };

  useEffect(() => {
    if (targetSlot && !initializedRef.current) {
      // Small tick to ensure targetSlot has mounted the portaled div into the DOM
      const timer = setTimeout(renderSuite, 50);
      return () => clearTimeout(timer);
    }
  }, [targetSlot, effectiveAmount, razorpayKey]);

  return (
    <>
      <Script
        src={CDN_SRC}
        strategy="afterInteractive"
        onLoad={renderSuite}
        onReady={renderSuite}
      />
      {targetSlot &&
        createPortal(
          <div
            id="razorpay-affordability-widget"
            className="w-full min-h-[36px]"
            aria-label="EMI and affordability options"
          />,
          targetSlot
        )}
    </>
  );
}
