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
          Customer Protection &amp; Returns
        </span>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2e1e12] mt-1 mb-3">
          Cancellation, Refund &amp; Replacement Policy
        </h1>

        <p className="text-xs text-[#6e5c50] font-sans mb-8">
          Last updated: September 2026 • Clear &amp; Transparent Customer Terms
        </p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed font-sans text-[#4a3b30] bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Section 1 */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              1. About Cancellation &amp; Refunds
            </h2>

            <p>
              Every product ordered from ICR Custom Creations is personalised
              using the customer&apos;s selected design, photo, or collage.
              Because each product is created specifically for the customer,
              cancellation and refund eligibility depends on the production
              stage of the order.
            </p>

            <p className="text-xs text-[#6e5c50]">
              If you need to cancel your order, please contact us as soon as
              possible with your Order ID.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-3 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              2. Cancellation &amp; Refund Rules
            </h2>

            <div className="grid gap-3">
              {/* Before Production */}
              <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0]">
                <h3 className="font-semibold text-[#2e1e12] mb-1">
                  Before Production Starts
                </h3>

                <p className="text-xs text-[#6e5c50]">
                  If the order is cancelled before production starts,{" "}
                  <strong className="text-[#2e1e12]">
                    ₹150
                  </strong>{" "}
                  will be deducted from the amount already paid, and the
                  remaining amount will be refunded.
                </p>
              </div>

              {/* After Production */}
              <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0]">
                <h3 className="font-semibold text-[#2e1e12] mb-1">
                  After Production Starts
                </h3>

                <p className="text-xs text-[#6e5c50]">
                  If the order is cancelled after production has started,{" "}
                  <strong className="text-[#2e1e12]">
                    ₹500
                  </strong>{" "}
                  will be deducted from the amount already paid, and the
                  remaining amount, if any, will be refunded.
                </p>
              </div>

              {/* After Dispatch */}
              <div className="bg-[#fcf5ef] p-4 rounded-xl border border-[#f0dac6]">
                <h3 className="font-semibold text-[#2e1e12] mb-1">
                  After Dispatch
                </h3>

                <p className="text-xs text-[#6e5c50]">
                  Once the order has been dispatched, it cannot be cancelled
                  and no refund will be provided.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-3 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              3. Partial Cash on Delivery Orders
            </h2>

            <p>
              For partial Cash on Delivery orders, the customer pays{" "}
              <strong>₹500 in advance</strong> and the remaining amount is
              payable at the time of delivery.
            </p>

            <p className="text-xs text-[#6e5c50]">
              The same cancellation and refund rules apply to the ₹500 advance:
            </p>

            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0] text-xs">
              <ul className="list-disc list-inside space-y-1.5 text-[#6e5c50]">
                <li>
                  <strong className="text-[#2e1e12]">
                    Before production:
                  </strong>{" "}
                  ₹150 is deducted from the ₹500 advance, so ₹350 is refunded.
                </li>

                <li>
                  <strong className="text-[#2e1e12]">
                    After production starts:
                  </strong>{" "}
                  ₹500 is deducted, so no amount remains refundable from the
                  advance.
                </li>

                <li>
                  <strong className="text-[#2e1e12]">
                    After dispatch:
                  </strong>{" "}
                  No refund is provided.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              4. Refund Summary
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#e5ddd0] rounded-xl overflow-hidden">
                <thead className="bg-[#faf7f2] text-[#2e1e12] font-semibold border-b border-[#e5ddd0]">
                  <tr>
                    <th className="p-3">Order Type</th>
                    <th className="p-3">Cancellation Stage</th>
                    <th className="p-3">Refund Rule</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f2ebdc]">
                  <tr>
                    <td className="p-3">Prepaid</td>
                    <td className="p-3">Before production</td>
                    <td className="p-3">
                      Amount paid minus ₹150
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3">Prepaid</td>
                    <td className="p-3">After production starts</td>
                    <td className="p-3">
                      Amount paid minus ₹500
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3">Prepaid</td>
                    <td className="p-3">After dispatch</td>
                    <td className="p-3">
                      No refund
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3">Partial COD</td>
                    <td className="p-3">Before production</td>
                    <td className="p-3">
                      ₹500 advance minus ₹150 = ₹350 refund
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3">Partial COD</td>
                    <td className="p-3">After production starts</td>
                    <td className="p-3">
                      ₹500 advance minus ₹500 = ₹0 refund
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3">Partial COD</td>
                    <td className="p-3">After dispatch</td>
                    <td className="p-3">
                      No refund
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              5. Replacement Policy
            </h2>

            <p>
              At ICR Custom Creations, we provide replacements for products
              that arrive damaged during delivery, are defective, or are
              incorrect.
            </p>

            <p className="text-xs text-[#6e5c50]">
              Replacement requests must be submitted within{" "}
              <strong className="text-[#2e1e12]">
                48 hours of delivery
              </strong>
              .
            </p>

            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0]">
              <h3 className="font-semibold text-[#2e1e12] mb-2">
                How to Request a Replacement
              </h3>

              <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#6e5c50]">
                <li>
                  Provide your <strong className="text-[#2e1e12]">Order ID</strong>.
                </li>

                <li>
                  Provide clear <strong className="text-[#2e1e12]">
                    photos or videos of the product
                  </strong>{" "}
                  showing the issue.
                </li>

                <li>
                  Provide photos or videos of the{" "}
                  <strong className="text-[#2e1e12]">
                    packaging
                  </strong>{" "}
                  where applicable, especially for transit damage.
                </li>

                <li>
                  Our team will review the submitted information and verify the
                  issue.
                </li>
              </ol>
            </div>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              6. Eligible Replacement Cases
            </h2>

            <p>Personalised products are eligible for replacement when:</p>

            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#6e5c50] ml-1">
              <li>
                The product arrives damaged during delivery.
              </li>

              <li>
                The product is defective.
              </li>

              <li>
                The product contains a customisation error made by{" "}
                <strong className="text-[#2e1e12]">
                  ICR Custom Creations
                </strong>
                .
              </li>

              <li>
                The incorrect product was supplied by ICR Custom Creations.
              </li>
            </ul>

            <p className="text-xs text-[#6e5c50]">
              If the damage, defect, or error is verified, the replacement will
              be provided at <strong className="text-[#2e1e12]">
                no additional cost
              </strong>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              7. Cases Not Eligible for Replacement
            </h2>

            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#6e5c50] ml-1">
              <li>
                Incorrect details provided by the customer.
              </li>

              <li>
                Incorrect photo submitted by the customer.
              </li>

              <li>
                Incorrect text or other customisation details provided by the
                customer.
              </li>

              <li>
                Change of mind after the personalised product has been made.
              </li>

              <li>
                Damage caused by misuse or improper use.
              </li>

              <li>
                Damage caused by accidents or improper handling.
              </li>

              <li>
                Damage caused by unauthorised modifications.
              </li>

              <li>
                Damage caused by water or heat exposure.
              </li>

              <li>
                Normal wear and tear.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              8. Replacement Shipping &amp; Return
            </h2>

            <p>
              If a replacement request is approved, there will be{" "}
              <strong>no additional charge</strong> to the customer for the
              replacement.
            </p>

            <p className="text-xs text-[#6e5c50]">
              This includes the applicable{" "}
              <strong className="text-[#2e1e12]">
                return/reverse pickup and replacement delivery charges
              </strong>
              .
            </p>

            <p className="text-xs text-[#6e5c50]">
              Replacement may require the original product to be returned
              before the replacement is shipped.
            </p>

            <p className="text-xs text-[#6e5c50]">
              Replacement will be for the same or an equivalent product,
              subject to availability.
            </p>
          </section>

          {/* Section 9 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              9. Customer-Provided Information
            </h2>

            <p>
              Customers are responsible for reviewing their selected template,
              uploaded photo, collage, text, and other customisation details
              before placing the order.
            </p>

            <p className="text-xs text-[#6e5c50]">
              ICR Custom Creations is responsible for replacing a personalised
              product when the customisation error was made by us.
            </p>
          </section>

          {/* Section 10 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              10. How to Contact Us
            </h2>

            <p className="text-xs text-[#6e5c50]">
              For cancellation requests or replacement requests, please contact
              us with your Order ID and the relevant details as soon as
              possible.
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