"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";

export default function PricingPolicyPage() {
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
                loading="eager"
              />
            </Link>
          </div>

          <div className="w-12" aria-hidden="true" />
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-20 max-w-3xl mx-auto px-4 sm:px-6 flex-1 w-full">
        <span className="text-xs font-bold uppercase tracking-widest text-[#e07a28] font-sans">
          Commercial Terms &amp; Transparency
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2e1e12] mt-1 mb-3">
          Pricing Policy
        </h1>
        <p className="text-xs text-[#6e5c50] font-sans mb-8">
          Effective Date: September 2026 • Transparent, Fair &amp; All-Inclusive Pricing
        </p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed font-sans text-[#4a3b30] bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Section 1: Overview */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              1. Currency &amp; Tax Inclusivity
            </h2>
            <p>
              All prices displayed on <strong>ICR Custom Creations</strong> (<a href="https://www.icrcustomcreations.in" className="text-[#e07a28] underline">icrcustomcreations.in</a>) are quoted in <strong>Indian National Rupees (INR / ₹)</strong>.
            </p>
            <p className="text-xs text-[#6e5c50]">
              All product prices are <strong>inclusive of applicable Goods and Services Tax (GST)</strong>. There are no hidden fees, surprise charges, or additional processing surcharges added at final checkout.
            </p>
          </section>

          {/* Section 2: Catalog Pricing */}
          <section className="flex flex-col gap-3 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              2. Standard Product Price Schedule
            </h2>
            <p>
              We currently offer our signature handcrafted lithophane lamp in a single standard size. Below is our current pricing:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#e5ddd0] rounded-xl overflow-hidden">
                <thead className="bg-[#faf7f2] text-[#2e1e12] font-semibold border-b border-[#e5ddd0]">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Specifications</th>
                    <th className="p-3 text-right">Price (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2ebdc]">
                  <tr>
                    <td className="p-3 font-medium text-[#2e1e12]">Personalised Lithophane Lamp</td>
                    <td className="p-3 text-[#6e5c50]">Wooden frame (8&times;6&rdquo;), warm 2400K LED, custom 3D-printed lithophane panel, DC power adapter &amp; cable, gift-ready packaging</td>
                    <td className="p-3 text-right font-bold text-[#2e1e12]">₹2,199</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#8f7c6e]">
              * All prices are inclusive of GST. Free shipping on all prepaid orders.
            </p>
          </section>

          {/* Section 3: Shipping charges */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              3. Delivery &amp; Shipping Charges
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#6e5c50] ml-1">
              <li>
                <strong className="text-[#2e1e12]">Prepaid Orders (UPI / Debit &amp; Credit Cards / Net Banking):</strong> We provide <strong>100% Free Shipping</strong> across all serviceable pincodes in India.
              </li>
              <li>
                <strong className="text-[#2e1e12]">Partial Cash on Delivery (COD) Orders:</strong> A nominal ₹70 courier handling and cash collection fee is applied. (Customers pay ₹199 advance verification token online, and the remaining balance upon parcel delivery).
              </li>
            </ul>
          </section>

          {/* Section 4: Accepted Payment Modes */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              4. Payment Gateways &amp; Accepted Modes
            </h2>
            <p>
              We partner with <strong>Razorpay</strong>, India’s leading RBI-authorized payment aggregator, to provide secure, encrypted transactions. We accept:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#6e5c50] ml-1">
              <li><strong>UPI:</strong> Google Pay, PhonePe, Paytm, BHIM, Cred, and any UPI application.</li>
              <li><strong>Cards:</strong> Visa, MasterCard, RuPay, Maestro, and American Express.</li>
              <li><strong>Net Banking:</strong> Over 50+ supported Indian nationalized and private banks.</li>
              <li><strong>Wallets &amp; PayLater:</strong> Major supported wallets and digital credit services.</li>
            </ul>
          </section>

          {/* Section 5: Price Variations & Invoicing */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              5. Invoicing &amp; Price Protection
            </h2>
            <p>
              The price charged to you is strictly the price displayed at the exact time your order is submitted. We do not retroactively modify prices after an order is placed. An electronic GST invoice is automatically generated and emailed to your registered address upon order confirmation.
            </p>
          </section>

          {/* Section 6: Contact */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              6. Pricing Inquiries &amp; Bulk Orders
            </h2>
            <p className="text-xs text-[#6e5c50]">
              For custom design requests, bulk wedding favors, or corporate gifting discounts, please write to our commercial team:
            </p>
            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0] text-xs">
              <p className="font-semibold text-[#2e1e12]">ICR Custom Creations - Billing Support</p>
              <p className="text-[#6e5c50]">Email: <a href="mailto:hello@icrcustomcreations.in" className="text-[#e07a28] underline">hello@icrcustomcreations.in</a></p>
              <p className="text-[#6e5c50]">Support Hotline: +91 9035765038 (Mon - Sat, 10:00 AM - 7:00 PM IST)</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
