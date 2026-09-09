"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";
import { useAuth } from "@/context/AuthContext";
import { StorefrontProduct } from "@/lib/api";

interface StickyBottomBarProps {
  product?: StorefrontProduct | null;
}

export default function StickyBottomBar({ product }: StickyBottomBarProps) {
  const router = useRouter();
  const { user } = useAuth();

  const sellingPrice =
    product?.sellingPrice !== undefined
      ? Math.round(product.sellingPrice / 100)
      : 2999;
  const mrp =
    product?.mrp !== undefined ? Math.round(product.mrp / 100) : 4999;

  const discountPercent =
    mrp > sellingPrice && mrp > 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const discountText =
    discountPercent > 0
      ? `${discountPercent}% OFF • FREE DELIVERY`
      : "FREE PAN-INDIA DELIVERY";

  function handleOrderClick() {
    if (!user) {
      router.push("/login?redirect=/customize");
    } else {
      router.push("/customize");
    }
  }

  return (
    <aside
      aria-label="Quick order bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.98)] border-t border-[#e5ddd0] shadow-[0_-4px_12px_rgba(46,30,18,0.08)] px-6 py-3.5"
      style={{ paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
        {/* Price info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2 leading-none">
            <span className="text-[#2e1e12] text-xl font-bold leading-none font-sans">
              ₹{sellingPrice.toLocaleString("en-IN")}
            </span>
            {mrp > 0 && (
              <span className="text-[#6e5c50] text-xs line-through font-sans">
                ₹{mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <span className="text-[#1e7234] text-[10px] font-semibold tracking-wide uppercase font-sans">
            {discountText}
          </span>
        </div>

        {/* CTA — guarded with button click */}
        <button
          type="button"
          onClick={handleOrderClick}
          style={{ backgroundColor: "#e07a28" }}
          className="hover:bg-[#c96a1f] active:bg-[#b85d1a] flex items-center gap-2 px-5 py-3 rounded-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          <span
            className="font-bold font-sans uppercase whitespace-nowrap"
            style={{ color: "#ffffff", fontSize: "13px", letterSpacing: "0.06em" }}
          >
            Customize &amp; Order
          </span>
          <div className="relative w-3 h-3 shrink-0">
            <Image
              src={ASSETS.iconArrow}
              alt=""
              fill
              sizes="12px"
              style={{ filter: "brightness(0) invert(1)" }}
              className="object-contain"
              unoptimized
            />
          </div>
        </button>
      </div>
    </aside>
  );
}
