"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function CapacitorInit() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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

        // 2. Hardware Android Back Button Navigation
        const { App } = await import("@capacitor/app");
        const backHandle = await App.addListener("backButton", ({ canGoBack }) => {
          if (pathname && pathname !== "/") {
            router.back();
          } else if (canGoBack) {
            router.back();
          } else {
            App.exitApp();
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
