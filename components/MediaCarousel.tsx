"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ASSETS } from "@/lib/assets";

const SLIDES = [
  {
    id: 0,
    src: ASSETS.slideBacklitDimRoom,
    alt: "ICR Lithophane backlit demo in dim room",
    label: "Video Demo • 0:15",
    isVideo: true,
  },
  {
    id: 1,
    src: ASSETS.slideUnlitDaytime,
    alt: "Artisanal unlit state daytime",
    label: "Natural Daylight (Unlit)",
    isVideo: false,
  },
  {
    id: 2,
    src: ASSETS.slideLivingRoom,
    alt: "Glowing solid walnut lithophane in living room",
    label: "Living Room Ambient Glow",
    isVideo: false,
  },
  {
    id: 3,
    src: ASSETS.slideWalnutDetail,
    alt: "Handcrafted solid walnut joinery close-up",
    label: "Solid Walnut Handcraft",
    isVideo: false,
  },
];

export default function MediaCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const startXRef = useRef<number | null>(null);

  const goTo = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, SLIDES.length - 1)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const delta = e.changedTouches[0].clientX - startXRef.current;
    if (Math.abs(delta) > 40) {
      goTo(delta < 0 ? activeIndex + 1 : activeIndex - 1);
    }
    startXRef.current = null;
  };

  return (
    <div className="bg-[#f2ebdc] border border-[#e5ddd0] rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] relative w-full">
      {/* Slides track */}
      <div
        className="relative overflow-hidden"
        style={{ paddingBottom: "75%" /* 4:3 ratio */ }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            aria-hidden={i !== activeIndex}
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={i === 0}
              unoptimized
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Top-left label badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 backdrop-blur-md bg-black/60 border border-white/20 rounded-full px-[13px] py-[5px] shadow-sm">
              {slide.isVideo && (
                <div className="relative w-2.5 h-2.5 shrink-0">
                  <Image
                    src={ASSETS.iconVideo}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <span
                className="text-white text-[11px] font-medium leading-[1.5] whitespace-nowrap"
                style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.025em" }}
              >
                {slide.label}
              </span>
            </div>

            {/* Play button overlay — video slide only */}
            {slide.isVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <button
                  aria-label="Tap to play video"
                  className="flex items-center justify-center w-12 h-12 backdrop-blur-sm bg-[rgba(46,30,18,0.7)] border border-[rgba(224,122,40,0.5)] rounded-full shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[rgba(46,30,18,0.85)] transition-colors"
                >
                  <div className="relative w-5 h-5">
                    <Image
                      src={ASSETS.iconPlay}
                      alt=""
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </button>
                <div className="backdrop-blur-md bg-black/60 border border-white/10 rounded-full px-[11px] py-[3px] shadow-sm">
                  <span
                    className="text-white/90 text-[10px] font-bold tracking-[0.05em] uppercase"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    TAP TO PLAY REVEAL
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
        {SLIDES.map((_, i) => (
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
