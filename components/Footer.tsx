import Link from "next/link";
import Image from "next/image";
import { ASSETS } from "@/lib/assets";

export default function Footer() {
  return (
    <footer className="border-t border-[#e5ddd0] bg-[#fcfaf7] text-[#2e1e12] pt-12 pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8 w-full font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Main 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <span className="font-serif font-bold text-lg tracking-wider text-[#2e1e12] block">
                ICR CUSTOM CREATIONS
              </span>
            </Link>
            <p className="text-xs text-[#6e5c50] leading-relaxed">
              Artisanal 3D-printed lithophane night lamps and bespoke keepsake lighting, crafted with wooden frames and warm ambient LEDs in Bangalore, India.
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-[#c96a1f]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>100% Handcrafted &amp; Made in India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2e1e12] font-serif mb-1">
              Explore
            </h3>
            <ul className="space-y-2 text-xs text-[#6e5c50]">
              <li>
                <Link href="/" className="hover:text-[#e07a28] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/customize" className="hover:text-[#e07a28] transition-colors font-medium text-[#2e1e12]">
                  Customize a Lamp
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#e07a28] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#e07a28] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#e07a28] transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Razorpay Mandatory Policies */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2e1e12] font-serif mb-1">
              Trust &amp; Policies
            </h3>
            <ul className="space-y-2 text-xs text-[#6e5c50]">
              <li>
                <Link href="/pricing-policy" className="hover:text-[#e07a28] transition-colors">
                  Pricing Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#e07a28] transition-colors">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation-refund-policy" className="hover:text-[#e07a28] transition-colors">
                  Cancellation &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-[#e07a28] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#e07a28] transition-colors">
                  Privacy &amp; Photo Confidentiality
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Workshop */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2e1e12] font-serif mb-1">
              Customer Care
            </h3>
            <div className="text-xs text-[#6e5c50] space-y-1.5">
              <p>
                <strong className="text-[#2e1e12] block">Email Support:</strong>
                <a href="mailto:hello@icrcustomcreations.in" className="hover:text-[#e07a28] transition-colors underline">
                  hello@icrcustomcreations.in
                </a>
              </p>
              <p>
                <strong className="text-[#2e1e12] block">Helpdesk:</strong>
                <span>+91 9035765038 (10 AM - 7 PM IST)</span>
              </p>
              <p className="pt-1">
                <strong className="text-[#2e1e12] block">Workshop Studio:</strong>
                <span>Bannerghatta Road, Bangalore, Karnataka, 560068</span>
              </p>
              <div className="pt-1">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e07a28] hover:underline"
                >
                  <span>Contact Form &amp; Help Desk</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar: Trust badge & Copyright */}
        <div className="border-t border-[#e5ddd0] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs text-[#6e5c50]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#1e7234]"></span>
            <span>100% Secure Payments powered by <strong>Razorpay</strong> (UPI, Cards, Net Banking)</span>
          </div>

          <p className="text-[11px] text-[#8f7c6e] tracking-wider uppercase">
            &copy; {new Date().getFullYear()} ICR CUSTOM CREATIONS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
