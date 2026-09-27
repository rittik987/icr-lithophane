import Image from "next/image";
import Link from "next/link";

interface OccasionItem {
  id: string;
  desktopTitle: string;
  mobileTitle: string;
  imageSrc: string;
  alt: string;
}

const OCCASIONS: OccasionItem[] = [
  {
    id: "family",
    desktopTitle: "Family",
    mobileTitle: "Family",
    imageSrc: "/photos/imgtype/1.png",
    alt: "Family lithophane frame",
  },
  {
    id: "couples",
    desktopTitle: "Couples",
    mobileTitle: "Couples",
    imageSrc: "/photos/imgtype/2.png",
    alt: "Couple lithophane frame",
  },
  {
    id: "wedding",
    desktopTitle: "Wedding",
    mobileTitle: "Wedding",
    imageSrc: "/photos/imgtype/3.png",
    alt: "Wedding couple lithophane frame",
  },
  {
    id: "baby",
    desktopTitle: "Baby & Newborn",
    mobileTitle: "Baby & Newborn",
    imageSrc: "/photos/imgtype/4.png",
    alt: "Baby and newborn lithophane frame",
  },
  {
    id: "parents",
    desktopTitle: "Parents",
    mobileTitle: "Parents",
    imageSrc: "/photos/imgtype/5.png",
    alt: "Parents lithophane frame",
  },
  {
    id: "pets",
    desktopTitle: "Pets",
    mobileTitle: "Pets",
    imageSrc: "/photos/imgtype/6.png",
    alt: "Pet lithophane frame",
  },
  {
    id: "milestones",
    desktopTitle: "Milestones",
    mobileTitle: "Milestones",
    imageSrc: "/photos/imgtype/7.png",
    alt: "Graduation milestone lithophane frame",
  },
  {
    id: "travel",
    desktopTitle: "Travel & Memories",
    mobileTitle: "Travel & Memories",
    imageSrc: "/photos/imgtype/8.png",
    alt: "Travel memories lithophane frame",
  },
  {
    id: "friends",
    desktopTitle: "Best Friends",
    mobileTitle: "Best Friends",
    imageSrc: "/photos/imgtype/9.png",
    alt: "Best friends lithophane frame",
  },
  {
    id: "memory",
    desktopTitle: "In Memory",
    mobileTitle: "In Memory",
    imageSrc: "/photos/imgtype/10.png",
    alt: "Memorial lithophane frame",
  },
  {
    id: "gifts",
    desktopTitle: "Gift Ideas",
    mobileTitle: "Gift Ideas",
    imageSrc: "/photos/imgtype/11.png",
    alt: "Gift ideas lithophane frame",
  },
  {
    id: "housewarming",
    desktopTitle: "Housewarming",
    mobileTitle: "Housewarming",
    imageSrc: "/photos/imgtype/12.png",
    alt: "Housewarming lithophane frame",
  },
];

const VALUE_PROPS = [
  {
    title: "Thoughtful & Unique",
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
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "Creates Lasting Memories",
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

        {/* =========================================================
            DESKTOP / LAPTOP
        ========================================================== */}
        <div className="hidden lg:flex flex-col gap-14">

          {/* Hero + Narrative */}
          <div className="grid grid-cols-[1fr_1.2fr] gap-12 xl:gap-16 items-center">

            {/* Left Narrative */}
            <div className="flex flex-col gap-5">
              <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.26em] uppercase font-sans">
                MORE THAN A GIFT
              </p>

              <h2 className="text-[#2e1e12] text-[36px] xl:text-[44px] font-bold leading-[1.18] font-serif">
                A Keepsake for
                <br />
                Every Special Moment
              </h2>

              <p className="text-[#6e5c50] text-[15px] font-sans leading-relaxed max-w-[460px]">
                Whether it&apos;s for your loved ones or a memory close to your
                heart, our lithophane lamp turns moments into a timeless piece.
              </p>

              {/* Value Props */}
              <div className="grid grid-cols-3 divide-x divide-[#e8dfd2] pt-4 mt-2 border-t border-[#e8dfd2]">
                {VALUE_PROPS.map((vp) => (
                  <div
                    key={vp.title}
                    className="flex flex-col items-center gap-2 px-3 text-center"
                  >
                    <div>{vp.icon}</div>

                    <span className="text-[#2e1e12] text-[12px] font-medium font-sans leading-snug">
                      {vp.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Desktop CTA */}
              <Link
                href="/customize"
                className="
                  self-start
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  mt-2
                  px-7
                  py-3
                  rounded-full
                  bg-[#2e1e12]
                  text-white
                  text-[13px]
                  font-semibold
                  font-sans
                  shadow-[0_5px_18px_rgba(46,30,18,0.14)]
                  hover:bg-[#3d2919]
                  hover:-translate-y-0.5
                  transition-all
                  duration-200
                "
              >
                Customize Yours

                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>

            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(46,30,18,0.12)] border border-[#e8dfd2] bg-white">
              <Image
                src="/photos/occasion-hero.png"
                alt="Illuminated lithophane frame with ICR Custom Creations packaging and thank-you card"
                width={700}
                height={470}
                className="w-full h-auto object-cover block select-none"
                priority
              />
            </div>
          </div>

          {/* =====================================================
              DESKTOP OCCASION GRID
          ====================================================== */}
          <div className="grid grid-cols-4 gap-6">
            {OCCASIONS.map((occ) => (
              <Link
                key={occ.id}
                href="/customize"
                aria-label={`Customize a ${occ.desktopTitle} lithophane`}
                className="
                  group
                  block
                  min-w-0
                  rounded-2xl
                  overflow-hidden
                  border
                  border-[#e8dfd2]
                  bg-white
                  shadow-[0_6px_20px_rgba(46,30,18,0.08)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_12px_28px_rgba(46,30,18,0.13)]
                "
              >
                {/* Image already contains title + tagline */}
                <div className="w-full aspect-[16/15] overflow-hidden bg-[#f3eee7]">
                  <Image
                    src={occ.imageSrc}
                    alt={occ.alt}
                    width={320}
                    height={300}
                    className="
                      w-full
                      h-full
                      object-cover
                      select-none
                      transition-transform
                      duration-500
                      group-hover:scale-[1.02]
                    "
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* =========================================================
            MOBILE
        ========================================================== */}
        <div className="lg:hidden flex flex-col gap-7">

          {/* Mobile Header */}
          <div className="text-center flex flex-col items-center gap-2">
            <p className="text-[#e07a28] text-[10px] font-bold tracking-[0.24em] uppercase font-sans">
              PERFECT FOR EVERY OCCASION
            </p>

            <h2 className="text-[#2e1e12] text-[27px] font-bold leading-[1.18] font-serif max-w-[350px]">
              Turn Your Memories
              <br />
              Into a Keepsake
            </h2>

            <p className="text-[#6e5c50] text-[13px] font-sans leading-relaxed max-w-[340px]">
              Choose a moment that matters and turn it into a glowing
              lithophane.
            </p>
          </div>

          {/* =====================================================
              MOBILE OCCASION GRID
          ====================================================== */}
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-4">
            {OCCASIONS.map((occ) => (
              <Link
                key={occ.id}
                href="/customize"
                aria-label={`Customize a ${occ.mobileTitle} lithophane`}
                className="
                  group
                  block
                  min-w-0
                  overflow-hidden
                  rounded-2xl
                  bg-white
                  border
                  border-[#e8dfd2]
                  shadow-[0_3px_14px_rgba(46,30,18,0.06)]
                  active:scale-[0.985]
                  transition-all
                  duration-200
                "
              >
                {/* Image already contains title + tagline */}
                <div className="w-full aspect-[16/15] overflow-hidden bg-[#f3eee7]">
                  <Image
                    src={occ.imageSrc}
                    alt={occ.alt}
                    width={320}
                    height={300}
                    className="
                      w-full
                      h-full
                      object-cover
                      select-none
                      transition-transform
                      duration-500
                      group-hover:scale-[1.02]
                    "
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* =====================================================
              MOBILE CTA
          ====================================================== */}
          <Link
            href="/customize"
            className="
              self-center
              inline-flex
              items-center
              justify-center
              gap-2
              px-7
              py-3
              rounded-full
              bg-[#2e1e12]
              text-white
              text-[13px]
              font-semibold
              font-sans
              shadow-[0_5px_18px_rgba(46,30,18,0.16)]
              active:scale-[0.98]
              transition-transform
            "
          >
            Customize Yours

            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}