const STEPS = [
  {
    number: "1",
    title: "Upload Your Photo",
    description:
      "Share any phone portrait, wedding snap, or vintage memory. Our studio checks contrast and tonal balance before casting begins.",
  },
  {
    number: "2",
    title: "Precision Carved & Backlit",
    description:
      "3D printed with micron-level detail to capture light and shadow perfectly.",
  },
  {
    number: "3",
    title: "Ships to Your Door",
    description:
      "Packed in shock-resistant gift packaging and delivered express across India in 5–7 days with tracking.",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-4 py-7 flex flex-col gap-5 w-full">
      {/* Section header */}
      <div className="flex flex-col items-center gap-1 text-center">
        <span
          className="text-[#e07a28] text-[11px] font-bold tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          SIMPLE PROCESS
        </span>
        <h2
          className="text-[#2e1e12] text-[24px] font-semibold leading-[1.5]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          How It Works
        </h2>
        <p
          className="text-[#6e5c50] text-[13px] leading-[1.5] max-w-xs"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          From cherished photograph to heirloom light in three simple steps.
        </p>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3 w-full">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="bg-[#f2ebdc] border border-[#e5ddd0] rounded-xl p-[17px] flex gap-3.5 items-start"
          >
            {/* Step number badge */}
            <div
              className="bg-[#e07a28] rounded-full w-8 h-8 flex items-center justify-center shrink-0 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
              aria-hidden="true"
            >
              <span
                className="text-white text-[14px] font-bold leading-none"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {step.number}
              </span>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1 pt-[1px]">
              <h3
                className="text-[#2e1e12] text-[17px] font-semibold leading-[1.5]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {step.title}
              </h3>
              <p
                className="text-[#6e5c50] text-[13px] leading-[1.625]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
