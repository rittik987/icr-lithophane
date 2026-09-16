"use client";

export interface CustomerReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  quote: string;
  title?: string;
  templateName?: string;
  images?: string[];
  verified: boolean;
  helpfulCount: number;
}

const REVIEWS_STORAGE_KEY = "icr_customer_reviews";

export const INITIAL_REVIEWS: CustomerReview[] = [];

export function getStoredReviews(): CustomerReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredReviews(reviews: CustomerReview[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent("icr_reviews_updated"));
  } catch (err) {
    console.error("Failed to save reviews to localStorage:", err);
  }
}

export function submitReview(
  newReview: Omit<CustomerReview, "id" | "date" | "verified" | "helpfulCount">
): CustomerReview {
  const current = getStoredReviews();
  const created: CustomerReview = {
    ...newReview,
    id: `rev_${Date.now()}`,
    date: "Just now",
    verified: true,
    helpfulCount: 0,
  };
  const updated = [created, ...current];
  saveStoredReviews(updated);
  return created;
}
