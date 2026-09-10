"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";

export default function CancellationRefundPolicyPage() {
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
          Customer Protection &amp; Returns
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2e1e12] mt-1 mb-3">
          Cancellation &amp; Refund Policy
        </h1>
        <p className="text-xs text-[#6e5c50] font-sans mb-8">
          Last updated: September 2026 • 100% Free Replacement Guarantee for Transit Damage
        </p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed font-sans text-[#4a3b30] bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Section 1 */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              1. Order Cancellation Window
            </h2>
            <p>
              Because every lithophane lamp is a personalized creation custom-sliced and 3D printed with your personal photo:
            </p>
            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0] text-xs">
              <strong className="text-[#2e1e12]">2-Hour Grace Period:</strong> You can request an immediate, no-questions-asked cancellation within <strong>2 hours</strong> of placing your order by writing to us at <a href="mailto:hello@icrcustomcreations.in" className="text-[#e07a28] underline">hello@icrcustomcreations.in</a> or contacting our WhatsApp support with your Order ID. You will receive a <strong>100% full refund</strong>.
            </div>
            <p className="text-xs text-[#6e5c50]">
              Once an order enters physical manufacturing (after the 2-hour window), cancellation is not possible as material and machine hours have already been allocated to your bespoke piece.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-3 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              2. 100% Free Replacement Guarantee (Transit Damage &amp; Defects)
            </h2>
            <p>
              We stand behind the quality of our craftsmanship. If your lamp arrives broken, cracked, defective in illumination, or damaged during courier transit, we will replace it <strong>completely free of charge</strong>!
            </p>
            <div className="p-4 bg-[#fcf5ef] border border-[#f0dac6] rounded-xl text-xs flex flex-col gap-1.5">
              <span className="font-bold text-[#c96a1f] uppercase tracking-wider text-[11px]">
                How to Claim a Free Replacement:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[#6e5c50]">
                <li>Take clear photos and a brief unboxing video showing the damaged item and the courier box.</li>
                <li>Send the photos along with your Order ID to <a href="mailto:hello@icrcustomcreations.in" className="text-[#e07a28] underline">hello@icrcustomcreations.in</a> or WhatsApp (+91 9035765038) within <strong>48 hours of delivery</strong>.</li>
                <li>Our quality team will review and approve your replacement within 24 hours. A brand new lithophane lamp will be expedited and shipped to you at zero cost.</li>
              </ol>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              3. Personalized Goods Non-Returnable Clause
            </h2>
            <p>
              Under Indian Consumer Protection guidelines and standard e-commerce regulations, personalized and bespoke custom-made goods (such as 3D lithophane lamps engraved with private photographs) cannot be returned for a refund due to buyer’s remorse, change of mind, or subjective photo selection after delivery has occurred without defect.
            </p>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              4. Refund Processing Timelines &amp; Methods
            </h2>
            <p>
              In scenarios where a monetary refund is issued (e.g. order cancelled within the 2-hour grace period or order non-fulfillment due to technical issues):
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#6e5c50] ml-1">
              <li>
                <strong className="text-[#2e1e12]">Initiation:</strong> Refunds are initiated by our finance desk within <strong>24 business hours</strong> of approval.
              </li>
              <li>
                <strong className="text-[#2e1e12]">Settlement:</strong> Funds will be credited back to your <strong>original source of payment</strong> (Credit/Debit Card, UPI ID, or Net Banking account) via our payment gateway partner <strong>Razorpay</strong>.
              </li>
              <li>
                <strong className="text-[#2e1e12]">Bank Timeline:</strong> Banks and card networks typically reflect the credit within <strong>5 to 7 business days</strong> depending on your issuing bank.
              </li>
              <li>
                <strong className="text-[#2e1e12]">Partial COD Orders:</strong> In case of an approved refund on a Partial COD order, the advance token paid will be credited back to the customer’s UPI ID.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              5. Contact Support for Assistance
            </h2>
            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0] text-xs">
              <p className="font-semibold text-[#2e1e12]">Customer Resolutions Desk</p>
              <p className="text-[#6e5c50]">Email: <a href="mailto:hello@icrcustomcreations.in" className="text-[#e07a28] underline">hello@icrcustomcreations.in</a></p>
              <p className="text-[#6e5c50]">WhatsApp: +91 9035765038</p>
              <p className="text-[#6e5c50]">Working Hours: Monday to Saturday, 10:00 AM – 7:00 PM IST</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
