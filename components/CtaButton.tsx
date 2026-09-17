"use client";

import Link from "next/link";

interface CtaButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function CtaButton({
  label,
  href,
  onClick,
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  disabled = false,
}: CtaButtonProps) {
  const sizeStyles: Record<string, string> = {
    sm: "px-4 py-2.5 text-[8px] gap-1.5 rounded-sm",
    md: "px-6 py-3.5 text-[13px] gap-2 rounded-lg",
    lg: "px-7 py-4 text-[14px] gap-2 rounded-xl",
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
    disabled ? "opacity-60 pointer-events-none" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

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

  if (href) {
    return (
      <Link href={href} className={base}>
        <span>{label}</span>
        {ArrowIcon}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base}>
      <span>{label}</span>
      {ArrowIcon}
    </button>
  );
}
