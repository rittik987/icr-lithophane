import AnnouncementBanner from "@/components/AnnouncementBanner";
import Header from "@/components/Header";
import MediaCarousel from "@/components/MediaCarousel";
import MediaGalleryDesktop from "@/components/MediaGalleryDesktop";
import PriceBlock from "@/components/PriceBlock";
import SpecChipsGrid from "@/components/SpecChipsGrid";
import HowItWorks from "@/components/HowItWorks";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import StickyBottomBar from "@/components/StickyBottomBar";
import StarRating from "@/components/StarRating";

export default function HomePage() {
  return (
    <>
      {/* ── Fixed chrome ──────────────────────────────────────── */}
      {/* <AnnouncementBanner /> */}
      <Header cartCount={0} />

      {/* ── Scrollable page body ─────────────────────────────── */}
      <main className="bg-[#faf7f2] min-h-screen pt-16 pb-20 lg:pb-0">

        {/* ── Page content width constraint ─────────────────── */}
        <div className="max-w-[1280px] mx-auto">

          {/* ══════════════════════════════════════════════════════
              HERO — mobile: vertical stack | desktop: 2-col grid
          ════════════════════════════════════════════════════════ */}
          <section className="px-4 lg:px-8 pt-3 pb-6 lg:pt-10 lg:pb-12">

            {/* Mobile: vertical stack */}
            <div className="flex flex-col gap-4 lg:hidden">
              <MediaCarousel />
              <PriceBlock />
            </div>

            {/* Desktop: 2-column product layout */}
            <div className="hidden lg:grid lg:grid-cols-[55fr_45fr] lg:gap-12 lg:items-start">

              {/* LEFT — Media gallery with thumbnail strip */}
              <div className="sticky top-18">
                <MediaGalleryDesktop />
              </div>

              {/* RIGHT — Product purchase panel */}
              <div className="flex flex-col gap-6">

                {/* Product headline */}
                <div className="flex flex-col gap-2">
                  <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.2em] uppercase font-sans">
                    HANDCRAFTED KEEPSAKE
                  </p>
                  <h1 className="text-[#2e1e12] text-[32px] font-bold leading-[1.25] font-serif">
                    Personalised Lithophane Lamp
                  </h1>
                  <p className="text-[#6e5c50] text-[14px] font-sans leading-relaxed">
                    Transform your cherished photo into a warm-glowing 3D keepsake, handcrafted in solid walnut.
                  </p>
                  {/* Star rating */}
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating count={5} size={14} />
                    <span className="text-[#6e5c50] text-[13px] font-sans">4.9 &nbsp;·&nbsp; 850+ customers</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#e5ddd0]" />

                {/* Price block — full component */}
                <PriceBlock />

              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════
              BELOW FOLD — shared between mobile & desktop
              (desktop gets wider grids via lg: in each component)
          ════════════════════════════════════════════════════════ */}

          {/* Spec chips grid */}
          <SpecChipsGrid />

          {/* How it works timeline */}
          <HowItWorks />

          {/* Customer reviews */}
          <ReviewsSection />

          {/* Footer */}
          <Footer />

        </div>
      </main>

      {/* ── Sticky bottom bar (mobile only, lg:hidden inside) ── */}
      <StickyBottomBar />
    </>
  );
}
