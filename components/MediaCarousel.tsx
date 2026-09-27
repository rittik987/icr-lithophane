"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Slide, DEFAULT_SLIDES } from "@/lib/slides";
import { StorefrontProduct } from "@/lib/api";

interface MediaCarouselProps {
  className?: string;
  slides?: Slide[];
  product?: StorefrontProduct | null;
}

export default function MediaCarousel({ className = "", slides, product }: MediaCarouselProps) {
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

  const goTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
    >
      {/* ── Embla viewport ───────────────────────────────── */}
      <div ref={emblaRef} className="overflow-hidden" style={{ touchAction: "pan-y" }}>
        <div className="flex" style={{ backfaceVisibility: "hidden" }}>
          {currentSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative shrink-0 w-full"
              /* 4:3 aspect ratio — matches desktop gallery & admin cropper (no crop on either device) */
              style={{ paddingBottom: "75%" }}
            >
              {slide.isVideo ? (
                <video
                  src={slide.src}
                  poster={slide.posterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                  priority={index <= 1}
                  loading={index <= 1 ? "eager" : "lazy"}
                  unoptimized={
                    slide.isGif ||
                    slide.src.includes(".gif") ||
                    slide.src.startsWith("data:") ||
                    slide.src.endsWith(".svg") ||
                    slide.src.includes("figma.com")
                  }
                />
              )}
            </div>
          ))}
        </div>
      </div>



      {/* ── Pagination dots — bottom left ────────────────── */}
      <div className="absolute bottom-4 left-[50%] transform -translate-x-1/2 flex items-center gap-1.5">
        {currentSlides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`rounded-full shadow-sm transition-all duration-200 ${
              i === activeIndex
                ? "w-5 h-1.5 bg-[#e07a28]"
                : "w-1.5 h-1.5 bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
