import Image from "next/image";

interface DetailSpecItem {
  id: string;
  category: string;
  title: React.ReactNode;
  mobileTitle: React.ReactNode;
  description: string;
  mobileDescription: string;
  imageSrc: string;
  alt: string;
  icon: React.ReactNode;
}

const DETAIL_SPECS: DetailSpecItem[] = [
  {
    id: "proportion",
    category: "PROPORTION",
    title: "Single Size: 8 × 6 Inches",
    mobileTitle: "8 × 6 Inches",
    description: "Thoughtfully sized to feel right at home on your desk, bedside, or shelf.",
    mobileDescription: "A timeless size designed to fit effortlessly into any room.",
    imageSrc: "/photos/detail-proportion.jpg",
    alt: "Handcrafted wooden frame corner showing lithophane proportion",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a45a2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
        <circle cx="9" cy="9" r="1" fill="#a45a2a" />
        <circle cx="15" cy="15" r="1" fill="#a45a2a" />
      </svg>
    ),
  },
  {
    id: "light-engine",
    category: "LIGHT ENGINE",
    title: (
      <>
        Warm <span className="font-sans font-bold tracking-tight">2400</span>K LED Core
      </>
    ),
    mobileTitle: (
      <>
        Warm <span className="font-sans font-bold tracking-tight">2400</span>K LED
      </>
    ),
    description: "A soft, soothing amber glow that illuminates every carved detail with gentle warmth.",
    mobileDescription: "Soft, warm light that creates an instant cozy ambience.",
    imageSrc: "/photos/detail-led-core.jpg",
    alt: "Warm 2400K LED core strip recessed inside frame",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a45a2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    id: "wood-framing",
    category: "WOOD FRAMING",
    title: "Handcrafted Wooden Frame",
    mobileTitle: "Natural Wooden Frame",
    description: "Solid natural wood with seamless 45° mitered joinery built to endure for generations.",
    mobileDescription: "Naturally durable wood crafted with precision mitered corners.",
    imageSrc: "/photos/detail-wooden-frame.jpg",
    alt: "Precision mitered corner of the natural wooden frame",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a45a2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 3v18M17 3v18M3 8h18M3 16h18" />
      </svg>
    ),
  },
  {
    id: "power-cable",
    category: "POWER & CABLE",
    title: "Dedicated DC Power Adapter",
    mobileTitle: "DC Power Adapter",
    description: "Comes with a safe, continuous 12V power adapter so your memories glow without interruption.",
    mobileDescription: "Comes with a safe, reliable 12V continuous power adapter.",
    imageSrc: "/photos/detail-power-adapter.jpg",
    alt: "DC power barrel adapter plug on wooden desk",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a45a2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
];

const BOTTOM_PILLARS = [
  {
    label: "YOUR PHOTO",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a45a2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
      </svg>
    ),
  },
  {
    label: "OUR CRAFT",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a45a2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8l4 4-4 4M8 12h8" />
      </svg>
    ),
  },
  {
    label: "A WARM GLOW",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a45a2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "A KEEPSAKE",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a45a2a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18.178 8c5.096 0 5.096 8 0 8-2.67 0-4.32-1.92-6.178-4-1.858 2.08-3.508 4-6.178 4-5.096 0-5.096-8 0-8 2.67 0 4.32 1.92 6.178 4 1.858-2.08 3.508-4 6.178-4z" />
      </svg>
    ),
  },
];

export default function EveryDetailMatters() {
  return (
    <section
      className="w-full bg-[#fbf8f2] border-t border-[#eee5d8] py-16 lg:py-24 px-6 overflow-hidden"
      aria-label="Every Detail Matters"
    >
      <div className="max-w-[1240px] mx-auto">

        {/* ══════════════════════════════════════════════════════
            HEADER (Responsive: desktop & mobile)
        ════════════════════════════════════════════════════════ */}
        <div className="text-center flex flex-col items-center gap-3 mb-10 lg:mb-14">
          <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.26em] uppercase font-sans">
            <span className="lg:inline hidden">THOUGHTFULLY DESIGNED</span>
            <span className="lg:hidden inline">PRODUCT DETAILS</span>
          </p>
          <h2 className="text-[#2e1e12] text-[28px] sm:text-[34px] lg:text-[44px] font-bold leading-[1.2] font-serif max-w-[760px]">
            <span className="lg:inline hidden">Every Detail Matters</span>
            <span className="lg:hidden inline">Thoughtfully Crafted in Every Detail</span>
          </h2>
          <p className="text-[#6e5c50] text-[14px] lg:text-[15px] font-sans leading-relaxed max-w-[580px]">
            <span className="lg:inline hidden">
              A delicate blend of handcrafted woodwork and warm lighting, created to turn your most cherished moments into a lasting keepsake.
            </span>
            <span className="lg:hidden inline">
              A harmonious blend of fine woodwork and gentle light, made so your favorite memories last forever.
            </span>
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════
            DESKTOP LAYOUT (2-col grid: Couple Hero Left, 4 Specs Right)
        ════════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid grid-cols-[1.08fr_0.92fr] gap-10 xl:gap-14 items-center">

          {/* Left Column: Couple Lithophane Lifestyle Photo Card */}
          <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(46,30,18,0.14)] bg-[#2e1e12]">
            <Image
              src="/photos/detail-couple-lifestyle.png"
              alt="Romantic couple glowing lithophane lamp handcrafted in wood on bedside table"
              width={680}
              height={510}
              className="w-full h-auto object-cover block select-none"
              priority
            />
            {/* Handwritten overlay tag */}
            <div
              className="absolute bottom-6 left-7 text-white text-[26px] xl:text-[30px] leading-tight select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
              style={{ fontFamily: "var(--font-family-script)" }}
            >
              Crafted<br />for Real Life
            </div>
          </div>

          {/* Right Column: 4 Spec Rows */}
          <div className="flex flex-col divide-y divide-[#e8dfd2]">
            {DETAIL_SPECS.map((spec) => (
              <div key={spec.id} className="flex items-center gap-5 py-4 xl:py-5 first:pt-0 last:pb-0">
                {/* Spec Thumbnail Image */}
                <div className="w-[124px] h-[86px] rounded-xl overflow-hidden shrink-0 shadow-[0_4px_12px_rgba(46,30,18,0.08)] border border-[#e8dfd2] bg-white">
                  <Image
                    src={spec.imageSrc}
                    alt={spec.alt}
                    width={180}
                    height={135}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Spec Content */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5 shrink-0 text-[#a45a2a]">
                    {spec.icon}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[#a45a2a] text-[10px] font-bold tracking-[0.18em] uppercase font-sans">
                      {spec.category}
                    </span>
                    <h3 className="text-[#2e1e12] text-[16px] xl:text-[17px] font-bold font-serif leading-snug">
                      {spec.title}
                    </h3>
                    <p className="text-[#6e5c50] text-[12.5px] xl:text-[13px] font-sans leading-relaxed">
                      {spec.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            MOBILE LAYOUT (2×2 Spec Cards Grid matching reference)
        ════════════════════════════════════════════════════════ */}
        <div className="lg:hidden grid grid-cols-2 gap-4 sm:gap-6 mb-8">
          {DETAIL_SPECS.map((spec) => (
            <div key={spec.id} className="flex flex-col gap-2.5">
              {/* Card Image */}
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(46,30,18,0.10)] border border-[#e8dfd2] bg-white">
                <Image
                  src={spec.imageSrc}
                  alt={spec.alt}
                  width={300}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Card Text */}
              <div className="flex flex-col gap-0.5">
                <h3 className="text-[#2e1e12] text-[15px] sm:text-[16px] font-bold font-serif leading-snug">
                  {spec.mobileTitle}
                </h3>
                <p className="text-[#6e5c50] text-[12px] font-sans leading-relaxed">
                  {spec.mobileDescription}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            BOTTOM PILLARS BAR (4 Items with Subtle Dividers)
        ════════════════════════════════════════════════════════ */}
        <div className="mt-12 lg:mt-16 border border-[#e8dfd2] rounded-2xl bg-white/70 shadow-[0_2px_8px_rgba(46,30,18,0.04)] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x-0 lg:divide-x divide-[#e8dfd2]">
          {BOTTOM_PILLARS.map((pillar, idx) => (
            <div
              key={pillar.label}
              className={`flex flex-col items-center justify-center gap-2 py-5 lg:py-6 px-4 text-center ${
                idx % 2 === 1 ? "border-l border-[#e8dfd2] lg:border-l-0" : ""
              }`}
            >
              <div className="text-[#a45a2a]">{pillar.icon}</div>
              <span className="text-[#6e5c50] text-[10px] lg:text-[11px] font-bold tracking-[0.18em] uppercase font-sans">
                {pillar.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
