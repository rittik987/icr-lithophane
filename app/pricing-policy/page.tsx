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
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
          Commercial Terms &amp; Transparency
        </span>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2e1e12] mt-1 mb-3">
          Pricing Policy
        </h1>

        <p className="text-xs text-[#6e5c50] font-sans mb-8">
          Effective Date: September 2026 • Clear &amp; Transparent Pricing
        </p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed font-sans text-[#4a3b30] bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Section 1 */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              1. Currency &amp; GST
            </h2>

            <p>
              All prices displayed on{" "}
              <strong>ICR Custom Creations</strong> (
              <a
                href="https://www.icrcustomcreations.in"
                className="text-[#e07a28] underline"
              >
                icrcustomcreations.in
              </a>
              ) are quoted in{" "}
              <strong>Indian Rupees (INR / ₹)</strong>.
            </p>

            <p className="text-xs text-[#6e5c50]">
              The selling price of <strong>₹1,899</strong> is inclusive of
              applicable GST. GST is not added separately to the displayed
              product price.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-3 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              2. Product Pricing
            </h2>

            <p>
              The current standard selling price for our personalised 3D
              lithophane is:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#e5ddd0] rounded-xl overflow-hidden">
                <thead className="bg-[#faf7f2] text-[#2e1e12] font-semibold border-b border-[#e5ddd0]">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">MRP</th>
                    <th className="p-3 text-right">Selling Price</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f2ebdc]">
                  <tr>
                    <td className="p-3 font-medium text-[#2e1e12]">
                      Personalised 3D Lithophane
                    </td>

                    <td className="p-3 text-[#6e5c50] line-through">
                      ₹2,499
                    </td>

                    <td className="p-3 text-right font-bold text-[#2e1e12]">
                      ₹1,899
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0] text-xs">
              <p>
                <strong>MRP:</strong> ₹2,499
              </p>
              <p>
                <strong>Selling Price:</strong> ₹1,899
              </p>
              <p>
                <strong>GST:</strong> Included in the selling price
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              3. Online Payment
            </h2>

            <p>
              Online payments are securely processed through{" "}
              <strong>Razorpay</strong>.
            </p>

            <p className="text-xs text-[#6e5c50]">
              Customers can complete prepaid orders through the payment
              options made available during checkout.
            </p>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              4. Partial Cash on Delivery
            </h2>

            <p>
              Partial Cash on Delivery (COD) is available across India.
            </p>

            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0] text-xs">
              <ul className="list-disc list-inside space-y-1.5 text-[#6e5c50]">
                <li>
                  <strong className="text-[#2e1e12]">
                    Advance payment:
                  </strong>{" "}
                  ₹500 must be paid when placing the order.
                </li>

                <li>
                  <strong className="text-[#2e1e12]">
                    Remaining amount:
                  </strong>{" "}
                  The remaining amount is payable at the time of delivery.
                </li>

                <li>
                  <strong className="text-[#2e1e12]">
                    Delivery charge:
                  </strong>{" "}
                  A delivery charge of up to <strong>₹70</strong> applies to
                  partial COD orders.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              5. Prepaid Shipping
            </h2>

            <p>
              <strong>Shipping is free for prepaid orders.</strong>
            </p>

            <p className="text-xs text-[#6e5c50]">
              Partial COD orders are subject to the applicable delivery charge
              stated in this policy.
            </p>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              6. Bulk &amp; Corporate Orders
            </h2>

            <p>
              We accept <strong>bulk orders</strong> and{" "}
              <strong>corporate gifting orders</strong>.
            </p>

            <p className="text-xs text-[#6e5c50]">
              For bulk requirements, please contact our support team to discuss
              your order and pricing.
            </p>
          </section>

          {/* Section 7 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              7. Pricing Support
            </h2>

            <p className="text-xs text-[#6e5c50]">
              For pricing questions, payment assistance, bulk orders, or other
              commercial enquiries, please contact:
            </p>

            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0] text-xs">
              <p className="font-semibold text-[#2e1e12]">
                ICR Custom Creations
              </p>

              <p className="text-[#6e5c50]">
                Email:{" "}
                <a
                  href="mailto:support@icrcustomcreations.in"
                  className="text-[#e07a28] underline"
                >
                  support@icrcustomcreations.in
                </a>
              </p>

              <p className="text-[#6e5c50]">
                WhatsApp:{" "}
                <a
                  href="https://wa.me/919035765038"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e07a28] underline"
                >
                  +91 9035765038
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}