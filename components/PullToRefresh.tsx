"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface PullToRefreshProps {
  children: React.ReactNode;
}

const PULL_THRESHOLD = 65; // px needed to trigger refresh
const MAX_PULL = 90; // max px indicator travels

export default function PullToRefresh({ children }: PullToRefreshProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only allow pull-down when at the very top of the page
    if (window.scrollY <= 0 && !isRefreshing) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    } else {
      isPullingRef.current = false;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    // Only handle downward drag when scrolled to top
    if (diff > 0 && window.scrollY <= 0) {
      // Damped rubber-band formula
      const damped = Math.min(diff * 0.45, MAX_PULL);
      setPullY(damped);

      // Prevent native overscroll bouncing when actively pulling down
      if (damped > 10 && e.cancelable) {
        e.preventDefault();
      }
    } else {
      setPullY(0);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current || isRefreshing) return;
    isPullingRef.current = false;

    if (pullY >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullY(50); // Hold at indicator position while spinning

      try {
        // 1. Refresh user & auth profile
        if (refreshUser) {
          await refreshUser().catch(() => {});
        }
        // 2. Refresh Next.js server components / route cache
        router.refresh();

        // 3. Dispatch a window event so active pages can re-fetch their internal lists
        window.dispatchEvent(new CustomEvent("app:pulled-to-refresh"));

        // Keep visible briefly for pleasant feedback
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (err) {
        console.error("Pull-to-refresh error:", err);
      } finally {
        setIsRefreshing(false);
        setPullY(0);
      }
    } else {
      setPullY(0);
    }
  }, [pullY, isRefreshing, refreshUser, router]);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullY / PULL_THRESHOLD, 1);

  return (
    <>
      {/* ── Pull to Refresh Visual Indicator ──────────────────────── */}
      <div
        className="fixed left-0 right-0 z-50 pointer-events-none flex justify-center transition-transform"
        style={{
          top: "12px",
          transform: `translate3d(0, ${pullY}px, 0)`,
          transition: isPullingRef.current ? "none" : "transform 0.28s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
          opacity: pullY > 5 ? 1 : 0,
        }}
      >
        <div className="bg-white/95 backdrop-blur-md border border-[#e5ddd0] shadow-md rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs font-medium text-[#2e1e12]">
          {isRefreshing ? (
            <>
              <div className="w-4 h-4 border-2 border-[#e07a28] border-t-transparent rounded-full animate-spin" />
              <span className="text-[#e07a28] font-bold text-[11px] tracking-wide">Updating...</span>
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#e07a28"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: `rotate(${progress * 180}deg)`,
                  transition: "transform 0.1s linear",
                }}
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              <span className="text-[#6e5c50] text-[11px] font-medium">
                {pullY >= PULL_THRESHOLD ? "Release to refresh" : "Swipe down to reload"}
              </span>
            </>
          )}
        </div>
      </div>

      {children}
    </>
  );
}
