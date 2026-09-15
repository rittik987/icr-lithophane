"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      const clean = refCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (clean) {
        try {
          localStorage.setItem("icr_ref", clean);
        } catch {}

        // Set 30-day cookie
        document.cookie = `icr_ref=${clean}; max-age=${30 * 24 * 60 * 60}; path=/; SameSite=Lax`;
      }
    }
  }, [searchParams]);

  return null;
}
