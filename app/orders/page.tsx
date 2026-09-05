"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";

export default function OrdersPage() {
  const router = useRouter();
  const [orderQuery, setOrderQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setHasSearched(true);
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#6e5c50] hover:text-[#2e1e12] font-sans text-sm font-medium transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>

          <Link href="/" className="relative w-16 h-8 shrink-0">
            <Image
              src={ASSETS.logo}
              alt="ICR Custom Creations"
              fill
              className="object-contain"
              unoptimized
            />
          </Link>

          <div className="w-12" />
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-20 max-w-xl mx-auto px-4 sm:px-6 flex-1 w-full text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[#e07a28] font-sans">
          Shipment Updates
        </span>
        <h1 className="text-3xl font-serif font-bold text-[#2e1e12] mt-1 mb-2">
          Track Your Order
        </h1>
        <p className="text-sm text-[#6e5c50] font-sans mb-8 leading-relaxed">
          Enter your Order ID (e.g. #ICR-8491) or the 10-digit mobile number used at checkout to track real-time crafting and dispatch status.
        </p>

        <form onSubmit={handleSearch} className="bg-white border border-[#e5ddd0] rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1 text-xs font-sans">
            <label className="font-semibold text-[#5a3a1a]">
              Order ID or Mobile Number
            </label>
            <input
              type="text"
              required
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="e.g. #ICR-8491 or 9876543210"
              className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-3 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#e07a28] hover:bg-[#c96a1f] text-white font-bold font-sans text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            Track Shipment
          </button>

          {hasSearched && (
            <div className="mt-2 p-4 bg-[#fbf9f5] border border-[#e5ddd0] rounded-xl text-xs font-sans text-[#6e5c50] text-center">
              <p className="font-semibold text-[#2e1e12] mb-1">Looking up order &ldquo;{orderQuery}&rdquo;...</p>
              <p className="text-[11px]">
                Orders are handcrafted and dispatched within 24-48 hours. If you placed your order recently, your live courier tracking link will also be sent via SMS/WhatsApp.
              </p>
            </div>
          )}
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/customize"
            className="text-xs font-bold font-sans text-[#e07a28] hover:underline"
          >
            + Customize a new lithophane keepsake
          </Link>
        </div>
      </main>
    </div>
  );
}
