"use client";

import { useEffect, useRef } from "react";

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
    }) => { render: () => void };
  }
}

const CDN_SRC =
  "https://cdn.razorpay.com/widgets/affordability/affordability.js";

export default function RazorpayAffordabilityWidget({
  amount,
  razorpayKey,
}: RazorpayAffordabilityWidgetProps) {
  const initialized = useRef(false);

  useEffect(() => {
    // Guard: only run once even in React Strict Mode
    if (initialized.current) return;

    function initWidget() {
      if (typeof window.RazorpayAffordabilitySuite === "undefined") return;
      const suite = new window.RazorpayAffordabilitySuite({
        key: razorpayKey,
        amount,
      });
      suite.render();
      initialized.current = true;
    }

    // If SDK already loaded (e.g. hot-reload), init immediately
    if (typeof window.RazorpayAffordabilitySuite !== "undefined") {
      initWidget();
      return;
    }

    // Deduplicate script tag in case component mounts more than once
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CDN_SRC}"]`
    );

    if (existing) {
      existing.addEventListener("load", initWidget);
      return () => existing.removeEventListener("load", initWidget);
    }

    const script = document.createElement("script");
    script.src = CDN_SRC;
    script.async = true;
    script.onload = initWidget;
    document.head.appendChild(script);

    return () => {
      // Only remove on true unmount; the SDK stays loaded for the session
    };
  }, [amount, razorpayKey]);

  return (
    <div
      id="razorpay-affordability-widget"
      className="w-full"
      aria-label="EMI and affordability options"
    />
  );
}
