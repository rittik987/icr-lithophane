"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Can I use any kind of photo?",
    answer:
      "Yes. You can create your lithophane using the photo you want. It can be a photo of a person, a pet, a place, a group, a celebration, a favourite memory, or anything else that is meaningful to you. For the best result, choose a clear photo with good lighting and visible details.",
  },
  {
    question: "Can I use more than one photo?",
    answer:
      "Yes. Multiple templates are available, and some templates support creating a collage from multiple photos. You can choose the template that fits the design you want and preview it before placing your order.",
  },
  {
    question: "Can I create a collage?",
    answer:
      "Yes. You can create a photo collage where the selected template supports multiple photos. This is useful when you want to combine several memories into one personalised lithophane instead of using only one image.",
  },
  {
    question: "Can I preview my design before ordering?",
    answer:
      "Yes. The customisation experience includes a preview so you can see your design before placing the order. You can choose your template, add your photo or collage, review the result, and then place your order.",
  },
  {
    question: "Can I make it as a gift or keep it for myself?",
    answer:
      "Absolutely. The product is completely customisable and is not limited to any particular type of occasion or relationship. You can create one as a birthday gift, wedding gift, celebration gift, personal keepsake, or simply make one for your own space.",
  },
  {
    question: "What are the size and product specifications?",
    answer:
      "The overall frame measures 20 × 15 × 4 cm. It has a wooden frame, warm LED lighting, and comes with a 12V / 1A power adapter. The finished product weighs approximately 430 g.",
  },
  {
    question: "What comes in the box?",
    answer:
      "Each order includes the personalised lithophane with its wooden frame, one 12V / 1A power adapter, and one thank-you card.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Orders are generally delivered within 3–5 business days. Prepaid orders include free shipping. Partial Cash on Delivery is also available across India, with a delivery charge of up to ₹70.",
  },
  {
    question: "How does partial Cash on Delivery work?",
    answer:
      "With partial COD, you pay ₹500 in advance when placing the order and the remaining amount at the time of delivery. A delivery charge of up to ₹70 applies to partial COD orders.",
  },
  {
    question: "What if I need to cancel my order?",
    answer:
      "Cancellation depends on the production stage. For both prepaid and partial COD orders, if you cancel before production starts, ₹150 is deducted and the remaining amount paid is refunded. After production starts, ₹500 is deducted and the remaining amount, if any, is refunded. Once the order has been dispatched, it cannot be cancelled and no refund is provided.",
  },
  {
    question: "What if my lithophane arrives damaged?",
    answer:
      "If your product arrives damaged during delivery, is defective, or contains a customisation error made by ICR Custom Creations, you can request a replacement within 48 hours of delivery. Please provide your Order ID along with clear photos or videos of the product and packaging. Approved replacements are provided at no additional cost.",
  },
  {
    question: "What if I entered the wrong photo or text?",
    answer:
      "Because the product is personalised, customers are responsible for checking their selected photo, text, collage, and other details before placing the order. A replacement is not available for incorrect customer-provided details or a change of mind. If the customisation error was made by ICR Custom Creations, the product is eligible for replacement.",
  },
  {
    question: "What happens to my uploaded photo?",
    answer:
      "Your uploaded photo is used to create your personalised order. After your order has been delivered, the customer image is deleted from our production storage.",
  },
  {
    question: "What if the light stops working?",
    answer:
      "The electronic lighting components are covered by a 6-month limited warranty for eligible manufacturing defects. This covers the warm LED/light system and the included 12V / 1A power adapter. Physical damage, misuse, water or liquid exposure, unauthorised modifications, and normal wear and tear are not covered.",
  },
  {
    question: "Do you accept bulk or corporate orders?",
    answer:
      "Yes. We accept bulk and corporate gifting orders. For larger quantities or specific requirements, contact our support team to discuss the order and pricing.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggleFaq(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <section
      id="faq"
      className="w-full bg-[#faf7f2] border-t border-[#eee5d8] py-16 lg:py-24 px-4 sm:px-6 overflow-hidden"
      aria-label="Frequently Asked Questions"
    >
      <div className="max-w-[1240px] mx-auto flex flex-col gap-10">
        {/* Section Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.26em] uppercase font-sans">
            FAQ
          </p>

          <h2 className="text-[#2e1e12] font-serif font-bold text-[28px] sm:text-[34px] lg:text-[42px] leading-tight">
            <span className="lg:hidden">Questions You May Have</span>
            <span className="hidden lg:inline">
              Frequently Asked Questions
            </span>
          </h2>

          <p className="text-[#6e5c50] text-[13px] sm:text-[14px] lg:text-[15px] font-sans leading-relaxed max-w-[560px]">
            <span className="lg:hidden">
              Everything you need to know before creating your lithophane.
            </span>

            <span className="hidden lg:inline">
              From choosing your photo and creating a collage to delivery,
              cancellation, replacement, and warranty.
            </span>
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden lg:grid grid-cols-[0.9fr_1.4fr] gap-12 xl:gap-16 items-start">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(46,30,18,0.1)] border border-[#e8dfd2] bg-white sticky top-24">
            <Image
              src="/photos/faq-lithophane.jpg"
              alt="Personalised lithophane lamp glowing with warm light in a wooden frame"
              width={600}
              height={650}
              className="w-full h-auto object-cover block select-none"
              priority
            />

            <div className="absolute bottom-5 left-5 right-5">
              <div className="inline-flex items-center bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-[#eee5d8]">
                <span className="text-[#2e1e12] text-[10px] font-bold tracking-[0.14em] uppercase">
                  Made from your photo
                </span>
              </div>
            </div>
          </div>

          {/* Accordion */}
          <div className="flex flex-col divide-y divide-[#eee5d8] border-y border-[#eee5d8]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;

              return (
                <div key={item.question} className="py-4 xl:py-5">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between gap-4 text-left group cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[#2e1e12] font-serif font-bold text-[17px] xl:text-[18px] group-hover:text-[#c96a1e] transition-colors leading-snug">
                      {item.question}
                    </span>

                    <div
                      className={`w-7 h-7 rounded-full border transition-all duration-300 ease-in-out flex items-center justify-center shrink-0 ${
                        isOpen
                          ? "border-[#c96a1e] bg-[#c96a1e] text-white rotate-45"
                          : "border-[#d6cbbe] text-[#5a3a1a] bg-transparent group-hover:border-[#c96a1e]"
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div
                        className={`pt-3 pb-1 pr-8 text-[#5c493d] text-[14px] font-sans leading-relaxed transition-opacity duration-300 ease-in-out ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex flex-col gap-6">
          {/* Image */}
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(46,30,18,0.08)] border border-[#e8dfd2] bg-white relative">
            <Image
              src="/photos/faq-lithophane.jpg"
              alt="Personalised lithophane lamp glowing with warm light"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-3 left-3">
              <div className="inline-flex items-center bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
                <span className="text-[#2e1e12] text-[9px] font-bold tracking-[0.12em] uppercase">
                  Made from your photo
                </span>
              </div>
            </div>
          </div>

          {/* Accordion */}
          <div className="flex flex-col divide-y divide-[#eee5d8] border-y border-[#eee5d8]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;

              return (
                <div key={item.question} className="py-3.5 sm:py-4">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between gap-3 text-left group cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[#2e1e12] font-serif font-bold text-[15px] sm:text-[16px] group-hover:text-[#c96a1e] transition-colors leading-snug">
                      {item.question}
                    </span>

                    <div
                      className={`w-6 h-6 rounded-full border transition-all duration-300 ease-in-out flex items-center justify-center shrink-0 ${
                        isOpen
                          ? "border-[#c96a1e] bg-[#c96a1e] text-white rotate-45"
                          : "border-[#d6cbbe] text-[#5a3a1a] bg-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div
                        className={`pt-2.5 pb-1 pr-6 text-[#5c493d] text-[13px] font-sans leading-relaxed transition-opacity duration-300 ease-in-out ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Support CTA */}
          <div className="rounded-2xl bg-[#f2ebdc] border border-[#e5ddd0] p-5 text-center">
            <p className="text-[#2e1e12] font-serif font-bold text-[18px]">
              Still have a question?
            </p>

            <p className="text-[#6e5c50] text-[12px] leading-relaxed mt-1.5">
              Our support team can help you with your order or customisation.
            </p>

            <div className="flex items-center justify-center gap-3 mt-4">
              <a
                href="https://wa.me/919035765038"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#2e1e12] text-white text-[11px] font-bold"
              >
                WhatsApp Us
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-[#d8cbbd] text-[#2e1e12] text-[11px] font-bold bg-white"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
