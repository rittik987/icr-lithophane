import Link from "next/link";
import Image from "next/image";
import { ASSETS } from "@/lib/assets";

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/icr_customcreations/",
  facebook: "YOUR_FACEBOOK_URL",
  youtube: "https://www.youtube.com/@icr_customcreations",
};

export default function Footer() {
  return (
    <footer className="border-t border-[#e5ddd0] bg-[#fcfaf7] text-[#2e1e12] pt-12 pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8 w-full font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="inline-flex items-center hover:opacity-90 transition-opacity"
              aria-label="ICR Custom Creations Home"
            >
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  src={ASSETS.logo}
                  alt="ICR Custom Creations"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
            </Link>

            <p className="text-xs text-[#6e5c50] leading-relaxed max-w-xs">
              Turn your favourite photo into a personalised 3D lithophane.
              Create something meaningful to gift, display, or keep for
              yourself.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-[#e5ddd0] bg-white flex items-center justify-center text-[#6e5c50] hover:text-[#e07a28] hover:border-[#e07a28] transition-colors"
              >
                {/* Instagram */}
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                  />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="0.8"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>

              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full border border-[#e5ddd0] bg-white flex items-center justify-center text-[#6e5c50] hover:text-[#e07a28] hover:border-[#e07a28] transition-colors"
              >
                {/* YouTube */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.8V8.2l6.5 3.8-6.5 3.8Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2e1e12] font-serif">
              Explore
            </h3>

            <ul className="space-y-2.5 text-xs text-[#6e5c50]">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#e07a28] transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/customize"
                  className="hover:text-[#e07a28] transition-colors font-medium text-[#2e1e12]"
                >
                  Customize Your Lithophane
                </Link>
              </li>

              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-[#e07a28] transition-colors"
                >
                  How It Works
                </Link>
              </li>

              <li>
                <Link
                  href="/orders"
                  className="hover:text-[#e07a28] transition-colors"
                >
                  Track Your Order
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="hover:text-[#e07a28] transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2e1e12] font-serif">
              Trust &amp; Policies
            </h3>

            <ul className="space-y-2.5 text-xs text-[#6e5c50]">
              <li>
                <Link
                  href="/pricing-policy"
                  className="hover:text-[#e07a28] transition-colors"
                >
                  Pricing Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/shipping-policy"
                  className="hover:text-[#e07a28] transition-colors"
                >
                  Shipping &amp; Delivery Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/cancellation-refund-replacement-policy"
                  className="hover:text-[#e07a28] transition-colors"
                >
                  Cancellation, Refund &amp; Replacement
                </Link>
              </li>

              <li>
                <Link
                  href="/terms-and-conditions"
                  className="hover:text-[#e07a28] transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-[#e07a28] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#2e1e12] font-serif">
              Customer Care
            </h3>

            <div className="text-xs text-[#6e5c50] space-y-3">
              <div>
                <strong className="text-[#2e1e12] block mb-0.5">
                  Email Support
                </strong>

                <a
                  href="mailto:support@icrcustomcreations.in"
                  className="hover:text-[#e07a28] transition-colors"
                >
                  support@icrcustomcreations.in
                </a>
              </div>

              <div>
                <strong className="text-[#2e1e12] block mb-0.5">
                  WhatsApp
                </strong>

                <a
                  href="https://wa.me/919035765038"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e07a28] transition-colors"
                >
                  +91 9035765038
                </a>
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e07a28] hover:underline"
              >
                <span>Contact Support</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#e5ddd0] pt-6 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-[#6e5c50]">
            <span className="inline-flex items-center gap-1.5">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18" />
              </svg>

              <span>
                Secure payments via <strong>Razorpay</strong>
              </span>
            </span>
          </div>

          <p className="text-[11px] text-[#8f7c6e] tracking-wider uppercase">
            &copy; {new Date().getFullYear()} ICR CUSTOM CREATIONS. ALL RIGHTS
            RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}