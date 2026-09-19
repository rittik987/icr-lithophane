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
    id: "frame-size",
    category: "FRAME SIZE",
    title: "20 × 15 × 4 cm",
    mobileTitle: "20 × 15 × 4 cm",
    description:
      "A compact wooden frame measuring 20 × 15 × 4 cm, designed to sit beautifully on a desk, shelf, bedside table, or any special corner.",
    mobileDescription:
      "Overall frame size: 20 × 15 × 4 cm.",
    imageSrc: "/photos/detail-wooden-frame.png",
    alt: "Personalised lithophane in a wooden frame",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a45a2a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 3v18M17 3v18M3 8h18M3 16h18" />
      </svg>
    ),
  },
  {
    id: "light-engine",
    category: "LIGHTING",
    title: "Warm LED Light",
    mobileTitle: "Warm LED",
    description:
      "Warm LED lighting brings your personalised image to life with a soft, inviting glow.",
    mobileDescription:
      "A warm LED creates a soft and comfortable glow.",
    imageSrc: "/photos/detail-led-core.jpg",
    alt: "Warm LED lighting illuminating the lithophane",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a45a2a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    id: "power",
    category: "POWER",
    title: "12V / 1A Power Adapter",
    mobileTitle: "12V / 1A Adapter",
    description:
      "Includes the 12V / 1A power adapter required to power the warm LED lighting.",
    mobileDescription:
      "Includes a 12V / 1A power adapter.",
    imageSrc: "/photos/detail-power-adapter.jpg",
    alt: "12V 1A power adapter included with the lithophane",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a45a2a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    id: "weight",
    category: "WEIGHT",
    title: "Approx. 430 g",
    mobileTitle: "430 g",
    description:
      "The finished product weighs approximately 430 g.",
    mobileDescription:
      "Finished product weight: approximately 430 g.",
    imageSrc: "/photos/detail-proportion.png",
    alt: "Personalised lithophane frame",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a45a2a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v18" />
        <path d="M7 7h10" />
        <path d="M5 21h14" />
        <path d="M8 7l-2 6h5l-2-6" />
        <path d="M16 7l-2 6h5l-2-6" />
      </svg>
    ),
  },
];

const BOTTOM_PILLARS = [
  {
    label: "YOUR PHOTO",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a45a2a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="#a45a2a" />
      </svg>
    ),
  },
  {
    label: "YOUR DESIGN",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a45a2a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v18" />
        <path d="M3 12h18" />
        <path d="M5.5 5.5l13 13" />
        <path d="M18.5 5.5l-13 13" />
      </svg>
    ),
  },
  {
    label: "A WARM GLOW",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a45a2a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    label: "GIFT OR KEEP",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a45a2a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8" />
        <path d="M2 7h20v5H2z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 1 1 2.5-2.5C10 6 12 7 12 7Z" />
        <path d="M12 7h4.5a2.5 2.5 0 1 0-2.5-2.5C14 6 12 7 12 7Z" />
      </svg>
    ),
  },
];

export default function EveryDetailMatters() {
  return (
    <section
      className="w-full bg-[#fbf8f2] border-t border-[#eee5d8] py-16 lg:py-24 px-6 overflow-hidden"
      aria-label="Personalised lithophane product details"
    >
      <div className="max-w-[1240px] mx-auto">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3 mb-10 lg:mb-14">
          <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.26em] uppercase font-sans">
            PRODUCT DETAILS
          </p>

          <h2 className="text-[#2e1e12] text-[28px] sm:text-[34px] lg:text-[44px] font-bold leading-[1.2] font-serif max-w-[760px]">
            Made to Look Beautiful.
            <br className="hidden lg:block" />
            Made to Feel Personal.
          </h2>

          <p className="text-[#6e5c50] text-[14px] lg:text-[15px] font-sans leading-relaxed max-w-[600px]">
            A personalised 3D lithophane made from your photo, set in a
            wooden frame and illuminated with warm LED light.
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden lg:grid grid-cols-[1.08fr_0.92fr] gap-10 xl:gap-14 items-center">
          {/* Lifestyle Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(46,30,18,0.14)] bg-[#2e1e12]">
            <Image
              src="/photos/detail-couple-lifestyle.png"
              alt="Personalised lithophane lamp in a wooden frame displayed with warm light"
              width={680}
              height={510}
              className="w-full h-auto object-cover block select-none"
              priority
            />

            <div
              className="absolute bottom-6 left-7 text-white text-[26px] xl:text-[30px] leading-tight select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
              style={{ fontFamily: "var(--font-family-script)" }}
            >
              Your photo.
              <br />
              Your story.
            </div>
          </div>

          {/* Specs */}
          <div className="flex flex-col divide-y divide-[#e8dfd2]">
            {DETAIL_SPECS.map((spec) => (
              <div
                key={spec.id}
                className="flex items-center gap-5 py-4 xl:py-5 first:pt-0 last:pb-0"
              >
                <div className="w-[124px] h-[86px] rounded-xl overflow-hidden shrink-0 shadow-[0_4px_12px_rgba(46,30,18,0.08)] border border-[#e8dfd2] bg-white">
                  <Image
                    src={spec.imageSrc}
                    alt={spec.alt}
                    width={180}
                    height={135}
                    className="w-full h-full object-cover"
                  />
                </div>

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

        {/* Mobile */}
        <div className="lg:hidden grid grid-cols-2 gap-4 sm:gap-6 mb-8">
          {DETAIL_SPECS.map((spec) => (
            <div key={spec.id} className="flex flex-col gap-2.5">
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(46,30,18,0.10)] border border-[#e8dfd2] bg-white">
                <Image
                  src={spec.imageSrc}
                  alt={spec.alt}
                  width={300}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>

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

        {/* Bottom pillars */}
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