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
          className="flex items-center gap-1.5 bg-[#f2ebdc] border border-[#e5ddd0] rounded-full px-3 py-1.5 hover:bg-[#e8dece] transition-colors"
        >
          <div className="relative w-3 h-[15px] shrink-0">
            <Image
              src={ASSETS.iconCartNav}
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="text-[#2e1e12] text-xs font-semibold tracking-wider uppercase font-sans">
            BAG ({totalCount})
          </span>
        </Link>
      </div>
    </header>
  );
}
