"use client";

import Image from "next/image";
import { ASSETS } from "@/lib/assets";

interface HeaderProps {
  cartCount?: number;
}

export default function Header({ cartCount = 0 }: HeaderProps) {
  return (
    <header className="fixed top-[41px] left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.95)] border-b border-[#e5ddd0]">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <div className="relative w-16 h-8 shrink-0">
          <Image
            src={ASSETS.logo}
            alt="ICR Custom Creations"
            fill
            className="object-contain object-left"
            unoptimized
          />
        </div>

        {/* Cart button */}
        <button
          aria-label={`View cart, ${cartCount} items`}
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
            BAG ({cartCount})
          </span>
        </button>
      </div>
    </header>
  );
}
