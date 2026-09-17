import Image from "next/image";

interface PhotoToLithophaneProps {
  /** Override the "before" lifestyle photo */
  beforeSrc?: string;
  /** Override the "after" lithophane lamp photo */
  afterSrc?: string;
}

const FEATURE_CHIPS = [
  {
    label: "YOUR SPECIAL MOMENTS",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "CRAFTED WITH PRECISION",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    label: "BEAUTIFULLY ILLUMINATED",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    label: "A KEEPSAKE FOR YEARS",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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
      aria-label="From your photo to a lithophane lamp"
    >
      <div className="max-w-[1280px] mx-auto px-6 pt-14 pb-10 lg:pt-20 lg:pb-16">

        {/* ── Section header ─────────────────────────────────── */}
        <div className="text-center flex flex-col items-center gap-3 mb-10 lg:mb-14">
          {/* Eyebrow */}
          <p className="text-[#e07a28] text-[10px] lg:text-[11px] font-bold tracking-[0.28em] uppercase font-sans">
            YOUR PHOTO, A TIMELESS KEEPSAKE
          </p>
          {/* Heading */}
          <h2 className="text-[#2e1e12] text-[30px] lg:text-[46px] font-bold leading-[1.18] font-serif max-w-[700px]">
            From a Cherished Memory<br className="hidden lg:block" /> to a Glowing Heirloom
          </h2>
          {/* Subtext */}
          <p className="text-[#6e5c50] text-[14px] lg:text-[15px] font-sans leading-relaxed max-w-[480px]">
            The same photo, transformed into a beautiful 3D lithophane,<br className="hidden lg:block" /> crafted in wood and illuminated with warm light.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════
            DESKTOP: Row 1 has [Photo] [Arrow + Text] [Lamp] perfectly centered
                     Row 2 has captions aligned under respective photos
            Both images have identical visual dimensions: 380px × 275px
        ════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-col items-center mb-16">
          {/* Row 1: Visual assets + center arrow/script — vertically centered together */}
          <div className="grid grid-cols-[380px_200px_380px] gap-8 items-center justify-center">

            {/* LEFT — Before photo (tilted polaroid-style print) */}
            <div className="flex justify-center">
              <div
                style={{
                  transform: "rotate(-4deg)",
                  border: "12px solid #fff",
                  boxShadow: "0 20px 60px rgba(46,30,18,0.18), 0 2px 8px rgba(46,30,18,0.08)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  width: "380px",
                  height: "275px",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={beforeSrc}
                  alt="Your original photo"
                  width={380}
                  height={275}
                  className="block w-full h-full object-cover"
                  priority
                />
              </div>
            </div>

            {/* CENTER — Curved arrow on top + Handwritten script below */}
            <div className="flex flex-col items-center justify-center gap-2 select-none">
              {/* Arrow on top: arching curve sweeping left → right toward lamp */}
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

              {/* Handwritten script label below the arrow */}
              <p
                className="text-[#a45a2a] text-[18px] leading-tight text-center"
                style={{ fontFamily: "var(--font-family-script)", transform: "rotate(-7deg)" }}
              >
                Turn moments<br />into something real
              </p>
            </div>

            {/* RIGHT — Lithophane lamp (matching white strip border, size, and shadow) */}
            <div className="flex justify-center">
              <div
                style={{
                  transform: "rotate(3deg)",
                  border: "12px solid #fff",
                  boxShadow: "0 20px 60px rgba(46,30,18,0.18), 0 2px 8px rgba(46,30,18,0.08)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  width: "380px",
                  height: "275px",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={afterSrc}
                  alt="Your lithophane lamp"
                  width={480}
                  height={300}
                  className="block w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Row 2: Captions aligned under the two photos */}
          <div className="grid grid-cols-[380px_200px_380px] gap-8 justify-center mt-7">
            <div className="text-center" style={{ transform: "rotate(-1deg)" }}>
              <p className="text-[#2e1e12] text-[11px] font-bold tracking-[0.22em] uppercase font-sans">
                YOUR PHOTO
              </p>
              <p className="text-[#6e5c50] text-[12px] font-sans mt-0.5">A moment you cherish</p>
            </div>

            {/* Spacer for center column */}
            <div aria-hidden="true" />

            <div className="text-center" style={{ transform: "rotate(1.5deg)" }}>
              <p className="text-[#2e1e12] text-[11px] font-bold tracking-[0.22em] uppercase font-sans">
                YOUR LITHOPHANE LAMP
              </p>
              <p className="text-[#6e5c50] text-[12px] font-sans mt-0.5">The same memory, now glowing forever</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            MOBILE: Stacked cards with arrow connector
        ════════════════════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col gap-0 mb-10">

          {/* Card 1 — Before photo */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(46,30,18,0.12)]"
            style={{ aspectRatio: "380/275" }}
          >
            <Image
              src={beforeSrc}
              alt="Your original photo"
              width={600}
              height={434}
              className="w-full h-full object-cover"
            />
            {/* Pill badge */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
              <span className="text-[#2e1e12] text-[11px] font-semibold font-sans">Your Photo</span>
            </div>
          </div>

          {/* Connector — arrow + label */}
          <div className="flex items-center justify-center gap-3 py-5 relative">
            {/* Vertical line top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-5 bg-[#e5ddd0]" />
            {/* Diamond + arrow */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-8 h-8 rounded-full border border-[#e5ddd0] bg-[#faf7f2] flex items-center justify-center shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c96a1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </div>
            </div>
            <p className="text-[#6e5c50] text-[10px] font-bold tracking-[0.2em] uppercase font-sans">
              Crafted with Care
            </p>
            {/* Vertical line bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-5 bg-[#e5ddd0]" />
          </div>

          {/* Card 2 — Lithophane lamp */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(46,30,18,0.16)] flex items-center justify-center bg-[#ebe3d5] p-2"
            style={{ aspectRatio: "380/275" }}
          >
            <Image
              src={afterSrc}
              alt="Your lithophane lamp"
              width={600}
              height={434}
              className="w-full h-full object-contain"
              style={{ filter: "drop-shadow(0 10px 20px rgba(46,30,18,0.25))" }}
            />
            {/* Pill badge */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
              <span className="text-[#2e1e12] text-[11px] font-semibold font-sans">Your Lithophane</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            Feature chips — 4 on desktop, 2×2 on mobile
        ════════════════════════════════════════════════════════ */}
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
