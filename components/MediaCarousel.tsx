"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Slide, DEFAULT_SLIDES } from "@/lib/slides";

interface MediaCarouselProps {
  className?: string;
  slides?: Slide[];
}

export default function MediaCarousel({ className = "", slides }: MediaCarouselProps) {
  const currentSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    dragFree: false,
    containScroll: "trimSnaps",
  });

  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const goTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  return (
    <div className={`relative w-full rounded-xl overflow-hidden bg-[#f2ebdc] border border-[#e5ddd0] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] ${className}`}>

      {/* ── Embla viewport ───────────────────────────────── */}
      <div ref={emblaRef} className="overflow-hidden" style={{ touchAction: "pan-y" }}>
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
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
                priority={index <= 1}
                loading={index <= 1 ? "eager" : "lazy"}
                unoptimized={slide.src.startsWith("data:") || slide.src.endsWith(".svg") || slide.src.includes("figma.com")}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Image counter — bottom right */}
      <div className="absolute bottom-3 right-3 backdrop-blur-md bg-black/50 border border-white/15 rounded-full px-2.5 py-1 pointer-events-none">
        <span className="text-white text-[11px] font-semibold font-sans tracking-wide">
          {activeIndex + 1} / {currentSlides.length}
        </span>
      </div>

      {/* Pagination dots — bottom centre */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 pr-14">
        {currentSlides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`rounded-full shadow-sm transition-all duration-200 ${
              i === activeIndex
                ? "w-5 h-1.5 bg-[#e07a28]"
                : "w-1.5 h-1.5 bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
