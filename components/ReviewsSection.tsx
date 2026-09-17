"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { reviewApi, StorefrontReviewItem } from "@/lib/api";
import WriteReviewModal from "./WriteReviewModal";

// Helper for crisp vector stars matching the reference designs
function StarRatingSvg({ count = 5, size = 14 }: { count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={i < count ? "#c96a1e" : "#e5ddd0"}
          className="shrink-0"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// Avatar circle with formatted initials
function ReviewerAvatar({ name, size = "w-8 h-8" }: { name: string; size?: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <div
      className={`${size} rounded-full bg-[#f2ebdc] text-[#5a3a1a] font-serif font-bold text-xs flex items-center justify-center shrink-0 border border-[#e5ddd0] select-none`}
    >
      {initials}
    </div>
  );
}

export default function ReviewsSection() {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [desktopPage, setDesktopPage] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    reviewer: string;
    quote: string;
  } | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // Fetch reviews live from backend API - no static mock reviews
  const { data, isLoading, mutate } = useSWR(
    "storefront-public-reviews",
    async () => reviewApi.getPublicReviews(),
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  // Sort reviews: prioritize customer photo reviews first (market best practice)
  const rawReviews: StorefrontReviewItem[] = data?.reviews || [];
  const reviews: StorefrontReviewItem[] = [...rawReviews].sort((a, b) => {
    const aImg = a.images && a.images.length > 0 ? 1 : 0;
    const bImg = b.images && b.images.length > 0 ? 1 : 0;
    return bImg - aImg;
  });

  const stats = data?.stats || { averageRating: 5, totalReviews: 0, ratingBreakdown: {} };

  // Desktop pagination: 4 cards per page
  const DESKTOP_PAGE_SIZE = 4;
  const totalDesktopPages = Math.max(1, Math.ceil(reviews.length / DESKTOP_PAGE_SIZE));
  const currentDesktopPage = Math.min(desktopPage, totalDesktopPages - 1);
  const paginatedDesktopReviews = reviews.slice(
    currentDesktopPage * DESKTOP_PAGE_SIZE,
    currentDesktopPage * DESKTOP_PAGE_SIZE + DESKTOP_PAGE_SIZE
  );

  // Mobile slice: 3 items initially, or all if expanded
  const visibleMobileReviews = mobileExpanded ? reviews : reviews.slice(0, 3);

  return (
    <section
      id="reviews"
      className="w-full bg-[#faf7f2] border-t border-[#eee5d8] py-16 lg:py-24 px-4 sm:px-6 overflow-hidden"
      aria-label="Customer Reviews"
    >
      <div className="max-w-[1240px] mx-auto flex flex-col gap-10">

        {/* ══════════════════════════════════════════════════════
            SECTION HEADER
        ════════════════════════════════════════════════════════ */}
        <div className="text-center flex flex-col items-center gap-2.5">
          <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.26em] uppercase font-sans">
            CUSTOMER REVIEWS
          </p>

          <h2 className="text-[#2e1e12] font-serif font-bold text-[28px] sm:text-[34px] lg:text-[42px] leading-tight">
            {/* Responsive titles matching the reference designs */}
            <span className="lg:hidden">Real People, Real Moments</span>
            <span className="hidden lg:inline">Real Stories, Real Smiles</span>
          </h2>

          <p className="text-[#6e5c50] text-[13px] sm:text-[14px] lg:text-[15px] font-sans leading-relaxed max-w-[480px]">
            <span className="lg:hidden">Beautiful stories from our happy customers.</span>
            <span className="hidden lg:inline">
              Here&apos;s what our customers have to say about their lithophane lamps.
            </span>
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════
            REVIEWS CONTENT (DESKTOP & MOBILE)
        ════════════════════════════════════════════════════════ */}
        {isLoading && reviews.length === 0 ? (
          <div className="py-16 flex justify-center items-center">
            <div className="w-7 h-7 border-2 border-[#e07a28] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          /* Empty State when no approved reviews in DB yet */
          <div className="bg-white border border-[#e8dfd2] rounded-2xl p-8 text-center max-w-md mx-auto flex flex-col items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#f2ebdc] text-[#e07a28] flex items-center justify-center">
              <StarRatingSvg count={5} size={18} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2e1e12]">
              Be the First to Share Your Glow
            </h3>
            <p className="text-xs text-[#6e5c50] leading-relaxed">
              Every lithophane keepsake is individually crafted. Have you received your lamp? Share your story with us!
            </p>
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="mt-2 bg-[#2e1e12] text-white text-xs font-semibold py-2.5 px-5 rounded-xl hover:bg-[#432d1d] transition-colors"
            >
              Write a Review
            </button>
          </div>
        ) : (
          <>
            {/* ───────────────────────────────────────────────────
                DESKTOP VIEW: 4 Cards Grid / Carousel
            ─────────────────────────────────────────────────── */}
            <div className="hidden lg:flex flex-col gap-10">
              <div
                className={`grid gap-6 ${
                  paginatedDesktopReviews.length === 1
                    ? "grid-cols-1 max-w-sm mx-auto"
                    : paginatedDesktopReviews.length === 2
                    ? "grid-cols-2 max-w-2xl mx-auto"
                    : paginatedDesktopReviews.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-4"
                }`}
              >
                {paginatedDesktopReviews.map((review) => {
                  const hasImage = review.images && review.images.length > 0;
                  const firstImage = hasImage ? review.images[0] : null;

                  return firstImage ? (
                    <article
                      key={review.id}
                      className="bg-white border border-[#e8dfd2] rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(46,30,18,0.05)] flex flex-col justify-between hover:shadow-md transition-all duration-300"
                    >
                      {/* Customer Photo from API */}
                      <div
                        onClick={() =>
                          setLightboxImage({
                            src: firstImage,
                            reviewer: review.name,
                            quote: review.quote,
                          })
                        }
                        className="relative w-full aspect-[4/3] overflow-hidden bg-[#f7f2ea] border-b border-[#eee5d8] cursor-zoom-in group"
                        title="Click to view photo"
                      >
                        <Image
                          src={firstImage}
                          alt={`Photo submitted by ${review.name}`}
                          fill
                          sizes="(max-width: 1280px) 25vw, 300px"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized={
                            firstImage.startsWith("data:") || firstImage.startsWith("blob:")
                          }
                        />
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex flex-col gap-3.5 flex-1 justify-between">
                        <div className="flex items-center gap-3">
                          <ReviewerAvatar name={review.name} size="w-10 h-10" />
                          <div className="flex flex-col gap-0.5">
                            <h4 className="text-[#2e1e12] font-serif font-bold text-[15px] leading-snug">
                              {review.name}
                            </h4>
                            <StarRatingSvg count={review.rating} size={13} />
                          </div>
                        </div>

                        <p className="text-[#523e32] text-[13px] font-sans leading-relaxed line-clamp-4">
                          &ldquo;{review.quote.replace(/\s+/g, " ").trim()}&rdquo;
                        </p>

                        <div className="pt-2 border-t border-[#f5eee4] flex items-center justify-between text-[11px] text-[#8c786a] font-sans">
                          <span>{review.location || "Verified Buyer"}</span>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </article>
                  ) : (
                    /* Pure Text Testimonial Card — No fake placeholders or generic labels */
                    <article
                      key={review.id}
                      className="bg-white border border-[#e8dfd2] rounded-2xl p-6 shadow-[0_4px_16px_rgba(46,30,18,0.05)] flex flex-col justify-between hover:shadow-md transition-all duration-300"
                    >
                      

                      {/* Middle: Clean customer quote with balanced breathing room */}
                      <div className="my-auto py-5 flex flex-col gap-2.5">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#c96a1e" className="opacity-40">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                        </svg>
                        <p className="text-[#2e1e12] font-serif text-[16px] leading-relaxed italic">
                          &ldquo;{review.quote.replace(/\s+/g, " ").trim()}&rdquo;
                        </p>
                      </div>

                      {/* Bottom row: Reviewer info */}
                      <div className="pt-3 border-t border-[#f5eee4] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <ReviewerAvatar name={review.name} size="w-8 h-8" />
                          <div className="flex flex-col gap-0.5">
                            <h4 className="text-[#2e1e12] font-sans font-bold text-[13px] leading-tight">
                              {review.name}
                            </h4>
                            <StarRatingSvg count={review.rating} size={12} />
                            <span className="text-[#8c786a] text-[11px] font-sans">
                              {review.location || "India"}
                            </span>
                          </div>
                        </div>
                        <span className="text-[#8c786a] text-[11px] font-sans">
                          {review.date}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Desktop Pagination Carousel Controls (shown if more than 1 page) */}
              {totalDesktopPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() =>
                      setDesktopPage((prev) =>
                        prev === 0 ? totalDesktopPages - 1 : prev - 1
                      )
                    }
                    className="w-9 h-9 rounded-full bg-[#eee6d8] hover:bg-[#e2d7c5] flex items-center justify-center text-[#2e1e12] transition-colors cursor-pointer"
                    aria-label="Previous reviews"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  {/* Dot Indicators */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalDesktopPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDesktopPage(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentDesktopPage === idx
                            ? "w-6 bg-[#c96a1e]"
                            : "w-2 bg-[#d8cdc0] hover:bg-[#baa999]"
                        }`}
                        aria-label={`Go to page ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setDesktopPage((prev) =>
                        prev === totalDesktopPages - 1 ? 0 : prev + 1
                      )
                    }
                    className="w-9 h-9 rounded-full bg-[#eee6d8] hover:bg-[#e2d7c5] flex items-center justify-center text-[#2e1e12] transition-colors cursor-pointer"
                    aria-label="Next reviews"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* ───────────────────────────────────────────────────
                MOBILE VIEW: Vertical List with "View More Reviews"
            ─────────────────────────────────────────────────── */}
            <div className="lg:hidden flex flex-col gap-4">
              <div className="flex flex-col gap-3.5">
                {visibleMobileReviews.map((review) => {
                  const hasImage = review.images && review.images.length > 0;
                  const firstImage = hasImage ? review.images[0] : null;

                  return firstImage ? (
                    <article
                      key={review.id}
                      className="bg-white border border-[#e8dfd2] rounded-2xl p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(46,30,18,0.04)] flex gap-3.5 items-start"
                    >
                      {/* Left Image thumbnail: Only shown when image exists in API review */}
                      <div
                        onClick={() =>
                          setLightboxImage({
                            src: firstImage,
                            reviewer: review.name,
                            quote: review.quote,
                          })
                        }
                        className="w-[115px] sm:w-[135px] aspect-[4/3] rounded-xl overflow-hidden shrink-0 border border-[#eee5d8] bg-[#f8f5f0] relative cursor-zoom-in"
                      >
                        <Image
                          src={firstImage}
                          alt={`Photo by ${review.name}`}
                          fill
                          sizes="135px"
                          className="w-full h-full object-cover"
                          unoptimized={
                            firstImage.startsWith("data:") || firstImage.startsWith("blob:")
                          }
                        />
                      </div>

                      {/* Right Review Content */}
                      <div className="flex flex-col gap-2 flex-1 min-w-0 justify-between self-stretch">
                        <div className="flex flex-col gap-1.5">
                          {/* 5 Stars */}
                          <StarRatingSvg count={review.rating} size={14} />

                          {/* Quote */}
                          <p className="text-[#3e2c20] text-[12.5px] font-sans leading-snug line-clamp-3 sm:line-clamp-4">
                            &ldquo;{review.quote.replace(/\s+/g, " ").trim()}&rdquo;
                          </p>
                        </div>

                        {/* Reviewer Details */}
                        <div className="flex items-center gap-2 pt-1">
                          <ReviewerAvatar name={review.name} size="w-6 h-6" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[#2e1e12] font-bold text-[12px] font-sans truncate leading-tight">
                              {review.name}
                            </span>
                            <span className="text-[#8c786a] text-[10px] font-sans truncate">
                              {review.location || "India"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <article
                      key={review.id}
                      className="bg-white border border-[#e8dfd2] rounded-2xl p-4 shadow-[0_2px_10px_rgba(46,30,18,0.04)] flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <StarRatingSvg count={review.rating} size={14} />
                        <span className="text-[10px] font-semibold text-[#1e7234] bg-[#eaf5ec] border border-[#c6e6ca] px-2 py-0.5 rounded-md">
                          ✓ Verified Buyer
                        </span>
                      </div>

                      <p className="text-[#3e2c20] text-[13px] font-sans leading-relaxed">
                        &ldquo;{review.quote.replace(/\s+/g, " ").trim()}&rdquo;
                      </p>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#f5eee4]">
                        <ReviewerAvatar name={review.name} size="w-6 h-6" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[#2e1e12] font-bold text-[12px] font-sans truncate leading-tight">
                            {review.name}
                          </span>
                          <span className="text-[#8c786a] text-[10px] font-sans truncate">
                            {review.location || "India"} · {review.date}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Mobile "View More Reviews" action button */}
              {reviews.length > 3 ? (
                <button
                  onClick={() => setMobileExpanded((prev) => !prev)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#ede5d8] hover:bg-[#e4dacb] active:scale-[0.99] text-[#4a3220] font-sans font-semibold text-[13px] flex items-center justify-center gap-2 transition-all mt-1 cursor-pointer"
                >
                  {mobileExpanded ? (
                    <>
                      <span>Show Fewer Reviews</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>View More Reviews</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setIsWriteModalOpen(true)}
                  className="w-full py-3 px-5 rounded-2xl bg-[#ede5d8] hover:bg-[#e4dacb] text-[#4a3220] font-sans font-semibold text-[13px] flex items-center justify-center gap-2 transition-all mt-1 cursor-pointer"
                >
                  <span>Share Your Experience</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              )}
            </div>
          </>
        )}

      </div>

      {/* ── Photo Lightbox Modal ── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-[#faf7f2] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e5ddd0] bg-white">
              <div>
                <h3 className="text-sm font-bold text-[#2e1e12] font-sans">
                  Photo by {lightboxImage.reviewer}
                </h3>
                <p className="text-xs text-[#6e5c50] font-sans truncate max-w-xs">
                  &ldquo;{lightboxImage.quote}&rdquo;
                </p>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="w-8 h-8 rounded-lg hover:bg-[#faf7f2] flex items-center justify-center text-[#2e1e12] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-black/5 flex items-center justify-center">
              <Image
                src={lightboxImage.src}
                alt={`Photo by ${lightboxImage.reviewer}`}
                width={700}
                height={700}
                className="max-h-[65vh] w-auto object-contain rounded-lg border border-[#e5ddd0] shadow-md"
                unoptimized={
                  lightboxImage.src.startsWith("data:") ||
                  lightboxImage.src.startsWith("blob:")
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Write Review Modal ── */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onSubmitted={() => {
          setIsWriteModalOpen(false);
          mutate();
        }}
      />
    </section>
  );
}
