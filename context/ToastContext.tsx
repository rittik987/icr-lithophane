"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";

export interface ToastAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: "success" | "info" | "error";
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  dismissToast: (id?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [currentToast, setCurrentToast] = useState<ToastItem | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dismissToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCurrentToast(null);
  }, []);

  const showToast = useCallback(
    ({ title, message, type = "success", action, duration = 4000 }: Omit<ToastItem, "id">) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const id = `toast_${Date.now()}`;
      setCurrentToast({ id, title, message, type, action, duration });

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          setCurrentToast(null);
        }, duration);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Global Toast Container */}
      {currentToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 sm:top-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
        >
          <div className="bg-white/95 backdrop-blur-md border border-[#e5ddd0] shadow-[0_12px_32px_rgba(46,30,18,0.14)] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
            {/* Left Icon + Text */}
            <div className="flex items-center gap-3 min-w-0">
              {currentToast.type === "success" && (
                <div className="w-8 h-8 rounded-full bg-[#eaf5ec] border border-[#c6e6ca] flex items-center justify-center text-[#1e7234] shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3.5 8.5L6.5 11.5L12.5 4.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
              {currentToast.type === "error" && (
                <div className="w-8 h-8 rounded-full bg-[#fde8e8] border border-[#f8b4b4] flex items-center justify-center text-[#9b1c1c] shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M12 4L4 12M4 4l8 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}
              {currentToast.type === "info" && (
                <div className="w-8 h-8 rounded-full bg-[#f2ebdc] flex items-center justify-center text-[#e07a28] shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.25a.875.875 0 110 1.75.875.875 0 010-1.75zM9 11.5H7V7h2v4.5z"/>
                  </svg>
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs font-bold font-sans text-[#2e1e12] leading-tight truncate">
                  {currentToast.title}
                </p>
                {currentToast.message && (
                  <p className="text-[11px] font-sans text-[#6e5c50] leading-tight mt-0.5 truncate">
                    {currentToast.message}
                  </p>
                )}
              </div>
            </div>

            {/* Right Action & Close */}
            <div className="flex items-center gap-2 shrink-0">
              {currentToast.action && (
                currentToast.action.href ? (
                  <Link
                    href={currentToast.action.href}
                    onClick={() => dismissToast()}
                    className="bg-[#e07a28] hover:bg-[#c96a1f] active:scale-95 text-white font-sans font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>{currentToast.action.label}</span>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 7h8M7 3l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      currentToast.action?.onClick?.();
                      dismissToast();
                    }}
                    className="bg-[#e07a28] hover:bg-[#c96a1f] active:scale-95 text-white font-sans font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm whitespace-nowrap"
                  >
                    {currentToast.action.label}
                  </button>
                )
              )}

              <button
                onClick={() => dismissToast()}
                aria-label="Close notification"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8c786a] hover:text-[#2e1e12] hover:bg-[#f2ebdc] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
