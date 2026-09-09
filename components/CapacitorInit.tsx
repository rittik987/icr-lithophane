"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function CapacitorInit() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 0. Track routes in sessionStorage to prevent navigation loops
    if (typeof window !== "undefined" && pathname) {
      const storedCurrent = sessionStorage.getItem("icr_current_route") || "/";
      if (storedCurrent !== pathname) {
        sessionStorage.setItem("icr_prev_route", storedCurrent);
        sessionStorage.setItem("icr_current_route", pathname);
      }
    }

    let removeBackListener: (() => void) | null = null;

    async function initNativeFeatures() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        // 1. Configure Status Bar
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        try {
          // Set icons to crisp dark so they are clearly visible against pure white background
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: "#FFFFFF" });
          await StatusBar.setOverlaysWebView({ overlay: false });
        } catch (e) {
          console.warn("[Capacitor] Status bar configuration warning:", e);
        }

        // 2. Hardware Android Back Button Navigation (Directed Acyclic Graph to prevent loops)
        const { App } = await import("@capacitor/app");
        const backHandle = await App.addListener("backButton", ({ canGoBack }) => {
          if (!pathname || pathname === "/") {
            // At root: native exit
            App.exitApp();
          } else if (pathname === "/checkout") {
            // From checkout: always back to cart
            router.replace("/cart");
          } else if (pathname === "/cart") {
            // From cart: always back to home (never forward into checkout)
            router.replace("/");
          } else if (pathname.startsWith("/orders/")) {
            // From order details: back to orders list
            router.replace("/orders");
          } else if (
            pathname === "/orders" ||
            pathname === "/account" ||
            pathname === "/customize" ||
            pathname === "/login" ||
            pathname === "/register" ||
            pathname === "/contact" ||
            pathname === "/privacy-policy"
          ) {
            // Top-level subpages: back to home
            router.replace("/");
          } else if (canGoBack) {
            router.back();
          } else {
            router.replace("/");
          }
        });

        removeBackListener = () => {
          backHandle.remove();
        };
      } catch (err) {
        console.warn("[Capacitor] Initialization warning:", err);
      }
    }

    initNativeFeatures();

    return () => {
      if (removeBackListener) {
        removeBackListener();
      }
    };
  }, [router, pathname]);

  return null;
}
