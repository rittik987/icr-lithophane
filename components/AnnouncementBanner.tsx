"use client";

import { useState, useEffect } from "react";

const ANNOUNCEMENTS = [
  "✨ Free Pan-India Delivery (5–7 Days) • Custom Handcrafted 8×6\" Frame Included",
  "🎁 Limited Time: 40% OFF • Save ₹2,000 on Every Order",
  "⚡ Cash on Delivery Available • 100% Quality Guarantee",
  "🌟 850+ Happy Customers • 4.9★ Rating Across India",
];

export default function AnnouncementBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#f2ebdc] border-b border-[#e5ddd0] px-3 py-2 overflow-hidden">
      <div className="relative h-4">
        {ANNOUNCEMENTS.map((announcement, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center gap-1.5 transition-all duration-500"
            style={{
              opacity: i === currentIndex ? 1 : 0,
              transform: i === currentIndex ? "translateY(0)" : "translateY(-4px)",
            }}
          >
            <p className="text-[#6e5c50] text-[11px] font-medium text-center leading-[16px] font-sans tracking-[0.025em]">
              {announcement}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
