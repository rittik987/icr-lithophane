"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface CtaButtonProps {
  label: string;
  loadingLabel?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
}

export default function CtaButton({
  label,
  loadingLabel,
  href,
  onClick,
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  disabled = false,
  loading: externalLoading,
}: CtaButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const pathname = usePathname();

  // Reset loading state when route changes
  useEffect(() => {
    setInternalLoading(false);
  }, [pathname]);

  const isLoading = externalLoading ?? internalLoading;

  const sizeStyles: Record<string, string> = {
    sm: "px-4 py-2.5 text-[11px] gap-1.5 rounded-sm",
    md: "px-6 py-3.5 text-[13px] gap-2 rounded-lg",
    lg: "px-7 py-4 text-[14px] gap-2.5 rounded-xl",
  };

  const spinnerSizes: Record<string, string> = {
    sm: "w-3.5 h-3.5 border-[2px]",
    md: "w-4 h-4 border-2",
    lg: "w-4 h-4 border-2",
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLoading || disabled) {
      e.preventDefault();
      return;
    }
    if (href) {
      setInternalLoading(true);
    }
    onClick?.(e);
  };

  const base = [
    "flex items-center justify-center font-bold tracking-[0.06em] font-sans",
    "bg-gradient-to-b from-[#e07a28] to-[#c96a1e]",
    "hover:from-[#d26f1e] hover:to-[#b85315]",
    "active:scale-[0.985] active:from-[#c96a1e] active:to-[#b04e10]",
    "text-white shadow-sm",
    "transition-all duration-150",
    "cursor-pointer select-none",
    "focus-visible:outline-2 focus-visible:outline-[#e07a28] focus-visible:outline-offset-2",
    sizeStyles[size],
    fullWidth ? "w-full" : "",
    disabled || isLoading ? "pointer-events-none opacity-90 cursor-wait" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const Spinner = (
    <span
      className={`inline-block rounded-full border-white/30 border-t-white animate-spin shrink-0 ${
        spinnerSizes[size] || "w-4 h-4 border-2"
      }`}
      aria-hidden="true"
    />
  );

  const ArrowIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M7.5 15L12.5 10L7.5 5" />
    </svg>
  );

  const content = (
    <>
      {isLoading && Spinner}
      <span>{isLoading ? loadingLabel || label : label}</span>
      {!isLoading && ArrowIcon}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={handleClick} className={base}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={base}
    >
      {content}
    </button>
  );
}
