"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";

export default function ShippingPolicyPage() {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[#6e5c50] hover:text-[#2e1e12] font-sans text-sm font-medium transition-colors z-10 cursor-pointer"
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>

          {/* Center: Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex items-center justify-center">
            <Link
              href="/"
              className="relative w-24 h-24 flex items-center justify-center shrink-0 block hover:opacity-90 transition-opacity"
              aria-label="ICR Custom Creations Home"
            >
              <Image
                src={ASSETS.logo}
                alt="ICR Custom Creations"
                fill
                sizes="96px"
                className="object-contain object-center"
                priority
              />
            </Link>
          </div>

          <div className="w-12" aria-hidden="true" />
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-20 max-w-3xl mx-auto px-4 sm:px-6 flex-1 w-full">
        <span className="text-xs font-bold uppercase tracking-widest text-[#e07a28] font-sans">
          Fulfillment &amp; Transit
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2e1e12] mt-1 mb-3">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="text-xs text-[#6e5c50] font-sans mb-8">
          Reliable, Insured Express Courier Delivery Across India
        </p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed font-sans text-[#4a3b30] bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Section 1: Overview */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              1. Handcrafted Production &amp; Curing Timeline
            </h2>
            <p>
              Unlike mass-produced commodities, every lithophane lamp ordered on <strong>ICR Custom Creations</strong> is made-to-order. Our artisan process requires:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
              <div className="bg-[#faf7f2] p-3.5 rounded-xl border border-[#e5ddd0]">
                <span className="text-[11px] font-bold text-[#e07a28] uppercase tracking-wider block mb-1">
                  1. 3D Slicing &amp; Printing
                </span>
                <p className="text-xs text-[#6e5c50]">
                  Over 1,200 micro-layers printed at 0.12mm layer height (approx. 14–20 hours per piece).
                </p>
              </div>
              <div className="bg-[#faf7f2] p-3.5 rounded-xl border border-[#e5ddd0]">
                <span className="text-[11px] font-bold text-[#e07a28] uppercase tracking-wider block mb-1">
                  2. Assembly &amp; Wood Curing
                </span>
                <p className="text-xs text-[#6e5c50]">
                  Solid walnut wood base hand-sanding, LED wiring installation, and quality testing.
                </p>
              </div>
            </div>
            <p className="text-xs text-[#6e5c50]">
              Total Workshop Processing Time: <strong>2 to 4 business days</strong> prior to courier handover.
            </p>
          </section>

          {/* Section 2: Delivery Timelines */}
          <section className="flex flex-col gap-3 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              2. Courier Transit Timelines Across India
            </h2>
            <p>
              Once your personalized lamp is dispatched from our workshop in Bangalore, delivery times are as follows:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#e5ddd0] rounded-xl overflow-hidden">
                <thead className="bg-[#faf7f2] text-[#2e1e12] font-semibold border-b border-[#e5ddd0]">
                  <tr>
                    <th className="p-3">Destination Region</th>
                    <th className="p-3">Courier Transit Time</th>
                    <th className="p-3">Estimated Total Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ebdc]">
                  <tr>
                    <td className="p-3 font-medium text-[#2e1e12]">Bengaluru &amp; Karnataka</td>
                    <td className="p-3 text-[#6e5c50]">1 – 2 business days</td>
                    <td className="p-3 font-semibold text-[#2e1e12]">3 – 5 business days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-[#2e1e12]">Metro Cities (Mumbai, Delhi-NCR, Kolkata, Hyderabad, Chennai)</td>
                    <td className="p-3 text-[#6e5c50]">3 – 5 business days</td>
                    <td className="p-3 font-semibold text-[#2e1e12]">5 – 8 business days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-[#2e1e12]">Rest of India (Tier 2 &amp; 3 towns)</td>
                    <td className="p-3 text-[#6e5c50]">4 – 7 business days</td>
                    <td className="p-3 font-semibold text-[#2e1e12]">6 – 10 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Shipping Rates */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              3. Shipping Charges
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#6e5c50] ml-1">
              <li>
                <strong className="text-[#2e1e12]">Prepaid Orders:</strong> We provide <strong>FREE standard express delivery</strong> on all prepaid orders (UPI, Debit/Credit Card, Net Banking) nationwide.
              </li>
              <li>
                <strong className="text-[#2e1e12]">Partial COD Orders:</strong> Flat <strong>₹70</strong> handling and cash collection fee applied at checkout.
              </li>
            </ul>
          </section>

          {/* Section 4: Courier Partners & Tracking */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              4. Courier Partners &amp; Tracking
            </h2>
            <p>
              We partner with India’s leading domestic logistics carriers including <strong>Blue Dart, Delhivery, DTDC, and India Post Speed Post</strong>.
            </p>
            <p className="text-xs text-[#6e5c50]">
              As soon as your parcel is picked up, you will automatically receive an AWB tracking number and live tracking link via SMS, WhatsApp, and Email. You can also track your parcel at any time through our <Link href="/orders" className="text-[#e07a28] underline">Orders page</Link>.
            </p>
          </section>

          {/* Section 5: Packaging & Protection */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              5. Multi-Layer Protective Packaging
            </h2>
            <p className="text-xs text-[#6e5c50]">
              Lithophane panels and wooden bases are delicate. Every shipment is packed inside custom-cut high-density shock absorbent foam, bubble-wrapped, and encased inside a rigid multi-ply cardboard box to ensure zero damage in transit.
            </p>
          </section>

          {/* Section 6: Inquiries */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              6. Shipping Support &amp; Address Updates
            </h2>
            <p className="text-xs text-[#6e5c50]">
              If you need to update an incorrect delivery address before dispatch or have queries about an in-transit parcel:
            </p>
            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0] text-xs">
              <p className="font-semibold text-[#2e1e12]">Logistics Desk - ICR Custom Creations</p>
              <p className="text-[#6e5c50]">Email: <a href="mailto:hello@icrcustomcreations.in" className="text-[#e07a28] underline">hello@icrcustomcreations.in</a></p>
              <p className="text-[#6e5c50]">WhatsApp: +91 9035765038</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
