"use client";

import { useState } from "react";
import Image from "next/image";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What type of photos work best?",
    answer:
      "High-resolution photos with clear lighting and good contrast work best. Portraits of people and pets with defined facial features yield the most stunning 3D detail. Avoid photos that are blurry, heavily filtered, or have dark shadows over the face.",
  },
  {
    question: "What are the dimensions of the lamp?",
    answer:
      "The standard wooden frame measures approximately 8.5\" × 6.5\" × 1.8\" (approx. 21.5 cm × 16.5 cm × 4.5 cm). It is designed to sit comfortably on desks, nightstands, mantelpieces, and bookshelves.",
  },
  {
    question: "What material is the frame made of?",
    answer:
      "Each frame is handcrafted from premium natural wooden material, carefully sanded, stained, and finished with a protective wax for a warm, organic feel that complements any room decor.",
  },
  {
    question: "What kind of light is used?",
    answer:
      "We use warm white, flicker-free LED lighting (3000K) with 90+ CRI. It is designed to be gentle on the eyes and provides an even, warm backlight that brings your photograph to life without any hot spots or glare.",
  },
  {
    question: "How is it powered?",
    answer:
      "The lamp comes with a dedicated DC power adapter and cable. You can plug it into any standard wall outlet for safe, continuous illumination.",
  },
  {
    question: "How long does it take to make and deliver?",
    answer:
      "Each lithophane is custom 3D-printed and assembled by hand. Production takes 1–2 business days, followed by free pan-India express delivery in 3–5 business days. You will receive live tracking updates via WhatsApp and SMS.",
  },
  {
    question: "Can I use more than one photo?",
    answer:
      "Our standard lithophane frame is designed for a single standout photograph to maximize resolution and depth. If you have multiple moments you cherish, you can customize additional lithophane panels or order multiple lamps.",
  },
  {
    question: "Can I request any customizations?",
    answer:
      "Yes! You can add custom text, special dates, or commemorative messages during customization. For bespoke sizing or special framing requests, you can also reach out to our design team directly.",
  },
  {
    question: "What if I’m not happy with the product?",
    answer:
      "We take immense pride in our craftsmanship. If your lamp arrives damaged or doesn't meet our strict quality standards, we will happily reprint and replace it free of charge or issue a full refund under our 100% Quality Guarantee.",
  },
];

export default function FaqSection() {
  // First item open by default for clear affordance
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

        {/* ══════════════════════════════════════════════════════
            SECTION HEADER
        ════════════════════════════════════════════════════════ */}
        <div className="text-center flex flex-col items-center gap-2">
          <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.26em] uppercase font-sans">
            FAQ
          </p>

          <h2 className="text-[#2e1e12] font-serif font-bold text-[28px] sm:text-[34px] lg:text-[42px] leading-tight">
            {/* Desktop: Frequently Asked Questions / Mobile: Got Questions? */}
            <span className="lg:hidden">Got Questions?</span>
            <span className="hidden lg:inline">Frequently Asked Questions</span>
          </h2>

          <p className="text-[#6e5c50] text-[13px] sm:text-[14px] lg:text-[15px] font-sans leading-relaxed max-w-[480px]">
            <span className="lg:hidden">Here are some quick answers to help you.</span>
            <span className="hidden lg:inline">
              Everything you need to know about our handcrafted lithophane keepsakes.
            </span>
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════
            DESKTOP LAYOUT (2-Column: Left Image + Right Accordion)
        ════════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid grid-cols-[1fr_1.35fr] gap-12 xl:gap-16 items-start">
          {/* Left Lamp Showcase Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(46,30,18,0.1)] border border-[#e8dfd2] bg-white sticky top-24">
            <Image
              src="/photos/faq-lithophane.jpg"
              alt="Handcrafted wooden lithophane lamp with boy and puppy portrait glowing warm light"
              width={600}
              height={650}
              className="w-full h-auto object-cover block select-none"
              priority
            />
          </div>

          {/* Right Accordion List */}
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

                    {/* Circular + / - button matching the design */}
                    <div
                      className={`w-7 h-7 rounded-full border transition-all duration-300 ease-in-out flex items-center justify-center shrink-0 ${
                        isOpen
                          ? "border-[#c96a1e] bg-[#c96a1e] text-white rotate-45"
                          : "border-[#d6cbbe] text-[#5a3a1a] bg-transparent group-hover:border-[#c96a1e]"
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                  </button>

                  {/* Smooth Animated Accordion Drawer */}
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

        {/* ══════════════════════════════════════════════════════
            MOBILE LAYOUT (Stacked: Image Top + Accordion Below)
        ════════════════════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col gap-6">
          {/* Top Image Showcase */}
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(46,30,18,0.08)] border border-[#e8dfd2] bg-white relative">
            <Image
              src="/photos/faq-lithophane.jpg"
              alt="Illuminated boy and dog lithophane keepsake lamp"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Accordion List */}
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

                    {/* Circular + / - button */}
                    <div
                      className={`w-6 h-6 rounded-full border transition-all duration-300 ease-in-out flex items-center justify-center shrink-0 ${
                        isOpen
                          ? "border-[#c96a1e] bg-[#c96a1e] text-white rotate-45"
                          : "border-[#d6cbbe] text-[#5a3a1a] bg-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                  </button>

                  {/* Smooth Animated Accordion Drawer */}
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
        </div>

      </div>
    </section>
  );
}
