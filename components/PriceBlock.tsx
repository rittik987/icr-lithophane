"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";
import { useAuth } from "@/context/AuthContext";
import { StorefrontProduct } from "@/lib/api";
import RazorpayAffordabilityWidget from "@/components/RazorpayAffordabilityWidget";

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

interface PriceBlockProps {
  product?: StorefrontProduct | null;
}

export default function PriceBlock({ product }: PriceBlockProps) {
  const router = useRouter();
  const { user } = useAuth();

  const sellingPrice =
    product?.sellingPrice !== undefined
      ? Math.round(product.sellingPrice / 100)
      : 2999;
  const mrp =
    product?.mrp !== undefined ? Math.round(product.mrp / 100) : 2199;

  const discountPercent =
    mrp > sellingPrice && mrp > 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const discountBadge =
    discountPercent > 0
      ? (product?.computedDiscountBadge || product?.discountBadge || `SAVE ${discountPercent}% OFF`)
      : null;

  const whatsIncluded =
    product?.whatsIncluded && product.whatsIncluded.length > 0
      ? product.whatsIncluded
      : [
          "Custom lithophane in wooden frame",
          "DC power adapter & cable",
          "Gift-ready packaging",
          "Free pan-India delivery",
        ];

  function handleOrderClick() {
    router.push("/customize");
  }

  return (
    <div className="bg-white border border-[#e5ddd0] rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm w-full">
      {/* Pricing row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2 leading-none">
            <span className="text-[#2e1e12] text-[28px] font-bold leading-none font-sans">
              ₹{sellingPrice.toLocaleString("en-IN")}
            </span>
            {mrp > 0 && (
              <span className="text-[#6e5c50] text-sm line-through font-sans">
                MRP ₹{mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <p className="text-[#6e5c50] text-[11px] font-medium mt-1 font-sans">
            All taxes included
          </p>
        </div>

        {/* Discount badge */}
        {discountBadge && (
          <div className="bg-[#eaf5ec] border border-[#c6e6ca] rounded px-3 py-1.5 shrink-0">
            <span className="text-[#1e7234] text-xs font-bold tracking-wider uppercase font-sans">
              {discountBadge}
            </span>
          </div>
        )}
      </div>

      {/* Razorpay EMI² Affordability Widget */}
      {RAZORPAY_KEY ? (
        <RazorpayAffordabilityWidget
          amount={product?.sellingPrice ?? 0}
          razorpayKey={RAZORPAY_KEY}
        />
      ) : null}

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
          {whatsIncluded.map((item) => (
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
          100% Quality Guarantee • Cash on Delivery Available
        </p>
      </div>
    </div>
  );
}
