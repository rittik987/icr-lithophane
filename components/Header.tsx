"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ASSETS } from "@/lib/assets";
import { useCart } from "@/lib/cart";

interface HeaderProps {
  cartCount?: number;
}

const DESKTOP_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Order", href: "/orders" },
  { label: "Contact Us", href: "/contact" },
];

export default function Header({ cartCount: propCartCount }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { totalCount } = useCart();
  const cartCount = propCartCount !== undefined ? propCartCount : totalCount;

  return (
    <>
      {/* ── Fixed Header ─────────────────────────────────── */}
      <header className="fixed top-8 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.95)] border-b border-[#e5ddd0]">
        {/* ── Mobile header inner (default) ── Desktop header inner (lg+) ── */}
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 h-16 flex items-center">

          {/* Hamburger — mobile only */}
          <button
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar-nav"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex flex-col items-center justify-center w-9 h-9 gap-[5px] rounded-lg hover:bg-[#f2ebdc] transition-colors shrink-0"
          >
            <span className="block w-5 h-[1.5px] bg-[#2e1e12] rounded-full" />
            <span className="block w-4 h-[1.5px] bg-[#2e1e12] rounded-full self-start" />
            <span className="block w-5 h-[1.5px] bg-[#2e1e12] rounded-full" />
          </button>

          {/* Logo — centred on mobile, left on desktop */}
          <div className="flex-1 flex lg:flex-none justify-center lg:justify-start">
            <Link href="/" className="relative w-16 h-8 shrink-0 block">
              <Image
                src={ASSETS.logo}
                alt="ICR Custom Creations"
                fill
                className="object-contain object-center lg:object-left"
                unoptimized
              />
            </Link>
          </div>

          {/* Desktop inline nav — hidden on mobile */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {DESKTOP_NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-[#2e1e12] text-[13px] font-medium font-sans rounded-lg hover:bg-[#f2ebdc] hover:text-[#e07a28] transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart button — always right */}
          <div className="flex-none ml-auto lg:ml-0">
            <Link
              href="/cart"
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
            </Link>
          </div>
        </div>
      </header>

      {/* ── Sidebar Backdrop ─────────────────────────────── */}
      <div
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 z-50 bg-[#1c120a]/50 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? "auto" : "none" }}
      />

      {/* ── Sidebar Drawer ───────────────────────────────── */}
      <nav
        id="sidebar-nav"
        aria-label="Site navigation"
        className="fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-[#faf7f2] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-r border-[#e5ddd0]"
        style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        {/* Sidebar Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5ddd0] bg-[#f2ebdc]/80 backdrop-blur-sm">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="relative w-20 h-9 shrink-0 block"
          >
            <Image
              src={ASSETS.logo}
              alt="ICR Custom Creations"
              fill
              className="object-contain object-left"
              unoptimized
            />
          </Link>
          <button
            aria-label="Close navigation menu"
            onClick={() => setSidebarOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/70 border border-[#e5ddd0] hover:bg-[#e8dece] transition-colors text-[#2e1e12]"
          >
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Brand micro banner */}
        <div className="px-5 py-2.5 bg-[#eae2d2] border-b border-[#ded4c2] flex items-center justify-between text-[11px] font-medium text-[#6e5c50]">
          <span>Handcrafted Lithophanes</span>
          <span className="font-bold text-[#e07a28] uppercase tracking-wider text-[10px]">Solid Walnut</span>
        </div>

        {/* Navigation list */}
        <div className="flex flex-col py-3 px-3 flex-1 overflow-y-auto">
          {/* Top Primary Group: Order & Account */}
          <div className="space-y-1">
            {/* Order */}
            <Link
              href="/orders"
              onClick={() => setSidebarOpen(false)}
              className="group flex items-center justify-between p-3 rounded-2xl hover:bg-[#f2ebdc] transition-all text-[#2e1e12]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#f2ebdc] border border-[#e5ddd0] group-hover:bg-[#e07a28] group-hover:border-[#e07a28] group-hover:text-white text-[#4a3424] flex items-center justify-center shrink-0 transition-colors shadow-xs">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div>
                  <div className="text-[15px] font-bold font-sans tracking-tight group-hover:text-[#e07a28] transition-colors">
                    Order
                  </div>
                  <div className="text-[11px] text-[#7a6759] font-normal">
                    Track status & live dispatch
                  </div>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#b5a596] group-hover:text-[#e07a28] group-hover:translate-x-0.5 transition-all">
                <path d="M7.5 15L12.5 10L7.5 5" />
              </svg>
            </Link>

            {/* Account */}
            <Link
              href="/account"
              onClick={() => setSidebarOpen(false)}
              className="group flex items-center justify-between p-3 rounded-2xl hover:bg-[#f2ebdc] transition-all text-[#2e1e12]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#f2ebdc] border border-[#e5ddd0] group-hover:bg-[#e07a28] group-hover:border-[#e07a28] group-hover:text-white text-[#4a3424] flex items-center justify-center shrink-0 transition-colors shadow-xs">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div className="text-[15px] font-bold font-sans tracking-tight group-hover:text-[#e07a28] transition-colors">
                    Account
                  </div>
                  <div className="text-[11px] text-[#7a6759] font-normal">
                    Profile & saved creations
                  </div>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#b5a596] group-hover:text-[#e07a28] group-hover:translate-x-0.5 transition-all">
                <path d="M7.5 15L12.5 10L7.5 5" />
              </svg>
            </Link>
          </div>

          {/* Requested Horizontal Line Divider */}
          <div className="my-3 mx-2 border-t border-[#e2d8c9]" />

          {/* Secondary Group: Privacy Policy & Contact Us */}
          <div className="space-y-1">
            {/* Privacy Policy */}
            <Link
              href="/privacy-policy"
              onClick={() => setSidebarOpen(false)}
              className="group flex items-center justify-between p-3 rounded-2xl hover:bg-[#f2ebdc] transition-all text-[#2e1e12]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#f2ebdc] border border-[#e5ddd0] group-hover:bg-[#e07a28] group-hover:border-[#e07a28] group-hover:text-white text-[#4a3424] flex items-center justify-center shrink-0 transition-colors shadow-xs">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <div className="text-[15px] font-bold font-sans tracking-tight group-hover:text-[#e07a28] transition-colors">
                    Privacy Policy
                  </div>
                  <div className="text-[11px] text-[#7a6759] font-normal">
                    Photo confidentiality & privacy
                  </div>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#b5a596] group-hover:text-[#e07a28] group-hover:translate-x-0.5 transition-all">
                <path d="M7.5 15L12.5 10L7.5 5" />
              </svg>
            </Link>

            {/* Contact Us */}
            <Link
              href="/contact"
              onClick={() => setSidebarOpen(false)}
              className="group flex items-center justify-between p-3 rounded-2xl hover:bg-[#f2ebdc] transition-all text-[#2e1e12]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#f2ebdc] border border-[#e5ddd0] group-hover:bg-[#e07a28] group-hover:border-[#e07a28] group-hover:text-white text-[#4a3424] flex items-center justify-center shrink-0 transition-colors shadow-xs">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[15px] font-bold font-sans tracking-tight group-hover:text-[#e07a28] transition-colors">
                    Contact Us
                  </div>
                  <div className="text-[11px] text-[#7a6759] font-normal">
                    WhatsApp & studio assistance
                  </div>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#b5a596] group-hover:text-[#e07a28] group-hover:translate-x-0.5 transition-all">
                <path d="M7.5 15L12.5 10L7.5 5" />
              </svg>
            </Link>
          </div>

          {/* Quick Customize Card inside drawer */}
          <div className="mt-auto pt-4">
            <div className="p-4 rounded-2xl bg-[#f2ebdc] border border-[#e5ddd0] shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e07a28]">
                  Handcrafted In India
                </span>
                <span className="text-[10px] font-bold text-[#2e1e12]">
                  From ₹1,499
                </span>
              </div>
              <p className="text-xs font-semibold text-[#2e1e12] mb-3">
                Create a Custom Backlit Lithophane Lamp
              </p>
              <Link
                href="/customize"
                onClick={() => setSidebarOpen(false)}
                className="w-full py-2.5 px-4 bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98]"
              >
                <span>Customize Now</span>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7.5 15L12.5 10L7.5 5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar footer with safe clearance for dev badge & home bar */}
        <div className="px-5 pt-3 pb-8 border-t border-[#e5ddd0] bg-[#f5ede0]/60">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#6e5c50]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Crafted with pride in India</span>
          </div>
          <p className="text-[10px] text-[#8f7c6e] text-center mt-0.5">
            ICR Custom Creations • 100% Solid Walnut
          </p>
        </div>
      </nav>
    </>
  );
}

