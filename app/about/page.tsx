"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";

export default function AboutUsPage() {
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
          Our Story &amp; Craft
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2e1e12] mt-1 mb-3">
          About ICR Custom Creations
        </h1>
        <p className="text-xs text-[#6e5c50] font-sans mb-8">
          Handcrafted in India • Where Cherished Memories Meet Precision Light Art
        </p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed font-sans text-[#4a3b30] bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Section 1 */}
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-serif font-bold text-[#2e1e12]">
              Who We Are
            </h2>
            <p>
              <strong>ICR Custom Creations</strong> is an Indian artisanal design studio specializing in bespoke 3D-printed lithophane night lamps, keepsake light sculptures, and personalized handcrafted gifts.
            </p>
            <p>
              We bring photographs to life through the timeless art of <em>lithophanes</em>—an optical phenomenon where high-precision variations in material thickness transform a plain porcelain-textured surface into a luminous, high-definition image when illuminated from behind.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-3 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-lg font-serif font-bold text-[#2e1e12]">
              Artisan Craftsmanship &amp; Modern Technology
            </h2>
            <p>
              Each piece we craft is a unique marriage of computational design and traditional woodworking:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#e07a28] mb-1">
                  1. Optical Density Slicing
                </h3>
                <p className="text-xs text-[#6e5c50] leading-normal">
                  Your uploaded photograph is converted into over 1,200 micro-layers using sub-millimeter precision 3D additive manufacturing.
                </p>
              </div>
              <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#e07a28] mb-1">
                  2. Solid Natural Walnut
                </h3>
                <p className="text-xs text-[#6e5c50] leading-normal">
                  Every base and frame is carved from authentic natural walnut wood, hand-sanded and finished with organic oils.
                </p>
              </div>
              <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#e07a28] mb-1">
                  3. Warm Ambient LED Lighting
                </h3>
                <p className="text-xs text-[#6e5c50] leading-normal">
                  Integrated 3000K warm-tone LEDs rated for 50,000+ hours cast a gentle, flicker-free glow ideal for bedrooms and living spaces.
                </p>
              </div>
              <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#e07a28] mb-1">
                  4. Rigorous Quality Inspection
                </h3>
                <p className="text-xs text-[#6e5c50] leading-normal">
                  Before packing, every lamp is inspected in a dark room test to guarantee contrast, sharpness, and flawless illumination.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-lg font-serif font-bold text-[#2e1e12]">
              Our Mission &amp; Values
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#6e5c50] ml-1">
              <li><strong className="text-[#2e1e12]">Cherish Life’s Moments:</strong> Anniversaries, weddings, birthdays, baby milestones, and memorial tributes turned into eternal ambient keepsakes.</li>
              <li><strong className="text-[#2e1e12]">Uncompromising Privacy:</strong> Your personal photos are strictly used for your order and are never published, shared, or retained without permission.</li>
              <li><strong className="text-[#2e1e12]">Made in India with Pride:</strong> All design, manufacturing, assembly, and packaging are done locally by our team.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-2 border-t border-[#f2ebdc] pt-5">
            <h2 className="text-lg font-serif font-bold text-[#2e1e12]">
              Workshop &amp; Studio Location
            </h2>
            <p className="text-xs text-[#6e5c50]">
              Our manufacturing studio and customer experience operations are located at:
            </p>
            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e5ddd0] text-xs">
              <p className="font-semibold text-[#2e1e12]">ICR Custom Creations Studio</p>
              <p className="text-[#6e5c50]">Bannerghatta Road, Bangalore, Karnataka, 560068</p>
              <p className="text-[#6e5c50] mt-1">Email: <a href="mailto:hello@icrcustomcreations.in" className="text-[#e07a28] underline">hello@icrcustomcreations.in</a></p>
              <p className="text-[#6e5c50]">Customer Care: +91 9035765038 (Mon - Sat, 10:00 AM - 7:00 PM IST)</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
