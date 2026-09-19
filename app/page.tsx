import Header from "@/components/Header";
import MediaCarousel from "@/components/MediaCarousel";
import MediaGalleryDesktop from "@/components/MediaGalleryDesktop";
import HowItWorks from "@/components/HowItWorks";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import StickyBottomBar from "@/components/StickyBottomBar";
import CtaButton from "@/components/CtaButton";
import RazorpayAffordabilityWidget from "@/components/RazorpayAffordabilityWidget";
import PhotoToLithophane from "@/components/PhotoToLithophane";
import EveryDetailMatters from "@/components/EveryDetailMatters";
import KeepsakeOccasions from "@/components/KeepsakeOccasions";
import FaqSection from "@/components/FaqSection";
import { productApi } from "@/lib/api";
import { adaptProductMediaToSlides } from "@/lib/slides";

export const dynamic = 'force-dynamic';

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

export default async function HomePage() {
  const product = await productApi.getActiveProduct();
  const slides = adaptProductMediaToSlides(product);

  const sellingPrice =
    product?.sellingPrice !== undefined
      ? Math.round(product.sellingPrice / 100)
      : 2999;
  const mrp =
    product?.mrp !== undefined ? Math.round(product.mrp / 100) : null;
  const discountPercent =
    mrp && mrp > sellingPrice && mrp > 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;
  const rawBadge =
    discountPercent > 0
      ? (product?.computedDiscountBadge || product?.discountBadge || `SAVE ${discountPercent}%`)
      : null;
  // Format to clean, grammatically correct copy: "SAVE 27%" instead of redundant "SAVE 27% OFF"
  const discountBadge = rawBadge
    ? rawBadge.replace(/^SAVE\s+(\d+%)\s+OFF$/i, "SAVE $1").replace(/\s+OFF$/i, "")
    : null;

  const whatsIncluded = (
    product?.whatsIncluded && product.whatsIncluded.length > 0
      ? product.whatsIncluded
      : [
          "Custom lithophane in wooden frame",
          "DC power adapter",
          "Gift-ready packaging",
          "Free pan-India delivery",
        ]
  ).map((item) => item.replace(/solid walnut/gi, "wooden"));

  return (
    <>
      {/* ── Fixed chrome ──────────────────────────────────────── */}
      <Header />

      {/* ── Scrollable page body ─────────────────────────────── */}
      <main className="bg-[#faf7f2] min-h-screen pt-16 pb-20 lg:pb-0">

        {/* ── Page content width constraint ─────────────────── */}
        <div className="max-w-[1280px] mx-auto">

          {/* ══════════════════════════════════════════════════════
              HERO — mobile: full-bleed portrait carousel (text overlay on slide 1)
                    desktop: 2-col grid (media left, product info right)
          ════════════════════════════════════════════════════════ */}

          {/* ── Mobile Hero (hidden on lg+) ─────────────────── */}
          <div className="lg:hidden">
            {/* Carousel: full-bleed edge-to-edge, no padding */}
            <MediaCarousel slides={slides} product={product} />

            {/* Mobile Product Purchase & Affordability Panel */}
            <div className="px-5 pt-5 pb-6 flex flex-col gap-4 bg-[#faf7f2] border-b border-[#eee5d8]">
              {/* Eyebrow & Title */}
              <div className="flex flex-col gap-1.5">
                {/* <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.2em] uppercase font-sans">
                  {product?.tagline || "HANDCRAFTED KEEPSAKE"}
                </p> */}
                <h1 className="text-[#2e1e12] text-[24px] sm:text-[28px] font-bold leading-[1.22] font-serif">
                  {product?.name || "Personalised Lithophane Lamp"}
                </h1>
                <p className="text-[#6e5c50] text-[13px] font-sans leading-relaxed">
                  {(
                    product?.description ||
                    "Transform your cherished photo into a warm-glowing 3D keepsake, handcrafted in a premium wooden frame."
                  ).replace(/solid walnut/gi, "wooden")}
                </p>
              </div>

              {/* Price row */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-baseline gap-2.5 leading-none">
                    <span className="text-[#2e1e12] text-[28px] sm:text-[32px] font-bold leading-none font-sans">
                      ₹{sellingPrice.toLocaleString("en-IN")}
                    </span>
                    {mrp && mrp > 0 && (
                      <span className="text-[#6e5c50] text-sm line-through font-sans">
                        MRP ₹{mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <p className="text-[#6e5c50] text-[11px] font-medium mt-1 font-sans">
                    All taxes included · Free pan-India delivery
                  </p>
                </div>

                {/* Discount badge */}
                {discountBadge && (
                  <div className="bg-[#eaf5ec] border border-[#c6e6ca] rounded px-2.5 py-1 shrink-0">
                    <span className="text-[#1e7234] text-xs font-bold tracking-wider uppercase font-sans">
                      {discountBadge}
                    </span>
                  </div>
                )}
              </div>

              {/* Mobile Affordability Widget Slot */}
              {RAZORPAY_KEY && (
                <div id="razorpay-widget-slot-mobile" className="w-full min-h-[36px]" />
              )}

              {/* CTA button */}
              <CtaButton
                label="Customize & Place Order"
                href="/customize"
                size="lg"
                fullWidth
              />

              {/* Quick trust highlights */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f0e8dc] text-[11px] text-[#6e5c50] font-sans">
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c96a1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>100% Quality Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c96a1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="1" />
                    <path d="M16 8h4l3 5v4h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>Free Express Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Desktop Hero (hidden on mobile) ─────────────── */}
          <section className="hidden lg:block px-6 lg:px-8 xl:px-10 pt-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">

              {/* LEFT — Media gallery with thumbnail strip */}
              <div className="lg:col-span-6 min-w-0 sticky top-[84px]">
                <MediaGalleryDesktop slides={slides} />
              </div>

              {/* RIGHT — Product purchase panel */}
              <div className="lg:col-span-6 min-w-0 flex flex-col gap-5">

                {/* Eyebrow + headline + description */}
                <div className="flex flex-col gap-2 relative">
                  {/* <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.2em] uppercase font-sans">
                    {product?.tagline || "HANDCRAFTED KEEPSAKE"}
                  </p> */}
                  <h1 className="text-[#2e1e12] text-[32px] font-bold leading-[1.22] font-serif">
                    {product?.name || "Personalised Lithophane Lamp"}
                  </h1>
                  <p className="text-[#6e5c50] text-[14px] font-sans leading-relaxed">
                    {(
                      product?.description ||
                      "Transform your cherished photo into a warm-glowing 3D art piece, handcrafted in a premium wooden frame."
                    ).replace(/solid walnut/gi, "wooden")}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#e5ddd0]" />

                {/* Price row */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-2.5 leading-none">
                      <span className="text-[#2e1e12] text-[34px] font-bold leading-none font-sans">
                        ₹{sellingPrice.toLocaleString("en-IN")}
                      </span>
                      {mrp && mrp > 0 && (
                        <span className="text-[#6e5c50] text-sm line-through font-sans">
                          MRP ₹{mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <p className="text-[#6e5c50] text-[11px] font-medium mt-1 font-sans">
                      All taxes included
                    </p>
                  </div>

                  {/* Discount badge */}
                  {discountBadge && (
                    <div className="bg-[#eaf5ec] border border-[#c6e6ca] rounded px-3 py-1.5 shrink-0">
                      <span className="text-[#1e7234] text-xs font-bold tracking-wider uppercase font-sans">
                        {discountBadge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Desktop Affordability Widget Slot */}
                {RAZORPAY_KEY && (
                  <div id="razorpay-widget-slot-desktop" className="w-full min-h-[36px]" />
                )}

                {/* CTA button */}
                <CtaButton
                  label="Customize & Place Order"
                  href="/customize"
                  size="lg"
                  fullWidth
                />

                {/* What's included — 4-col icon chips with comfortable padding */}
                <div className="grid grid-cols-4 gap-2.5 pt-1">
                  {whatsIncluded.map((item, i) => {
                    const ICONS = [
                      // lithophane / frame
                      <svg key="frame" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c96a1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="6" y="6" width="12" height="12" rx="1" fill="#f2ebdc" stroke="#c96a1e" strokeWidth="1.2"/></svg>,
                      // USB cable / power
                      <svg key="usb" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c96a1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2v10M8 6l4-4 4 4"/><circle cx="12" cy="17" r="3"/><path d="M12 20v2"/></svg>,
                      // gift packaging
                      <svg key="gift" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c96a1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
                      // delivery truck
                      <svg key="truck" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c96a1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
                    ];
                    return (
                      <div key={item} className="flex flex-col items-center gap-1.5 text-center">
                        <div className="w-10 h-10 rounded-lg bg-[#f2ebdc] border border-[#e5ddd0] flex items-center justify-center shrink-0">
                          {ICONS[i % ICONS.length]}
                        </div>
                        <span className="text-[#6e5c50] text-[11px] font-sans leading-snug">
                          {item}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Trust line */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#f0e8dc]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6e5c50" strokeWidth="2" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <p className="text-[#6e5c50] text-[11px] font-medium font-sans">
                    100% Quality Guarantee · Cash on Delivery Available
                  </p>
                </div>


              </div>
            </div>
          </section>
        </div>

        {/* ══════════════════════════════════════════════════════
            BELOW FOLD — full-width alternating sections
        ════════════════════════════════════════════════════════ */}

        {/* Photo → Lithophane transformation section (Warm Sand #f2ebdc) */}
        <PhotoToLithophane />

        {/* Product details & craftsmanship showcase (Warm Ivory #faf7f2) */}
        <EveryDetailMatters />

        {/* How it works timeline (Warm Sand #f2ebdc) */}
        <HowItWorks />

        {/* Keepsake for Every Occasion / Bond (Warm Ivory #faf7f2) */}
        <KeepsakeOccasions />

        {/* Customer reviews (Warm Ivory #faf7f2) — Temporarily hidden until customer reviews arrive */}
        {/* <ReviewsSection /> */}

        {/* Frequently Asked Questions (Warm Ivory #faf7f2) */}
        <FaqSection />

        {/* Footer (Full Width) */}
        <Footer />
      </main>

      {/* ── Single Razorpay Affordability Controller (Portals to active slot) ── */}
      {RAZORPAY_KEY && (
        <RazorpayAffordabilityWidget
          amount={product?.sellingPrice ?? 0}
          razorpayKey={RAZORPAY_KEY}
        />
      )}

      {/* ── Sticky bottom bar (mobile only, lg:hidden inside) ── */}
      <StickyBottomBar product={product} />
    </>
  );
}
