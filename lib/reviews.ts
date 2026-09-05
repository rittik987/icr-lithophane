"use client";

import { ASSETS } from "./assets";

export interface CustomerReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  quote: string;
  templateName?: string;
  images?: string[]; // Base64 data URLs or asset URLs
  verified: boolean;
  helpfulCount: number;
}

const REVIEWS_STORAGE_KEY = "icr_customer_reviews";

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: "rev-1",
    name: "Ananya & Siddharth",
    location: "Bengaluru, Karnataka",
    rating: 5,
    date: "2 days ago",
    quote:
      "Gifted this to my parents for their 30th anniversary. Seeing their wedding photo glow warmly on the Diwali table brought tears to my mother's eyes. The 3D depth and walnut finish are unbelievable.",
    templateName: "Happy Anniversary",
    images: [
      ASSETS.slideBacklitDimRoom,
      ASSETS.slideLivingRoom,
    ],
    verified: true,
    helpfulCount: 24,
  },
  {
    id: "rev-2",
    name: "Rohan M.",
    location: "Mumbai, Maharashtra",
    rating: 5,
    date: "1 week ago",
    quote:
      "The walnut finish is top-notch, solid and premium. The lighting is gentle and not harsh. Perfect bedside companion for evening reading.",
    templateName: "Single Portrait",
    images: [
      ASSETS.slideWalnutDetail,
    ],
    verified: true,
    helpfulCount: 16,
  },
  {
    id: "rev-3",
    name: "Priya & Kabir",
    location: "New Delhi",
    rating: 5,
    date: "2 weeks ago",
    quote:
      "Turnaround time was fast and packaging was pristine. Truly a unique personalized keepsake that captures emotion far better than any 2D framed print.",
    templateName: "Happy Anniversary",
    images: [
      ASSETS.slideLivingRoom,
    ],
    verified: true,
    helpfulCount: 19,
  },
  {
    id: "rev-4",
    name: "Vikramaditya Rao",
    location: "Hyderabad, Telangana",
    rating: 5,
    date: "3 weeks ago",
    quote:
      "Surpassed my expectations! The 3D texture when the lamp is turned off looks like classical carved marble, and when switched on, the photo comes alive with warmth.",
    templateName: "Single Portrait",
    images: [],
    verified: true,
    helpfulCount: 9,
  },
];

export function getStoredReviews(): CustomerReview[] {
  if (typeof window === "undefined") return INITIAL_REVIEWS;
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) return INITIAL_REVIEWS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REVIEWS;
  } catch (err) {
    console.error("Failed to read reviews from localStorage:", err);
    return INITIAL_REVIEWS;
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

export function submitReview(newReview: Omit<CustomerReview, "id" | "date" | "verified" | "helpfulCount">): CustomerReview {
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
