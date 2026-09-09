"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";

export default function PrivacyPolicyPage() {
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

      {/* Content */}
      <main className="pt-24 pb-20 max-w-3xl mx-auto px-4 sm:px-6 flex-1 w-full">
        <span className="text-xs font-bold uppercase tracking-widest text-[#e07a28] font-sans">
          Legal &amp; Trust
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2e1e12] mt-1 mb-3">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#6e5c50] font-sans mb-8">
          Last updated: September 2026 • ICR Custom Creations Private Limited
        </p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed font-sans text-[#4a3b30] bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 shadow-sm">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              1. Information We Collect
            </h2>
            <p>
              At ICR Custom Creations, we respect your privacy. When you purchase or customize a personalized lithophane lamp, we collect information necessary to craft and deliver your order, including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#6e5c50] ml-2">
              <li>Your contact information: Name, phone number, and email address.</li>
              <li>Shipping address and pincode for insured courier delivery across India.</li>
              <li>Uploaded photographs and custom engraved messages required for manufacturing your bespoke lithophane lamp.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              2. Privacy of Customer Photographs
            </h2>
            <p>
              Your personal photographs are treated with the highest degree of confidentiality. Photographs uploaded to customize your lithophane lamp are stored securely and used <strong>strictly and exclusively</strong> for the precision 3D rendering and laser engraving of your physical keepsake.
            </p>
            <p className="text-xs text-[#6e5c50]">
              We do not share, sell, distribute, or publicly display customer-uploaded personal photos without your explicit, written consent.
            </p>
          </section>

          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              3. Payment Information
            </h2>
            <p>
              All online payments are processed through RBI-authorized, PCI-DSS compliant payment gateways (such as Razorpay, UPI, and major banks). We do not store or have access to your raw credit card numbers, CVVs, or net banking passwords.
            </p>
          </section>

          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              4. Contact Our Privacy Officer
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding the deletion of your uploaded photos after delivery, please contact our support team at:
            </p>
            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0] text-xs">
              <p className="font-semibold text-[#2e1e12]">ICR Custom Creations Support</p>
              <p className="text-[#6e5c50]">Email: hello@icrcustomcreations.com</p>
              <p className="text-[#6e5c50]">Response time: Within 24 business hours</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
