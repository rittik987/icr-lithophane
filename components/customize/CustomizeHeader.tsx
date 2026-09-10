"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ASSETS } from "@/lib/assets";
import { useCart } from "@/lib/cart";

export default function CustomizeHeader() {
  const router = useRouter();
  const { totalCount } = useCart();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 2) {
      const prev = sessionStorage.getItem("icr_prev_route");
      if (prev && prev !== "/customize") {
        router.back();
        return;
      }
    }
    router.replace("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]">
      <div className="relative flex items-center justify-between h-16 px-4 max-w-2xl mx-auto">
        {/* Back arrow — left */}
        <button
          aria-label="Go back"
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-sm hover:bg-[#f2ebdc] transition-colors cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="#2e1e12"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Title — centred */}
        <h1
          className="text-[#2e1e12] text-[18px] font-semibold leading-none"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          Customize
        </h1>

        {/* Cart icon with notification count — right */}
        <Link
          href="/cart"
          aria-label={`View cart, ${totalCount} items`}
          className="relative w-10 h-10 -mr-1 rounded-full flex items-center justify-center text-[#2e1e12] hover:text-[#e07a28] hover:bg-[#f2ebdc] active:bg-[#e8dccb] transition-all cursor-pointer"
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
  );
}
