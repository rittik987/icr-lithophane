"use client";

import Script from "next/script";
import { useCallback, useEffect } from "react";

interface RazorpayAffordabilityWidgetProps {
  /** Product selling price in paise (e.g. 299900 for ₹2,999) */
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
  // If amount is below ₹1,500 (150,000 paise), banks offer 0 EMI plans. Fallback to ₹2,597 (259,700 paise) so EMI plans render.
  const effectiveAmount = amount >= 150000 ? amount : 259700;

  const initWidget = useCallback(() => {
    if (typeof window === "undefined" || typeof window.RazorpayAffordabilitySuite === "undefined") return;
    try {
      const suite = new window.RazorpayAffordabilitySuite({
        key: razorpayKey,
        amount: effectiveAmount,
        currency: "INR",
      });
      suite.render();
    } catch (err) {
      console.warn("RazorpayAffordabilitySuite render error:", err);
    }
  }, [effectiveAmount, razorpayKey]);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.RazorpayAffordabilitySuite !== "undefined") {
      initWidget();
    }
  }, [initWidget]);

  return (
    <>
      <Script
        src={CDN_SRC}
        strategy="afterInteractive"
        onLoad={initWidget}
        onReady={initWidget}
      />
      <div
        id="razorpay-affordability-widget"
        className="w-full min-h-[36px]"
        aria-label="EMI and affordability options"
      />
    </>
  );
}
