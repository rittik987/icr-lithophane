"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";
import { useAuth } from "@/context/AuthContext";

export default function PriceBlock() {
  const router = useRouter();
  const { user } = useAuth();

  function handleOrderClick() {
    if (!user) {
      router.push("/login?redirect=/customize");
    } else {
      router.push("/customize");
    }
  }

  return (
    <div className="bg-white border border-[#e5ddd0] rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm w-full">
      {/* Pricing row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2 leading-none">
            <span className="text-[#2e1e12] text-[28px] font-bold leading-none font-sans">
              ₹2,999
            </span>
            <span className="text-[#6e5c50] text-sm line-through font-sans">
              MRP ₹4,999
            </span>
          </div>
          <p className="text-[#6e5c50] text-[11px] font-medium mt-1 font-sans">
            All taxes &amp; pan-India courier included
          </p>
        </div>

        {/* Discount badge */}
        <div className="bg-[#eaf5ec] border border-[#c6e6ca] rounded px-3 py-1.5 shrink-0">
          <span className="text-[#1e7234] text-xs font-bold tracking-wider uppercase font-sans">
            SAVE 40% OFF
          </span>
        </div>
      </div>

      {/* Desktop Order CTA Button — guarded */}
      <button
        type="button"
        onClick={handleOrderClick}
        className="hidden lg:flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-b from-[#e07a28] to-[#c96a1e] hover:from-[#d26f1e] hover:to-[#b85315] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-[0.99] cursor-pointer"
      >
        <span>Customize &amp; Place Order</span>
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7.5 15L12.5 10L7.5 5" />
        </svg>
      </button>

      {/* What you get */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[#6e5c50] text-[12px] font-sans font-medium">What&apos;s included:</p>
        <ul className="flex flex-col gap-1">
          {[
            "Custom lithophane in solid walnut frame",
            "USB-C cable & power adapter",
            "Gift-ready packaging",
            "Free pan-India delivery",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5.25" stroke="#1e7234" strokeWidth="1.5" />
                <path d="M3.5 6l2 2 3-3" stroke="#1e7234" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[#2e1e12] text-[12px] font-sans">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Trust line */}
      <div className="flex items-center justify-center gap-1.5 w-full pt-1 border-t border-[#f0e8dc]">
        <div className="relative w-3 h-3 shrink-0">
          <Image
            src={ASSETS.iconShield}
            alt=""
            fill
            sizes="12px"
            className="object-contain"
            unoptimized
          />
        </div>
        <p className="text-[#6e5c50] text-[11px] font-medium text-center leading-tight font-sans">
          100% Quality Guarantee • Free Pan-India Courier • Cash on Delivery Available
        </p>
      </div>
    </div>
  );
}
