"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Slide, DEFAULT_SLIDES } from "@/lib/slides";

interface MediaGalleryDesktopProps {
  className?: string;
  slides?: Slide[];
}

export default function MediaGalleryDesktop({ className = "", slides }: MediaGalleryDesktopProps) {
  const currentSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    dragFree: false,
    containScroll: "trimSnaps",
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>

      {/* ── Main image — Embla viewport ───────────────────── */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#f2ebdc] border border-[#e5ddd0] shadow-[0_8px_30px_rgba(46,30,18,0.12)]">
        <div ref={emblaRef} className="overflow-hidden rounded-2xl" style={{ touchAction: "pan-y" }}>
          <div className="flex" style={{ backfaceVisibility: "hidden" }}>
            {currentSlides.map((slide, index) => (
              <div
                key={slide.id}
                className="relative shrink-0 w-full"
                style={{ paddingBottom: "75%" /* 4:3 */ }}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 650px"
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>

        {/* Arrow — previous */}
        {canPrev && (
          <button
            aria-label="Previous image"
            onClick={scrollPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-sm border border-white/60 shadow-md hover:bg-white hover:scale-105 transition-all duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8l4-4" stroke="#2e1e12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Arrow — next */}
        {canNext && (
          <button
            aria-label="Next image"
            onClick={scrollNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-sm border border-white/60 shadow-md hover:bg-white hover:scale-105 transition-all duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4l4 4-4 4" stroke="#2e1e12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Image counter — bottom right */}
        <div className="absolute bottom-3 right-3 backdrop-blur-md bg-black/50 border border-white/15 rounded-full px-2.5 py-1 pointer-events-none">
          <span className="text-white text-[11px] font-semibold font-sans tracking-wide">
            {activeIndex + 1} / {currentSlides.length}
          </span>
        </div>
      </div>

      {/* ── Thumbnail strip ───────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {currentSlides.map((slide, i) => (
          <button
            key={slide.id}
            aria-label={`View ${slide.label}`}
            onClick={() => scrollTo(i)}
            className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a28] ${
              i === activeIndex
                ? "border-[#e07a28] shadow-[0_0_0_3px_rgba(224,122,40,0.12)]"
                : "border-transparent opacity-55 hover:opacity-85 hover:border-[#e5ddd0]"
            }`}
            style={{ aspectRatio: "4/3" }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="150px"
              className="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>

      {/* Active slide label */}
      <p className="text-[#6e5c50] text-[12px] font-sans text-center tracking-wide">
        {currentSlides[activeIndex]?.label || ""}
      </p>

    </div>
  );
}
