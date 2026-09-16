"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import StarRating from "./StarRating";
import { ASSETS } from "@/lib/assets";
import { reviewApi, StorefrontReviewItem } from "@/lib/api";

export default function ReviewsSection() {
  const [filterWithPhotos, setFilterWithPhotos] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; reviewer: string; quote: string } | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useSWR(
    "storefront-public-reviews",
    async () => {
      return reviewApi.getPublicReviews();
    },
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  const reviews: StorefrontReviewItem[] = data?.reviews || [];
  const stats = data?.stats || { averageRating: 0, totalReviews: 0, ratingBreakdown: {} };

  function handleVoteHelpful(id: string) {
    if (helpfulVotes[id]) return;
    setHelpfulVotes((prev) => ({ ...prev, [id]: true }));
  }

  // Filter reviews based on user selection
  const displayedReviews = filterWithPhotos
    ? reviews.filter((r) => r.images && r.images.length > 0)
    : reviews;

  // Extract all customer photos for the top gallery strip
  const allCustomerPhotos = reviews.flatMap((r) =>
    (r.images || []).map((img) => ({
      src: img,
      reviewer: r.name,
      quote: r.quote,
      rating: r.rating,
      date: r.date,
    }))
  );

  const reviewsWithPhotosCount = reviews.filter((r) => r.images && r.images.length > 0).length;

  return (
    <section id="reviews" className="px-4 lg:px-8 py-10 flex flex-col gap-6 w-full max-w-[1280px] mx-auto">
      {/* Section header */}
      <div className="flex flex-col items-center gap-1 text-center">
        {/* 5 stars row */}
        <div className="flex items-center gap-1 mb-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="relative w-[15px] h-[14.25px]">
              <Image
                src={ASSETS.iconStar}
                alt=""
                fill
                sizes="16px"
                className="object-contain"
                unoptimized
              />
            </div>
          ))}
        </div>

        <h2
          className="text-[#2e1e12] text-[22px] font-semibold leading-[1.5]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Loved Across India
        </h2>

        {/* Live calculated statistics - No mock counters */}
        <p
          className="text-[#6e5c50] text-[12px] font-semibold"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {stats.totalReviews > 0
            ? `${stats.averageRating} / 5 from ${stats.totalReviews} verified ${
                stats.totalReviews === 1 ? "review" : "reviews"
              }`
            : "Handcrafted personalized keepsakes glowing in homes nationwide"}
        </p>
      </div>

      {/* ── Customer UGC Photos Gallery Strip ─────────────────────── */}
      {allCustomerPhotos.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5a3a1a] font-sans flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#e07a28]">
                <path
                  d="M2 5a1 1 0 011-1h2.172a2 2 0 001.414-.586l.828-.828A2 2 0 018.828 2h2.344a2 2 0 011.414.586l.828.828A2 2 0 0014.828 4H15a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>Customer Photos ({allCustomerPhotos.length})</span>
            </span>
            <span className="text-[11px] text-[#6e5c50] font-sans">Click to view</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#e5ddd0]">
            {allCustomerPhotos.map((photo, i) => (
              <div
                key={i}
                onClick={() =>
                  setLightboxImage({
                    src: photo.src,
                    reviewer: photo.reviewer,
                    quote: photo.quote,
                  })
                }
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-[#e5ddd0] bg-white shrink-0 cursor-zoom-in group shadow-xs hover:shadow-md transition-all"
                title={`Photo by ${photo.reviewer}`}
              >
                <Image
                  src={photo.src}
                  alt={`Customer lithophane photo by ${photo.reviewer}`}
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized={photo.src.startsWith("data:") || photo.src.startsWith("blob:")}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-sans font-semibold">
                  View
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter Chips (only when reviews exist) ── */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterWithPhotos(false)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-semibold transition-colors ${
              !filterWithPhotos
                ? "bg-[#2e1e12] text-white"
                : "bg-[#f2ebdc] text-[#6e5c50] hover:bg-[#ede5d6]"
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          {reviewsWithPhotosCount > 0 && (
            <button
              onClick={() => setFilterWithPhotos(true)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-semibold transition-colors flex items-center gap-1.5 ${
                filterWithPhotos
                  ? "bg-[#2e1e12] text-white"
                  : "bg-[#f2ebdc] text-[#6e5c50] hover:bg-[#ede5d6]"
              }`}
            >
              <span>With Photos ({reviewsWithPhotosCount})</span>
            </button>
          )}
        </div>
      )}

      {/* ── Reviews Cards Grid or Elegant Warm Invitation ── */}
      {isLoading && reviews.length === 0 ? (
        <div className="py-12 flex justify-center items-center">
          <div className="w-5 h-5 border-2 border-[#e07a28] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-[#faf7f2] border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 text-center max-w-xl mx-auto flex flex-col items-center gap-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#f2ebdc] text-[#e07a28] flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h3 className="font-serif font-bold text-base text-[#2e1e12]">
            Illuminating Cherished Moments
          </h3>
          <p className="text-xs text-[#6e5c50] leading-relaxed max-w-md">
            Every lithophane keepsake is individually 3D-printed and hand-assembled by our artisans. Have you received your lamp? Share your experience from the Orders page to inspire other customers!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {displayedReviews.map((review) => (
            <article
              key={review.id}
              className="bg-white border border-[#e5ddd0] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="flex flex-col gap-3">
                {/* Reviewer Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Initials Avatar */}
                    <div className="w-8 h-8 rounded-full bg-[#f2ebdc] text-[#5a3a1a] font-sans font-bold text-xs flex items-center justify-center shrink-0">
                      {review.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-sans text-[#2e1e12] leading-tight">
                        {review.name}
                      </h4>
                      <p className="text-[11px] text-[#6e5c50] font-sans">
                        {review.location}
                      </p>
                    </div>
                  </div>

                  {/* Verified Buyer Badge */}
                  {review.verified && (
                    <div className="bg-[#eaf5ec] border border-[#c6e6ca] rounded-md px-2 py-0.5 flex items-center gap-1 text-[10px] font-bold text-[#1e7234] font-sans shrink-0">
                      <span>✓</span>
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {/* Stars & Date */}
                <div className="flex items-center justify-between pt-1">
                  <StarRating count={review.rating} size={13} />
                  <span className="text-[10px] text-[#8c786a] font-sans">{review.date}</span>
                </div>

                {review.title && (
                  <h5 className="font-bold text-xs text-[#2e1e12] font-sans -mb-1">
                    &ldquo;{review.title}&rdquo;
                  </h5>
                )}

                {/* Quote */}
                <p className="text-xs leading-relaxed text-[#2e1e12] font-sans">
                  {review.quote}
                </p>

                {/* Customer Uploaded Photos Thumbnails */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-1">
                    {review.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          setLightboxImage({
                            src: imgUrl,
                            reviewer: review.name,
                            quote: review.quote,
                          })
                        }
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#e5ddd0] bg-[#faf7f2] cursor-zoom-in group shadow-2xs hover:shadow-xs transition-all"
                      >
                        <Image
                          src={imgUrl}
                          alt={`Customer photo by ${review.name}`}
                          fill
                          sizes="64px"
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          unoptimized={imgUrl.startsWith("data:") || imgUrl.startsWith("blob:")}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Helpful Counter Button */}
              <div className="mt-4 pt-3 border-t border-[#f2ebdc] flex items-center justify-between text-[11px] text-[#6e5c50] font-sans">
                <button
                  onClick={() => handleVoteHelpful(review.id)}
                  className={`flex items-center gap-1.5 hover:text-[#2e1e12] transition-colors cursor-pointer ${
                    helpfulVotes[review.id] ? "text-[#1e7234] font-semibold" : ""
                  }`}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 6v8M2 9h3v5H3a1 1 0 01-1-1v-3a1 1 0 011-1h1zm3-3l3-4a1 1 0 011.5 1l-.5 3h4a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-.2.7l-1.5 3.5a1.5 1.5 0 01-1.3.8H5V6z" />
                  </svg>
                  <span>Helpful ({review.helpfulCount + (helpfulVotes[review.id] ? 1 : 0)})</span>
                </button>
                <span className="text-[10px] text-[#a39485]">Verified purchase</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Photo Lightbox Modal ─────────────────────────────────── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-[#faf7f2] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5ddd0] bg-white">
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
                className="max-h-[60vh] w-auto object-contain rounded-lg border border-[#e5ddd0] shadow-md"
                unoptimized={lightboxImage.src.startsWith("data:") || lightboxImage.src.startsWith("blob:")}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
