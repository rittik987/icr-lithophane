"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ASSETS } from "@/lib/assets";
import { useCart } from "@/lib/cart";

export default function CustomizeHeader() {
  const router = useRouter();
  const { totalCount } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]">
      <div className="relative flex items-center justify-between h-16 px-4 max-w-2xl mx-auto">
        {/* Back arrow — left */}
        <button
          aria-label="Go back"
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f2ebdc] transition-colors"
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

        {/* Bag button — right */}
        <Link
          href="/cart"
          aria-label={`View cart, ${totalCount} items`}
          className="flex items-center gap-1.5 bg-[#e07a28] hover:bg-[#c96a1f] text-white rounded-full px-3.5 py-1.5 shadow-xs transition-all active:scale-[0.97] group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 group-hover:scale-105 transition-transform">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="text-white text-xs font-bold tracking-wider uppercase font-sans">
            BAG ({totalCount})
          </span>
        </Link>
      </div>
    </header>
  );
}
