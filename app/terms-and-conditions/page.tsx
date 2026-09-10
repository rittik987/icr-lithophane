"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";

export default function TermsAndConditionsPage() {
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
          Agreement &amp; Terms of Service
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2e1e12] mt-1 mb-3">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-[#6e5c50] font-sans mb-8">
          Last updated: September 2026 • ICR Custom Creations Private Limited
        </p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed font-sans text-[#4a3b30] bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Section 1 */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              1. Acceptance of Terms
            </h2>
            <p>
              Welcome to <strong>ICR Custom Creations</strong> (<a href="https://www.icrcustomcreations.in" className="text-[#e07a28] underline">icrcustomcreations.in</a>). By accessing or using this website, placing an order, or utilizing our custom manufacturing services, you agree to be bound by these Terms and Conditions and our associated Privacy Policy, Shipping Policy, and Cancellation/Refund Policy.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              2. Personalized &amp; Custom-Manufactured Products
            </h2>
            <p>
              Every lithophane lamp produced by ICR Custom Creations is an individually manufactured, customized physical product rendered from a customer-supplied photograph and text engraving.
            </p>
            <p className="text-xs text-[#6e5c50]">
              Due to the personalized nature of additive manufacturing (3D printing and wood curing), an order cannot be cancelled, modified, or refunded once it enters the active production queue (past the 2-hour post-order grace period).
            </p>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              3. Customer Content &amp; Photograph Warranty
            </h2>
            <p>
              When uploading photographs, text, or artwork to our customization studio:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#6e5c50] ml-1">
              <li>You warrant that you own the rights to the uploaded photograph or have acquired explicit authorization from the copyright holder.</li>
              <li>You agree not to upload content that is defamatory, obscene, pornographic, promoting violence, hate speech, or infringing upon any third party’s intellectual property rights.</li>
              <li>We reserve the right to decline manufacturing any order containing inappropriate content and issue a full refund.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              4. Orders, Pricing &amp; Payments
            </h2>
            <p>
              All prices listed on the website are in Indian Rupees (INR) and are inclusive of Goods &amp; Services Tax (GST). Payments are securely captured through RBI-authorized payment partner <strong>Razorpay</strong>.
            </p>
            <p className="text-xs text-[#6e5c50]">
              In the event of an erroneous pricing display caused by technical glitch, ICR Custom Creations reserves the right to notify the customer and cancel the affected order with a full refund.
            </p>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              5. Shipping, Delivery &amp; Transit Damage
            </h2>
            <p>
              Estimated delivery times (3–7 business days) are guidelines provided by third-party courier services. While we take every effort to ensure timely delivery, courier transit delays during extreme weather or national holidays may occur.
            </p>
            <p className="text-xs text-[#6e5c50]">
              We provide a <strong>100% Free Replacement Guarantee</strong> for items damaged during courier transit, provided proof of damage is submitted within 48 hours of delivery as outlined in our Cancellation/Refund Policy.
            </p>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              6. Limitation of Liability
            </h2>
            <p className="text-xs text-[#6e5c50]">
              To the maximum extent permitted by Indian law, ICR Custom Creations and its directors shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services. Our total liability for any claim arising out of a purchase is strictly capped at the total amount paid by the customer for that specific order.
            </p>
          </section>

          {/* Section 7 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              7. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms and Conditions and any transactions concluded via this website shall be governed and construed in accordance with the laws of the Republic of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in <strong>Bangalore, Karnataka, India</strong>.
            </p>
          </section>

          {/* Section 8 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              8. Contacting Us Regarding Terms
            </h2>
            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0] text-xs">
              <p className="font-semibold text-[#2e1e12]">ICR Custom Creations - Legal &amp; Compliance</p>
              <p className="text-[#6e5c50]">Bannerghatta Road, Bangalore, Karnataka, 560068</p>
              <p className="text-[#6e5c50] mt-1">Email: <a href="mailto:hello@icrcustomcreations.in" className="text-[#e07a28] underline">hello@icrcustomcreations.in</a></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
