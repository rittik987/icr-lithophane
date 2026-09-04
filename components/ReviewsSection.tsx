import Image from "next/image";
import StarRating from "./StarRating";
import { ASSETS } from "@/lib/assets";

interface Review {
  id: number;
  quote: string;
  name: string;
  location: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    quote:
      "Gifted this to my parents for their 30th anniversary. Seeing their wedding photo glow warmly on the Diwali table brought tears to my mother's eyes. Incredible craftsmanship.",
    name: "Ananya S.",
    location: "Bengaluru, Karnataka",
  },
  {
    id: 2,
    quote:
      "The walnut finish is top-notch, solid and premium. The lighting is gentle and not harsh. Perfect bedside companion.",
    name: "Rohan M.",
    location: "Mumbai, Maharashtra",
  },
  {
    id: 3,
    quote:
      "Turnaround time was fast and packaging was pristine. Truly a unique personalized keepsake.",
    name: "Priya K.",
    location: "New Delhi",
  },
];

export default function ReviewsSection() {
  return (
    <section className="px-4 py-6 flex flex-col gap-4 w-full">
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
        <p
          className="text-[#6e5c50] text-[12px] font-semibold"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          4.9 / 5 from 850+ homes
        </p>
      </div>

      {/* Review cards */}
      <div className="flex flex-col gap-3 w-full">
        {REVIEWS.map((review) => (
          <article
            key={review.id}
            className="bg-white border border-[#e5ddd0] rounded-xl shadow-[0_1px_1px_rgba(0,0,0,0.05)] overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-3">
              {/* Stars + verified badge */}
              <div className="flex items-center justify-between">
                <StarRating count={5} size={12.5} />
                <div className="bg-[#eaf5ec] rounded px-2 py-0.5">
                  <span
                    className="text-[#1e7234] text-[11px] font-semibold"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Verified Buyer
                  </span>
                </div>
              </div>

              {/* Quote */}
              <p
                className="text-[#2e1e12] text-[13px] leading-[1.625]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                &ldquo;{review.quote}&rdquo;
              </p>
            </div>

            {/* Footer divider */}
            <div className="flex items-center justify-between px-4 pt-[5px] pb-4 border-t border-[rgba(229,221,208,0.5)]">
              <span
                className="text-[#2e1e12] text-[11px] font-semibold"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {review.name}
              </span>
              <span
                className="text-[#6e5c50] text-[11px]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {review.location}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
