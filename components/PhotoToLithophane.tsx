
import Image from "next/image";

interface PhotoToLithophaneProps {
  /** Override the "before" lifestyle photo */
  beforeSrc?: string;
  /** Override the "after" lithophane lamp photo */
  afterSrc?: string;
}

const FEATURE_CHIPS = [
  {
    label: "YOUR PHOTO, YOUR WAY",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "FULLY CUSTOMIZABLE",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
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
    label: "WARM GLOWING LIGHT",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M4.93 19.07l1.41-1.41" />
        <path d="M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    label: "MADE FOR GIFTING OR KEEPING",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
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

export default function PhotoToLithophane({
  beforeSrc = "/photos/before-sample.png",
  afterSrc = "/photos/after-lithophane.png",
}: PhotoToLithophaneProps) {
  return (
    <section
      className="w-full bg-[#f2ebdc] overflow-hidden"
      aria-label="Turn your photo into a 3D glowing lithophane"
    >
      <div className="max-w-[1280px] mx-auto px-6 pt-14 pb-10 lg:pt-20 lg:pb-16">
        {/* Section header */}
        <div className="text-center flex flex-col items-center gap-3 mb-10 lg:mb-14">
          {/* Eyebrow */}
          <p className="text-[#e07a28] text-[10px] lg:text-[11px] font-bold tracking-[0.28em] uppercase font-sans">
            YOUR PHOTO, MADE PERSONAL
          </p>

          {/* Heading */}
          <h2 className="text-[#2e1e12] text-[30px] lg:text-[46px] font-bold leading-[1.18] font-serif max-w-[760px]">
            Turn Any Photo Into 
            <br className="hidden lg:block" />
            <div></div>
            a glowing 3D Keepsake
          </h2>

          {/* Subtext */}
          <p className="text-[#6e5c50] text-[14px] lg:text-[15px] font-sans leading-relaxed max-w-[540px]">
            Choose your design, upload a photo or create a collage, and preview
            your personalised lithophane before you order.
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex flex-col items-center mb-16">
          {/* Row 1 */}
          <div className="grid grid-cols-[380px_200px_380px] gap-8 items-center justify-center">
            {/* Before */}
            <div className="flex justify-center">
              <div
                style={{
                  transform: "rotate(-4deg)",
                  border: "12px solid #fff",
                  boxShadow:
                    "0 20px 60px rgba(46,30,18,0.18), 0 2px 8px rgba(46,30,18,0.08)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  width: "380px",
                  height: "275px",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={beforeSrc}
                  alt="Your original photo before customisation"
                  width={380}
                  height={275}
                  className="block w-full h-full object-cover"
                  priority
                />
              </div>
            </div>

            {/* Center */}
            <div className="flex flex-col items-center justify-center gap-2 select-none">
              <svg
                width="160"
                height="48"
                viewBox="0 0 160 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="overflow-visible"
              >
                <path
                  d="M 12 42 C 42 12, 102 8, 148 18"
                  stroke="#b45d24"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 133 10 L 148 18 L 135 27"
                  stroke="#b45d24"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>

              <p
                className="text-[#a45a2a] text-[18px] leading-tight text-center"
                style={{
                  fontFamily: "var(--font-family-script)",
                  transform: "rotate(-7deg)",
                }}
              >
                Your photo
                <br />
                becomes something real
              </p>
            </div>

            {/* After */}
            <div className="flex justify-center">
              <div
                style={{
                  transform: "rotate(3deg)",
                  border: "12px solid #fff",
                  boxShadow:
                    "0 20px 60px rgba(46,30,18,0.18), 0 2px 8px rgba(46,30,18,0.08)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  width: "380px",
                  height: "275px",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={afterSrc}
                  alt="Your personalised 3D lithophane glowing with warm light"
                  width={480}
                  height={300}
                  className="block w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Captions */}
          <div className="grid grid-cols-[380px_200px_380px] gap-8 justify-center mt-7">
            <div
              className="text-center"
              style={{ transform: "rotate(-1deg)" }}
            >
              <p className="text-[#2e1e12] text-[11px] font-bold tracking-[0.22em] uppercase font-sans">
                YOUR PHOTO
              </p>

              <p className="text-[#6e5c50] text-[12px] font-sans mt-0.5">
                Use a photo that means something to you
              </p>
            </div>

            <div aria-hidden="true" />

            <div
              className="text-center"
              style={{ transform: "rotate(1.5deg)" }}
            >
              <p className="text-[#2e1e12] text-[11px] font-bold tracking-[0.22em] uppercase font-sans">
                YOUR LITHOPHANE
              </p>

              <p className="text-[#6e5c50] text-[12px] font-sans mt-0.5">
                Your image, transformed into warm light
              </p>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex flex-col gap-0 mb-10">
          {/* Card 1 */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(46,30,18,0.12)]"
            style={{ aspectRatio: "380/275" }}
          >
            <Image
              src={beforeSrc}
              alt="Your original photo before customisation"
              width={600}
              height={434}
              className="w-full h-full object-cover"
            />

            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
              <span className="text-[#2e1e12] text-[11px] font-semibold font-sans">
                Your Photo
              </span>
            </div>
          </div>

          {/* Connector */}
          <div className="flex items-center justify-center gap-3 py-5 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-5 bg-[#e5ddd0]" />

            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-8 h-8 rounded-full border border-[#e5ddd0] bg-[#faf7f2] flex items-center justify-center shadow-sm">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c96a1e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </div>
            </div>

            <p className="text-[#6e5c50] text-[10px] font-bold tracking-[0.2em] uppercase font-sans">
              Personalised for You
            </p>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-5 bg-[#e5ddd0]" />
          </div>

          {/* Card 2 */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(46,30,18,0.16)] flex items-center justify-center bg-[#ebe3d5] p-2"
            style={{ aspectRatio: "380/275" }}
          >
            <Image
              src={afterSrc}
              alt="Your personalised 3D lithophane glowing with warm light"
              width={600}
              height={434}
              className="w-full h-full object-contain"
              style={{
                filter: "drop-shadow(0 10px 20px rgba(46,30,18,0.25))",
              }}
            />

            <div className="absolute top-8 left-5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
              <span className="text-[#2e1e12] text-[11px] font-semibold font-sans">
                Your Lithophane
              </span>
            </div>
          </div>
        </div>

        {/* Feature chips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 pt-6 lg:pt-10 border-t border-[#e5ddd0]">
          {FEATURE_CHIPS.map((chip) => (
            <div
              key={chip.label}
              className="flex flex-col items-center gap-2.5 py-5 px-3 bg-white border border-[#e5ddd0] rounded-xl text-center shadow-[0_1px_3px_rgba(46,30,18,0.05)] hover:shadow-[0_4px_12px_rgba(46,30,18,0.08)] transition-shadow duration-200"
            >
              <span className="text-[#c96a1e]">{chip.icon}</span>

              <p className="text-[#6e5c50] text-[10px] font-bold tracking-[0.14em] uppercase font-sans leading-snug">
                {chip.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}