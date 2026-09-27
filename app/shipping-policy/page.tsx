
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
          Delivery &amp; Shipping
        </span>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2e1e12] mt-1 mb-3">
          Shipping &amp; Delivery Policy
        </h1>

        <p className="text-xs text-[#6e5c50] font-sans mb-8">
          Last updated: September 2026 • Clear &amp; Transparent Delivery Terms
        </p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed font-sans text-[#4a3b30] bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Section 1 */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              1. Delivery Coverage
            </h2>

            <p>
              ICR Custom Creations delivers personalised 3D lithophane
              products across India.
            </p>

            <p className="text-xs text-[#6e5c50]">
              Partial Cash on Delivery is available across India, subject to
              delivery serviceability at the customer&apos;s address.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              2. Delivery Timeline
            </h2>

            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0]">
              <p className="text-sm font-semibold text-[#2e1e12]">
                Estimated Delivery: 3–5 Business Days
              </p>

              <p className="text-xs text-[#6e5c50] mt-1.5">
                Orders are generally delivered within 3–5 business days.
              </p>
            </div>

            <p className="text-xs text-[#6e5c50]">
              Delivery timing may vary slightly in certain circumstances
              depending on the delivery location or courier service.
            </p>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              3. Prepaid Orders
            </h2>

            <p>
              <strong>Shipping is free for prepaid orders.</strong>
            </p>

            <p className="text-xs text-[#6e5c50]">
              The customer pays the full order amount online at checkout, and
              no additional shipping charge is applied to prepaid orders.
            </p>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-3 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              4. Partial Cash on Delivery
            </h2>

            <p>
              Partial Cash on Delivery is available across India, subject to
              delivery serviceability.
            </p>

            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0]">
              <ul className="list-disc list-inside space-y-1.5 text-xs text-[#6e5c50]">
                <li>
                  <strong className="text-[#2e1e12]">
                    ₹500 advance payment:
                  </strong>{" "}
                  The customer pays ₹500 when placing the order.
                </li>

                <li>
                  <strong className="text-[#2e1e12]">
                    Remaining amount:
                  </strong>{" "}
                  The remaining product amount is payable at the time of
                  delivery.
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
              5. Shipping Charges
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#e5ddd0] rounded-xl overflow-hidden">
                <thead className="bg-[#faf7f2] text-[#2e1e12] font-semibold border-b border-[#e5ddd0]">
                  <tr>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Payment at Order</th>
                    <th className="p-3">Shipping Charge</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f2ebdc]">
                  <tr>
                    <td className="p-3">Prepaid</td>
                    <td className="p-3">Full amount online</td>
                    <td className="p-3 font-medium">Free</td>
                  </tr>

                  <tr>
                    <td className="p-3">Partial COD</td>
                    <td className="p-3">₹500 advance</td>
                    <td className="p-3 font-medium">Up to ₹70</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-[#6e5c50]">
              Any applicable partial COD delivery charge is communicated as
              part of the order process.
            </p>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              6. Delivery Address
            </h2>

            <p>
              Customers are responsible for providing a complete and accurate
              delivery address and contact information when placing an order.
            </p>

            <p className="text-xs text-[#6e5c50]">
              Please review your delivery details carefully before confirming
              your order.
            </p>
          </section>

          {/* Section 7 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              7. Delivery Support
            </h2>

            <p className="text-xs text-[#6e5c50]">
              For delivery-related questions or assistance with your order,
              please contact:
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
