import Image from "next/image";
import { ASSETS } from "@/lib/assets";

interface StarRatingProps {
  count?: number;
  size?: number;
}

export default function StarRating({ count = 5, size = 12 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative shrink-0"
          style={{ width: size, height: size * 0.95 }}
        >
          <Image
            src={ASSETS.iconStarSm}
            alt=""
            fill
            sizes="14px"
            className="object-contain"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
