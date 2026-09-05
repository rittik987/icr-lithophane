import Image from "next/image";
import { ASSETS } from "@/lib/assets";

export default function PriceBlock() {
  return (
    <div className="bg-white border border-[#e5ddd0] rounded-xl p-4 flex flex-col gap-4 shadow-sm w-full">

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
      <div className="flex items-center justify-center gap-1.5 w-full">
        <div className="relative w-3 h-3 shrink-0">
          <Image
            src={ASSETS.iconShield}
            alt=""
            fill
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
