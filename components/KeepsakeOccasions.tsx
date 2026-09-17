import Image from "next/image";
import Link from "next/link";

interface OccasionItem {
  id: string;
  desktopTitle: string;
  desktopDescription: string;
  mobileTitle: string;
  mobileDescription: string;
  desktopImageSrc: string;
  mobileImageSrc: string;
  alt: string;
}

const OCCASIONS: OccasionItem[] = [
  {
    id: "family",
    desktopTitle: "For Family",
    desktopDescription: "Cherish the people who matter most.",
    mobileTitle: "Family",
    mobileDescription: "Celebrate the people who are always there.",
    desktopImageSrc: "/photos/occasion-family.jpg",
    mobileImageSrc: "/photos/occasion-m-family.jpg",
    alt: "Warm glowing family lithophane lamp",
  },
  {
    id: "partner",
    desktopTitle: "For Your Partner",
    desktopDescription: "A meaningful gift straight from the heart.",
    mobileTitle: "Partner",
    mobileDescription: "A heartfelt gift for your special one.",
    desktopImageSrc: "/photos/occasion-partner.jpg",
    mobileImageSrc: "/photos/occasion-m-partner.jpg",
    alt: "Illuminated couple lithophane lamp",
  },
  {
    id: "friends",
    desktopTitle: "For Friends",
    desktopDescription: "Turn shared memories into something special.",
    mobileTitle: "Friends",
    mobileDescription: "Turn your shared moments into something unforgettable.",
    desktopImageSrc: "/photos/occasion-friends.jpg",
    mobileImageSrc: "/photos/occasion-m-friends.jpg",
    alt: "Best friends smiling lithophane lamp",
  },
  {
    id: "pets",
    desktopTitle: "For Pet Lovers",
    desktopDescription: "Because they're family too.",
    mobileTitle: "Pets",
    mobileDescription: "Because they're family too.",
    desktopImageSrc: "/photos/occasion-pets.jpg",
    mobileImageSrc: "/photos/occasion-m-pets.jpg",
    alt: "Golden retriever dog portrait lithophane lamp",
  },
];

const VALUE_PROPS = [
  {
    title: "Thoughtful & Unique",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a45a2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    title: "Perfect for Any Occasion",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a45a2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "Creates Lasting Memories",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a45a2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

export default function KeepsakeOccasions() {
  return (
    <section
      id="occasions"
      className="bg-[#faf7f2] border-t border-[#eee5d8] py-16 lg:py-24 px-6 overflow-hidden w-full"
      aria-label="A Keepsake for Every Special Moment"
    >
      <div className="max-w-[1240px] mx-auto">

        {/* ══════════════════════════════════════════════════════
            DESKTOP LAYOUT (Hero Top Split + 4 Occasions Bottom)
        ════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-col gap-14">

          {/* Top Row: Left Narrative + Right Gift Box Hero Image */}
          <div className="grid grid-cols-[1fr_1.2fr] gap-12 xl:gap-16 items-center">
            
            {/* Left Narrative */}
            <div className="flex flex-col gap-5">
              <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.26em] uppercase font-sans">
                MORE THAN A GIFT
              </p>
              <h2 className="text-[#2e1e12] text-[36px] xl:text-[44px] font-bold leading-[1.18] font-serif">
                A Keepsake for<br />Every Special Moment
              </h2>
              <p className="text-[#6e5c50] text-[15px] font-sans leading-relaxed max-w-[460px]">
                Whether it&apos;s for your loved ones or a memory close to your heart, our lithophane lamp turns moments into a timeless piece.
              </p>

              {/* 3 Value Props Bar */}
              <div className="grid grid-cols-3 divide-x divide-[#e8dfd2] pt-4 mt-2 border-t border-[#e8dfd2]">
                {VALUE_PROPS.map((vp) => (
                  <div key={vp.title} className="flex flex-col items-center gap-2 px-3 text-center">
                    <div>{vp.icon}</div>
                    <span className="text-[#2e1e12] text-[12px] font-medium font-sans leading-snug">
                      {vp.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(46,30,18,0.12)] border border-[#e8dfd2] bg-white">
              <Image
                src="/photos/occasion-hero.jpg"
                alt="Couple lithophane lamp with ICR gift box, flowers, and handwritten keepsake card"
                width={700}
                height={470}
                className="w-full h-auto object-cover block select-none"
                priority
              />
            </div>
          </div>

          {/* Bottom Row: 4 Occasion Cards */}
          <div className="grid grid-cols-4 gap-6">
            {OCCASIONS.map((occ) => (
              <div key={occ.id} className="flex flex-col items-center text-center">
                <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(46,30,18,0.08)] border border-[#e8dfd2] bg-white transition-transform duration-300 hover:-translate-y-1">
                  <Image
                    src={occ.desktopImageSrc}
                    alt={occ.alt}
                    width={320}
                    height={200}
                    className="w-full h-full object-cover select-none"
                  />
                </div>
                <h3 className="text-[#2e1e12] font-bold text-[18px] font-serif mt-4">
                  {occ.desktopTitle}
                </h3>
                <p className="text-[#6e5c50] text-[13px] font-sans leading-relaxed mt-1">
                  {occ.desktopDescription}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════
            MOBILE LAYOUT (Header + 4 Occasion Cards List)
        ════════════════════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col gap-6">
          {/* Mobile Header */}
          <div className="text-center flex flex-col items-center gap-2 mb-2">
            <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.24em] uppercase font-sans">
              PERFECT FOR EVERY OCCASION
            </p>
            <h2 className="text-[#2e1e12] text-[28px] font-bold leading-[1.2] font-serif max-w-[340px]">
              A Meaningful Gift for Every Bond
            </h2>
            <p className="text-[#6e5c50] text-[13px] font-sans leading-relaxed max-w-[320px]">
              Turn your cherished moments into a beautiful lithophane lamp, perfect for the people who matter.
            </p>
          </div>

          {/* 4 Cards Vertical List */}
          <div className="flex flex-col gap-4">
            {OCCASIONS.map((occ) => (
              <Link
                key={occ.id}
                href="/customize"
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-[#e8dfd2] shadow-[0_2px_10px_rgba(46,30,18,0.04)] hover:shadow-md transition-shadow active:scale-[0.99]"
              >
                {/* Thumbnail image */}
                <div className="w-[120px] aspect-[4/3] rounded-xl overflow-hidden shrink-0 border border-[#eee5d8] bg-white">
                  <Image
                    src={occ.mobileImageSrc}
                    alt={occ.alt}
                    width={180}
                    height={135}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text Block */}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <h3 className="text-[#2e1e12] font-bold font-serif text-[17px] leading-snug">
                    {occ.mobileTitle}
                  </h3>
                  <p className="text-[#6e5c50] text-[12px] font-sans leading-relaxed">
                    {occ.mobileDescription}
                  </p>
                </div>

                {/* Circular Arrow Button */}
                <div
                  className="w-8 h-8 rounded-full bg-[#ede5d8] text-[#2e1e12] flex items-center justify-center shrink-0 ml-1"
                  aria-hidden="true"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
