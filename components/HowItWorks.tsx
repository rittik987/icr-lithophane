import Image from "next/image";

interface StepItem {
  number: string;
  desktopTitle: string;
  desktopDescription: string;
  mobileTitle: string;
  mobileDescription: string;
  imageSrc: string;
  alt: string;
}

const STEPS: StepItem[] = [
  {
    number: "1",
    desktopTitle: "Upload Your Photo",
    desktopDescription:
      "Share any photo — a portrait, wedding snap, or vintage memory. Our studio checks contrast and tonal balance before printing begins.",
    mobileTitle: "Upload Your Photo",
    mobileDescription:
      "Choose a clear photo of your loved ones, pets or special moments.",
    imageSrc: "/photos/how-step-1.png",
    alt: "Smartphone displaying photo for lithophane creation",
  },
  {
    number: "2",
    desktopTitle: "Crafted with Precision & Light",
    desktopDescription:
      "3D printed with micron-level detail to capture light and shadow perfectly.",
    mobileTitle: "We Craft It",
    mobileDescription:
      "Your photo is carefully converted into a detailed lithophane and crafted with precision using high-quality materials.",
    imageSrc: "/photos/how-step-2.png",
    alt: "Precision 3D printer carving translucent lithophane panel",
  },
  {
    number: "3",
    desktopTitle: "Ships to Your Door",
    desktopDescription:
      "Packed in shock-resistant gift packaging and delivered express across India in 5–7 days with tracking.",
    mobileTitle: "We Ship It",
    mobileDescription:
      "Your custom lamp is packed with care and delivered to your doorstep, ready to light up your memories.",
    imageSrc: "/photos/how-step-3.png",
    alt: "Handcrafted wooden lithophane lamp with ICR Custom Creations gift box",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-[#f2ebdc] border-t border-[#e5ddd0] py-16 lg:py-24 px-6 overflow-hidden w-full"
      aria-label="How It Works"
    >
      <div className="max-w-[1240px] mx-auto">

        {/* ══════════════════════════════════════════════════════
            SECTION HEADER
        ════════════════════════════════════════════════════════ */}
        <div className="text-center flex flex-col items-center gap-3 mb-12 lg:mb-16">
          <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.26em] uppercase font-sans">
            <span className="lg:inline hidden">THREE EASY STEPS</span>
            <span className="lg:hidden inline">HOW IT WORKS</span>
          </p>
          <h2 className="text-[#2e1e12] text-[28px] sm:text-[34px] lg:text-[44px] font-bold leading-[1.2] font-serif max-w-[700px]">
            <span className="lg:inline hidden">How It Works</span>
            <span className="lg:hidden inline">Simple Steps, Lasting Memories</span>
          </h2>
          <p className="text-[#6e5c50] text-[14px] lg:text-[15px] font-sans leading-relaxed max-w-[540px]">
            <span className="lg:inline hidden">
              From a cherished photograph to a glowing heirloom — in just three simple steps.
            </span>
            <span className="lg:hidden inline">
              Turn your special moments into a custom lithophane lamp in just a few steps.
            </span>
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════
            DESKTOP LAYOUT (3 Columns matching desktop screenshot)
        ════════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid grid-cols-3 gap-8 xl:gap-10">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              {/* Image card with rounded corners and soft shadow */}
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(46,30,18,0.10)] border border-[#e8dfd2] bg-white transition-transform duration-300 hover:-translate-y-1">
                <Image
                  src={step.imageSrc}
                  alt={step.alt}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover select-none"
                  priority={step.number === "1"}
                />
              </div>

              {/* Step number badge */}
              <div
                className="w-9 h-9 rounded-full bg-[#b45d24] text-white flex items-center justify-center font-serif text-[16px] font-bold shadow-sm mt-6 mb-3 select-none shrink-0"
                aria-hidden="true"
              >
                {step.number}
              </div>

              {/* Title & Description */}
              <h3 className="text-[#2e1e12] font-bold text-[20px] font-serif leading-snug">
                {step.desktopTitle}
              </h3>
              <p className="text-[#6e5c50] text-[13.5px] font-sans leading-relaxed max-w-[340px] mt-2">
                {step.desktopDescription}
              </p>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            MOBILE LAYOUT (Timeline layout matching mobile screenshot)
        ════════════════════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col gap-6 relative max-w-[500px] mx-auto">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex items-center gap-4 relative">

              {/* Vertical timeline connector */}
              <div className="flex flex-col items-center self-stretch shrink-0 relative">
                {/* Connecting line to next item */}
                {idx < STEPS.length - 1 && (
                  <div
                    className="absolute top-7 bottom-[-24px] w-[1.5px] bg-[#d9cdbf]"
                    aria-hidden="true"
                  />
                )}
                {/* Number Circle */}
                <div
                  className="w-8 h-8 rounded-full bg-[#e8ded1] text-[#2e1e12] font-serif font-bold text-[14px] flex items-center justify-center shadow-xs z-10 shrink-0"
                  aria-hidden="true"
                >
                  {step.number}
                </div>
              </div>

              {/* Step content: Image Thumbnail + Text */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {/* Thumbnail Image */}
                <div className="w-[124px] sm:w-[140px] aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-[#e8dfd2] bg-white shrink-0">
                  <Image
                    src={step.imageSrc}
                    alt={step.alt}
                    width={220}
                    height={165}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text Block */}
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-[#2e1e12] font-bold font-serif text-[16px] sm:text-[17px] leading-snug">
                    {step.mobileTitle}
                  </h3>
                  <p className="text-[#6e5c50] text-[12px] sm:text-[12.5px] font-sans leading-relaxed">
                    {step.mobileDescription}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
