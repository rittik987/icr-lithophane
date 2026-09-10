"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { submitReview } from "@/lib/reviews";
import { fileToCompressedDataUrl } from "@/lib/exportPreview";
import { useToast } from "@/context/ToastContext";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function WriteReviewModal({
  isOpen,
  onClose,
  onSubmitted,
}: WriteReviewModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [quote, setQuote] = useState("");
  const [templateName, setTemplateName] = useState("Happy Anniversary");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newPhotos: string[] = [];
      for (let i = 0; i < Math.min(files.length, 3 - uploadedPhotos.length); i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const dataUrl = await fileToCompressedDataUrl(file, 800, 0.82);
          newPhotos.push(dataUrl);
        }
      }
      setUploadedPhotos((prev) => [...prev, ...newPhotos]);
    } catch (err) {
      console.error("Failed to process photo:", err);
      alert("Failed to load photo. Please try a different image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemovePhoto(index: number) {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) {
      alert("Please enter your name and review message.");
      return;
    }

    setIsSubmitting(true);
    try {
      submitReview({
        name: name.trim(),
        location: location.trim() || "India",
        rating,
        quote: quote.trim(),
        templateName,
        images: uploadedPhotos,
      });

      showToast({
        title: "Review Submitted Successfully",
        message: "Thank you for sharing your experience and photo.",
        type: "success",
      });

      onSubmitted();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[#faf7f2] border border-[#e5ddd0] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5ddd0] bg-white">
          <div>
            <h3 className="text-base font-serif font-bold text-[#2e1e12]">
              Share Your Experience
            </h3>
            <p className="text-xs text-[#6e5c50] font-sans">
              Help other customers see real lithophane lamps in Indian homes
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg hover:bg-[#faf7f2] flex items-center justify-center text-[#2e1e12] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
          {/* Rating Stars Selector */}
          <div>
            <label className="text-xs font-semibold text-[#5a3a1a] font-sans block mb-1.5">
              Overall Rating <span className="text-[#b83a3a]">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`${star} star rating`}
                >
                  <span className={(hoverRating || rating) >= star ? "text-[#e07a28]" : "text-[#d8cfc4]"}>
                    ★
                  </span>
                </button>
              ))}
              <span className="text-xs font-bold font-sans text-[#2e1e12] ml-2">
                {rating === 5 ? "5.0 — Excellent!" : `${rating}.0 Stars`}
              </span>
            </div>
          </div>

          {/* Customer Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#5a3a1a]">
                Your Name <span className="text-[#b83a3a]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sneha Patel"
                className="bg-white border border-[#e5ddd0] rounded-xl px-3 py-2 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-[#5a3a1a]">
                City / State
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune, Maharashtra"
                className="bg-white border border-[#e5ddd0] rounded-xl px-3 py-2 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
              />
            </div>
          </div>

          {/* Template Selection */}
          <div className="flex flex-col gap-1 text-xs font-sans">
            <label className="font-semibold text-[#5a3a1a]">
              Which template did you order?
            </label>
            <select
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="bg-white border border-[#e5ddd0] rounded-xl px-3 py-2 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
            >
              <option value="Happy Anniversary">Happy Anniversary (Trio Frame)</option>
              <option value="Single Portrait">Single Portrait (Full Frame)</option>
            </select>
          </div>

          {/* Review Quote / Text */}
          <div className="flex flex-col gap-1 text-xs font-sans">
            <label className="font-semibold text-[#5a3a1a]">
              Your Review <span className="text-[#b83a3a]">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="How did the 3D lithophane look when lit up? How was the walnut finish and packaging?"
              className="bg-white border border-[#e5ddd0] rounded-xl p-3 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
            />
          </div>

          {/* Customer Photos Upload */}
          <div className="flex flex-col gap-1.5 text-xs font-sans">
            <label className="font-semibold text-[#5a3a1a] flex justify-between">
              <span>Add Photos of your Lamp (Max 3)</span>
              <span className="text-[#6e5c50] font-normal">{uploadedPhotos.length}/3 photos</span>
            </label>

            <div className="flex flex-wrap gap-2.5 items-center">
              {/* Render uploaded thumbnails with remove button */}
              {uploadedPhotos.map((photoUrl, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#e5ddd0] shadow-xs group">
                  <Image
                    src={photoUrl}
                    alt={`Customer uploaded ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized={photoUrl.startsWith("data:") || photoUrl.startsWith("blob:")}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    aria-label="Remove photo"
                    className="absolute top-1 right-1 bg-black/70 hover:bg-[#b83a3a] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Upload CTA box if < 3 photos */}
              {uploadedPhotos.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-[#d8cfc4] hover:border-[#e07a28] bg-white flex flex-col items-center justify-center text-[#6e5c50] hover:text-[#e07a28] transition-colors p-2 text-center"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 4v12M4 10h12" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[10px] font-semibold mt-1">
                    {isUploading ? "Loading..." : "Add Photo"}
                  </span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full bg-[#e07a28] hover:bg-[#c96a1f] text-white font-bold font-sans text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Publishing Review...</span>
              ) : (
                <span>Publish Customer Review</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
