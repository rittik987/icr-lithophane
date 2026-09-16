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
          // sessionStorage is tab-scoped: auto-cleared when the tab closes.
          // This prevents referral codes from persisting across sessions or
          // being shared between unrelated tabs.
          sessionStorage.setItem("icr_ref", clean);
        } catch {}
      }
    }
  }, [searchParams]);

  return null;
}
