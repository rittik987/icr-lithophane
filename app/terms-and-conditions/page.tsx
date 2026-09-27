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
          Website Terms
        </span>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2e1e12] mt-1 mb-3">
          Terms &amp; Conditions
        </h1>

        <p className="text-xs text-[#6e5c50] font-sans mb-8">
          Last updated: September 2026 • Please read these terms carefully
        </p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed font-sans text-[#4a3b30] bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Section 1 */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              1. About ICR Custom Creations
            </h2>

            <p>
              These Terms &amp; Conditions govern your use of the ICR Custom
              Creations website and your purchase of products through the
              website.
            </p>

            <p>
              In these terms, <strong>“ICR Custom Creations”</strong>,{" "}
              <strong>“we”</strong>, <strong>“us”</strong>, and{" "}
              <strong>“our”</strong> refer to ICR Custom Creations.{" "}
              <strong>“You”</strong> and <strong>“customer”</strong> refer to
              the person using the website or placing an order.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              2. Personalised Products
            </h2>

            <p>
              ICR Custom Creations sells personalised 3D lithophane products
              created using photos or photo designs submitted by customers.
            </p>

            <p>
              Customers may use the available templates, upload a single
              photo, or create a collage where supported by the selected
              template.
            </p>

            <p className="text-xs text-[#6e5c50]">
              Because each product is personalised specifically for the
              customer, the product may not be suitable for cancellation,
              refund, or replacement in situations covered by the applicable
              policies.
            </p>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              3. Customer Responsibility for Customisation
            </h2>

            <p>
              Customers are responsible for reviewing their selected template,
              uploaded photo, collage, text, and other customisation details
              before placing an order.
            </p>

            <p className="text-xs text-[#6e5c50]">
              ICR Custom Creations is responsible for correcting or replacing a
              product when the customisation error was made by us, subject to
              the applicable Replacement Policy.
            </p>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              4. Customer-Submitted Content
            </h2>

            <p>
              Customers must have the right to use the photographs, images,
              text, or other content they submit for personalisation.
            </p>

            <p>
              Customers must not submit content that is unlawful, fraudulent,
              abusive, or infringes the rights of another person or
              organisation.
            </p>

            <p className="text-xs text-[#6e5c50]">
              ICR Custom Creations may refuse an order where the submitted
              content creates a legal, safety, or operational concern.
            </p>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              5. Orders &amp; Payment
            </h2>

            <p>
              An order is considered successfully placed once the applicable
              payment or required advance payment has been successfully
              completed and the order has been accepted by ICR Custom
              Creations.
            </p>

            <p>
              Available payment options and pricing are described in our{" "}
              <Link
                href="/pricing-policy"
                className="text-[#e07a28] underline"
              >
                Pricing Policy
              </Link>
              .
            </p>

            <p className="text-xs text-[#6e5c50]">
              Partial Cash on Delivery requires the applicable advance payment
              stated in the Pricing Policy.
            </p>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              6. Pricing
            </h2>

            <p>
              Product prices are displayed on the website and are subject to
              the pricing terms applicable at the time an order is placed.
            </p>

            <p>
              Current pricing, GST treatment, prepaid shipping, partial COD,
              and applicable delivery charges are described in our{" "}
              <Link
                href="/pricing-policy"
                className="text-[#e07a28] underline"
              >
                Pricing Policy
              </Link>
              .
            </p>
          </section>

          {/* Section 7 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              7. Shipping &amp; Delivery
            </h2>

            <p>
              Orders are delivered according to our current Shipping &amp;
              Delivery Policy.
            </p>

            <p>
              For current delivery timelines, delivery coverage, prepaid
              shipping, and partial COD delivery charges, please refer to our{" "}
              <Link
                href="/shipping-policy"
                className="text-[#e07a28] underline"
              >
                Shipping &amp; Delivery Policy
              </Link>
              .
            </p>
          </section>

          {/* Section 8 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              8. Cancellation &amp; Refunds
            </h2>

            <p>
              Because our products are personalised, cancellation and refund
              eligibility depends on the production stage of the order.
            </p>

            <p>
              The applicable cancellation deductions and refund rules are
              described in our{" "}
              <Link
                href="/cancellation-refund-replacement-policy"
                className="text-[#e07a28] underline"
              >
                Cancellation, Refund &amp; Replacement Policy
              </Link>
              .
            </p>
          </section>

          {/* Section 9 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              9. Product Replacement
            </h2>

            <p>
              Eligible products may be replaced when they arrive damaged, are
              defective, or contain a customisation error made by ICR Custom
              Creations, subject to the applicable replacement terms.
            </p>

            <p>
              Please refer to our{" "}
              <Link
                href="/cancellation-refund-replacement-policy"
                className="text-[#e07a28] underline"
              >
                Cancellation, Refund &amp; Replacement Policy
              </Link>{" "}
              for eligibility, documentation, timelines, and replacement
              procedures.
            </p>
          </section>

          {/* Section 10 */}
          {/* <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              10. Electronic Warranty
            </h2>

            <p>
              ICR Custom Creations provides a limited warranty for the
              electronic lighting components of the product as described in
              the applicable warranty terms.
            </p>

            <p className="text-xs text-[#6e5c50]">
              The warranty applies to eligible electronic manufacturing defects
              and is separate from the product replacement and cancellation
              policies.
            </p>
          </section> */}

          {/* Section 11 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              10. Website Use
            </h2>

            <p>
              Customers must use the website lawfully and must not attempt to
              interfere with, disrupt, damage, or gain unauthorised access to
              the website, its systems, or its services.
            </p>

            <p className="text-xs text-[#6e5c50]">
              Website content, design, images, branding, text, graphics, and
              other materials may not be copied, reproduced, or commercially
              reused without appropriate permission.
            </p>
          </section>

          {/* Section 12 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              11. Product Images &amp; Representation
            </h2>

            <p>
              Product images and previews are intended to represent the
              product and its customisation possibilities. Because each product
              is personalised using customer-submitted content, the final
              appearance may vary according to the submitted image, selected
              template, and customisation.
            </p>
          </section>

          {/* Section 13 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              12. Policy References
            </h2>

            <p>
              The following policies form part of the information governing
              your use of the website and purchase experience:
            </p>

            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#6e5c50] ml-1">
              <li>
                <Link
                  href="/pricing-policy"
                  className="text-[#e07a28] underline"
                >
                  Pricing Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/shipping-policy"
                  className="text-[#e07a28] underline"
                >
                  Shipping &amp; Delivery Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/cancellation-refund-replacement-policy"
                  className="text-[#e07a28] underline"
                >
                  Cancellation, Refund &amp; Replacement Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy-policy"
                  className="text-[#e07a28] underline"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </section>

          {/* Section 14 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              13. Changes to These Terms
            </h2>

            <p>
              ICR Custom Creations may update these Terms &amp; Conditions from
              time to time to reflect changes to our products, services,
              policies, or website.
            </p>

            <p className="text-xs text-[#6e5c50]">
              The latest version published on this website will apply to future
              website use and orders.
            </p>
          </section>

          {/* Section 15 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-base font-serif font-bold text-[#2e1e12]">
              14. Contact Us
            </h2>

            <p className="text-xs text-[#6e5c50]">
              For questions regarding these Terms &amp; Conditions, please
              contact ICR Custom Creations:
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