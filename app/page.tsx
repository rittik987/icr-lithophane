import AnnouncementBanner from "@/components/AnnouncementBanner";
import Header from "@/components/Header";
import MediaCarousel from "@/components/MediaCarousel";
import PriceBlock from "@/components/PriceBlock";
import SpecChipsGrid from "@/components/SpecChipsGrid";
import HowItWorks from "@/components/HowItWorks";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import StickyBottomBar from "@/components/StickyBottomBar";

export default function HomePage() {
  return (
    <>
      {/* ── Fixed chrome ──────────────────────────────────────── */}
      <AnnouncementBanner />
      <Header cartCount={0} />

      {/* ── Scrollable page body ─────────────────────────────── */}
      <main className="bg-[#faf7f2] min-h-screen pt-[105px] pb-20">
        {/* Hero section: carousel + price/upload block */}
        <section className="flex flex-col gap-4 px-4 pt-3 pb-6">
          <MediaCarousel />
          <PriceBlock />
        </section>

        {/* Spec chips grid */}
        <SpecChipsGrid />

        {/* How it works timeline */}
        <HowItWorks />

        {/* Customer reviews */}
        <ReviewsSection />

        {/* Footer */}
        <Footer />
      </main>

      {/* ── Sticky bottom commerce bar ─────────────────────── */}
      <StickyBottomBar />
    </>
  );
}
