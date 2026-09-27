
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
    desktopTitle: "Choose, Upload & Preview",
    desktopDescription:
      "Choose a template, upload your photo or create a collage, customise your design, and preview how your lithophane will look before placing your order.",
    mobileTitle: "Choose & Customise",
    mobileDescription:
      "Choose a template, use one photo or create a collage, customise your design, and preview it before ordering.",
    imageSrc: "/photos/how-step-1.png",
    alt: "Customer choosing a template and uploading a photo for a personalised lithophane",
  },
  {
    number: "2",
    desktopTitle: "We Create Your Lithophane",
    desktopDescription:
      "We turn your chosen photo or collage into a personalised 3D lithophane and place it inside a wooden frame with warm LED lighting.",
    mobileTitle: "We Create It",
    mobileDescription:
      "Your photo is transformed into a personalised 3D lithophane and finished in a wooden frame with warm LED light.",
    imageSrc: "/photos/how-step-2.png",
    alt: "Personalised 3D lithophane being created and assembled",
  },
  {
    number: "3",
    desktopTitle: "Delivered to You",
    desktopDescription:
      "Once your personalised order is ready, we ship it to your address. Delivery is generally completed within 3–5 business days.",
    mobileTitle: "Delivered to You",
    mobileDescription:
      "Your personalised lithophane is shipped to your address and is generally delivered within 3–5 business days.",
    imageSrc: "/photos/how-step-3.png",
    alt: "Finished personalised lithophane ready for delivery",
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
        {/* Section Header */}
        <div className="text-center flex flex-col items-center gap-3 mb-12 lg:mb-16">
          <p className="text-[#e07a28] text-[11px] font-bold tracking-[0.26em] uppercase font-sans">
            <span className="lg:inline hidden">THREE SIMPLE STEPS</span>
            <span className="lg:hidden inline">HOW IT WORKS</span>
          </p>

          <h2 className="text-[#2e1e12] text-[28px] sm:text-[34px] lg:text-[44px] font-bold leading-[1.2] font-serif max-w-[700px]">
            <span className="lg:inline hidden">
              From Your Photo to Your Lithophane
            </span>

            <span className="lg:hidden inline">
              Simple Steps. Your Way.
            </span>
          </h2>

          <p className="text-[#6e5c50] text-[14px] lg:text-[15px] font-sans leading-relaxed max-w-[560px]">
            <span className="lg:inline hidden">
              Choose your design, make it personal, preview it, and let us
              turn your photo into a glowing 3D keepsake.
            </span>

            <span className="lg:hidden inline">
              Choose a design, customise your photo, preview it, and place your
              order.
            </span>
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-3 gap-8 xl:gap-10">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center"
            >
              {/* Image Card */}
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

              {/* Step Number */}
              <div
                className="w-9 h-9 rounded-full bg-[#b45d24] text-white flex items-center justify-center font-serif text-[16px] font-bold shadow-sm mt-6 mb-3 select-none shrink-0"
                aria-hidden="true"
              >
                {step.number}
              </div>

              {/* Title */}
              <h3 className="text-[#2e1e12] font-bold text-[20px] font-serif leading-snug">
                {step.desktopTitle}
              </h3>

              {/* Description */}
              <p className="text-[#6e5c50] text-[13.5px] font-sans leading-relaxed max-w-[350px] mt-2">
                {step.desktopDescription}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col gap-6 relative max-w-[500px] mx-auto">
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              className="flex items-center gap-4 relative"
            >
              {/* Vertical Timeline */}
              <div className="flex flex-col items-center self-stretch shrink-0 relative">
                {idx < STEPS.length - 1 && (
                  <div
                    className="absolute top-7 bottom-[-24px] w-[1.5px] bg-[#d9cdbf]"
                    aria-hidden="true"
                  />
                )}

                <div
                  className="w-8 h-8 rounded-full bg-[#e8ded1] text-[#2e1e12] font-serif font-bold text-[14px] flex items-center justify-center shadow-xs z-10 shrink-0"
                  aria-hidden="true"
                >
                  {step.number}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {/* Thumbnail */}
                <div className="w-[124px] sm:w-[140px] aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-[#e8dfd2] bg-white shrink-0">
                  <Image
                    src={step.imageSrc}
                    alt={step.alt}
                    width={220}
                    height={165}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text */}
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

        {/* Simple reassurance row */}
        <div className="mt-12 lg:mt-16 pt-6 border-t border-[#e5ddd0] flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
          <span className="text-[#6e5c50] text-[11px] font-bold tracking-[0.14em] uppercase">
            Multiple Templates
          </span>

          <span className="hidden sm:block w-1 h-1 rounded-full bg-[#c9b9a8]" />

          <span className="text-[#6e5c50] text-[11px] font-bold tracking-[0.14em] uppercase">
            Single Photo or Collage
          </span>

          <span className="hidden sm:block w-1 h-1 rounded-full bg-[#c9b9a8]" />

          <span className="text-[#6e5c50] text-[11px] font-bold tracking-[0.14em] uppercase">
            Preview Before Ordering
          </span>

          <span className="hidden sm:block w-1 h-1 rounded-full bg-[#c9b9a8]" />

          <span className="text-[#6e5c50] text-[11px] font-bold tracking-[0.14em] uppercase">
            3–5 Business Days
          </span>
        </div>
      </div>
    </section>
  );
}

