"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";
import { useCart } from "@/lib/cart";

export default function AccountPage() {
  const router = useRouter();
  const { totalCount } = useCart();
  const [activeTab, setActiveTab] = useState<"profile" | "saved">("profile");

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] flex flex-col font-sans">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#6e5c50] hover:text-[#2e1e12] text-sm font-medium transition-colors"
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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

          <Link
            href="/cart"
            aria-label={`View cart, ${totalCount} items`}
            className="flex items-center gap-1.5 bg-[#e07a28] hover:bg-[#c96a1f] text-white rounded-full px-3 py-1.5 shadow-xs transition-all active:scale-[0.97] group"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 group-hover:scale-105 transition-transform">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="text-white text-xs font-bold tracking-wider uppercase">
              {totalCount}
            </span>
          </Link>
        </div>
      </header>

      {/* Main Account Area */}
      <main className="pt-24 pb-20 max-w-2xl mx-auto px-4 sm:px-6 flex-1 w-full">
        {/* Profile Card Header */}
        <div className="bg-white border border-[#e5ddd0] rounded-3xl p-6 sm:p-8 shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#f7ede2] to-transparent rounded-bl-full pointer-events-none opacity-60" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f2ebdc] to-[#e5ddd0] border border-[#d8cdbd] flex items-center justify-center shrink-0 shadow-inner">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2e1e12" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdf3e7] border border-[#f3d3b0] text-[11px] font-bold uppercase tracking-wider text-[#e07a28] mb-1.5">
                ICR Guest Account
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2e1e12]">
                Your Account
              </h1>
              <p className="text-xs sm:text-sm text-[#6e5c50] mt-1 leading-relaxed">
                Manage your handcrafted orders, saved customizations, and dispatch notifications.
              </p>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-[#f0e8dc]">
            <Link
              href="/orders"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf7f2] border border-[#e5ddd0] hover:border-[#e07a28] hover:bg-[#fffbf7] transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#e5ddd0] flex items-center justify-center shrink-0 text-[#2e1e12] group-hover:text-[#e07a28] transition-colors shadow-xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#2e1e12] group-hover:text-[#e07a28] transition-colors">
                  My Orders
                </div>
                <div className="text-[11px] text-[#8c786a] truncate">Track & history</div>
              </div>
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf7f2] border border-[#e5ddd0] hover:border-[#e07a28] hover:bg-[#fffbf7] transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#e5ddd0] flex items-center justify-center shrink-0 text-[#2e1e12] group-hover:text-[#e07a28] transition-colors shadow-xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#2e1e12] group-hover:text-[#e07a28] transition-colors">
                  Shopping Bag
                </div>
                <div className="text-[11px] text-[#8c786a] truncate">{totalCount} items saved</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e5ddd0] mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === "profile"
                ? "text-[#e07a28]"
                : "text-[#6e5c50] hover:text-[#2e1e12]"
            }`}
          >
            Details & Delivery
            {activeTab === "profile" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e07a28] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === "saved"
                ? "text-[#e07a28]"
                : "text-[#6e5c50] hover:text-[#2e1e12]"
            }`}
          >
            Custom Keepsakes
            {activeTab === "saved" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e07a28] rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" ? (
          <div className="space-y-4">
            <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#2e1e12]">Active Guest Session</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-[#f2ebdc] text-[#6e5c50]">
                  Session Linked
                </span>
              </div>
              <p className="text-xs text-[#6e5c50] leading-relaxed mb-4">
                Your customizations, cart items, and recent orders are safely maintained on this device. For order queries or to link an existing WhatsApp order, track using your mobile number.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#faf7f2] border border-[#e5ddd0] hover:border-[#e07a28] text-xs font-bold text-[#2e1e12] rounded-xl transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Lookup By Mobile / Order ID
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#faf7f2] border border-[#e5ddd0] hover:border-[#e07a28] text-xs font-bold text-[#2e1e12] rounded-xl transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Contact Studio Support
                </Link>
              </div>
            </div>

            <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#2e1e12] mb-2">Need Assistance with your Order?</h2>
              <p className="text-xs text-[#6e5c50] leading-relaxed mb-3">
                Every lithophane lamp is precision 3D-sculpted and mounted on certified solid walnut wood. Our Bangalore studio team is available Mon - Sat (10 AM - 7 PM).
              </p>
              <div className="text-xs text-[#2e1e12] space-y-1 font-medium">
                <div>Email: <a href="mailto:hello@icrcustomcreations.com" className="text-[#e07a28] hover:underline">hello@icrcustomcreations.com</a></div>
                <div>WhatsApp Support: <span className="font-semibold">+91 98765 43210</span></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#e5ddd0] rounded-2xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#faf7f2] border border-[#e5ddd0] flex items-center justify-center text-[#e07a28] mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-[#2e1e12] mb-1">Create Your Next Memory</h2>
            <p className="text-xs text-[#6e5c50] max-w-sm mx-auto mb-5 leading-relaxed">
              Design a custom backlit 3D photo lamp with custom text engraving, anniversary dates, or Spotify code.
            </p>
            <Link
              href="/customize"
              className="inline-flex items-center justify-center bg-[#e07a28] hover:bg-[#c96a1f] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              Start New Customization
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
