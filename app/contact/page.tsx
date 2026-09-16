"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { supportApi, uploadApi } from "@/lib/api";

const LITHOPHANE_TOPICS = [
  { value: "Order Status & Delivery Tracking", label: "Order Status & Delivery Tracking", requiresOrder: true },
  { value: "Photo Upload & Customization Assistance", label: "Photo Upload & Customization Assistance", requiresOrder: false },
  { value: "Quality & Craftsmanship Concern", label: "Quality & Craftsmanship Concern", requiresOrder: true },
  { value: "Payment & Billing Inquiry", label: "Payment & Billing Inquiry", requiresOrder: false },
  { value: "Bulk Corporate & Wedding Gifting", label: "Bulk Corporate & Wedding Gifting", requiresOrder: false },
  { value: "General Inquiry", label: "General Inquiry", requiresOrder: false },
];

export default function ContactUsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [topic, setTopic] = useState(LITHOPHANE_TOPICS[0].value);
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketNumber: string;
    email: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTopicObj = LITHOPHANE_TOPICS.find((t) => t.value === topic);
  const isOrderRequired = selectedTopicObj?.requiresOrder ?? false;

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 3) {
      showToast({
        type: "error",
        title: "Attachment Limit",
        message: "You can attach a maximum of 3 images per inquiry.",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const res = await uploadApi.uploadFiles(Array.from(files), "support-customer");
      if (res.success && res.assets) {
        const urls = res.assets.map((a) => a.url);
        setImages((prev) => [...prev, ...urls]);
        showToast({
          type: "success",
          title: "Image Attached",
          message: `${urls.length} image(s) uploaded successfully.`,
        });
      } else {
        throw new Error(res.error || "Failed to upload image.");
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Upload Failed",
        message: err.message || "Failed to upload image. You can still send your message.",
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemoveImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const finalName = user ? (user.name || "Customer") : guestName.trim();
    const finalEmail = user ? (user.email || "") : guestEmail.trim();
    const finalPhone = user ? (user.phone || undefined) : (guestPhone.trim() || undefined);

    if (!user && (!finalName || !finalEmail)) {
      showToast({
        type: "error",
        title: "Missing Information",
        message: "Please provide your name and email address.",
      });
      return;
    }

    if (!message.trim() || message.trim().length < 8) {
      showToast({
        type: "error",
        title: "Message Too Short",
        message: "Please enter a detailed message so our team can help you.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await supportApi.submitTicket({
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        topic,
        orderId: orderId.trim() || undefined,
        message: message.trim(),
        images: images.length > 0 ? images : undefined,
      });

      if (res.success) {
        setSubmittedTicket({
          ticketNumber: res.ticketNumber || "TKT-SUPPORT",
          email: finalEmail || "your email",
        });
        setMessage("");
        setOrderId("");
        setImages([]);
        showToast({
          type: "success",
          title: "Inquiry Submitted",
          message: `Ticket #${res.ticketNumber || ""} created.`,
        });
      } else {
        throw new Error(res.error || res.message || "Submission failed.");
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Submission Failed",
        message: err.message || "Unable to send your inquiry. Please try WhatsApp.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[#6e5c50] hover:text-[#2e1e12] font-sans text-sm font-medium transition-colors z-10 cursor-pointer"
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>

          {/* Center: Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex items-center justify-center">
            <Link
              href="/"
              className="relative w-24 h-24 flex items-center justify-center shrink-0 block hover:opacity-90 transition-opacity"
              aria-label="ICR Custom Creations Home"
            >
              <Image
                src={ASSETS.logo}
                alt="ICR Custom Creations"
                fill
                sizes="96px"
                className="object-contain object-center"
                priority
                loading="eager"
              />
            </Link>
          </div>

          <div className="w-12" aria-hidden="true" />
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 flex-1 w-full">
        <span className="text-xs font-bold uppercase tracking-widest text-[#e07a28] font-sans">
          Customer Care Desk
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2e1e12] mt-1 mb-2">
          Contact Us
        </h1>
        <p className="text-sm text-[#6e5c50] font-sans mb-8 leading-relaxed max-w-xl">
          Have a question about your custom lithophane, photo customization, or delivery tracking? Our artisan studio team is here to assist you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8">
          {/* Left: Contact Form / Confirmation */}
          <div className="bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 shadow-xs">
            {submittedTicket ? (
              <div className="py-10 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#eaf5ec] border border-[#c6e6ca] flex items-center justify-center text-[#1e7234]">
                  <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#065f46] bg-[#ecfdf5] border border-[#a7f3d0] px-2.5 py-0.5 rounded-full font-sans">
                    Ticket #{submittedTicket.ticketNumber}
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#2e1e12]">Thank You!</h3>
                <p className="text-xs text-[#6e5c50] font-sans max-w-sm leading-relaxed">
                  Your inquiry has been routed to our customer support artisans. We will reach out to <strong>{submittedTicket.email}</strong> within 24 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedTicket(null)}
                  className="mt-4 text-xs font-bold font-sans text-[#e07a28] hover:text-[#c96a1f] underline cursor-pointer"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-sans">
                {/* Logged in User Indicator */}
                {user ? (
                  <div className="bg-[#fffaf5] border border-[#ffedd5] rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#fdecdb] text-[#e07a28] font-bold flex items-center justify-center text-xs">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#2e1e12]">
                          {user.name || "Customer"}
                        </span>
                        <span className="text-[11px] text-[#8c7463]">
                          {user.email || user.phone || "Logged in"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#1e7234] bg-[#eaf5ec] border border-[#c6e6ca] px-2 py-0.5 rounded">
                      Verified Account
                    </span>
                  </div>
                ) : (
                  /* Guest User Fields */
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-[#5a3a1a]">
                        Full Name <span className="text-[#b83a3a]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Arjun Sharma"
                        className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-[#5a3a1a]">
                          Email Address <span className="text-[#b83a3a]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-[#5a3a1a]">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Topic Selector */}
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#5a3a1a]">
                    Inquiry Topic <span className="text-[#b83a3a]">*</span>
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28] cursor-pointer"
                  >
                    {LITHOPHANE_TOPICS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional Order ID */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#5a3a1a]">
                      Order ID {isOrderRequired && <span className="text-[#e07a28] font-normal">(recommended)</span>}
                    </label>
                    <span className="text-[10px] text-[#8c7463]">
                      {isOrderRequired ? "Helps us resolve faster" : "Optional"}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. ICR-ORD-98432"
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>

                {/* Message Textarea */}
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#5a3a1a]">
                    Message <span className="text-[#b83a3a]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe how we can help you with your 3D lithophane creation or order..."
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl p-3 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28] resize-none"
                  />
                </div>

                {/* Optional Image Upload */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#5a3a1a]">
                      Attach Photos (Optional)
                    </label>
                    <span className="text-[10px] text-[#8c7463]">Up to 3 images</span>
                  </div>

                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-2.5">
                      {images.map((imgUrl, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl border border-[#e5ddd0] overflow-hidden bg-white shadow-2xs group">
                          <img src={imgUrl} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px] font-bold hover:bg-red-600 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="storefront-support-file-input"
                  />
                  <button
                    type="button"
                    disabled={uploadingImage || images.length >= 3}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-dashed border-[#c5b8a5] hover:border-[#e07a28] bg-[#faf7f2] text-xs font-semibold text-[#6e5c50] hover:text-[#2e1e12] transition-all cursor-pointer w-fit disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{uploadingImage ? "Uploading..." : "Upload Photo / Screenshot"}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 bg-[#e07a28] hover:bg-[#c96a1f] text-white font-bold font-sans text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Inquiry...</span>
                    </>
                  ) : (
                    <span>Send Inquiry</span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right: Quick Contact Channels */}
          <div className="flex flex-col gap-4">
            {/* Email Card (Updated to support@icrcustomcreations.in) */}
            <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 shadow-xs flex flex-col gap-2 font-sans">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#e07a28]">Direct Support</span>
              <h3 className="text-base font-serif font-bold text-[#2e1e12]">Email Us</h3>
              <p className="text-xs text-[#6e5c50]">For order support, photo design queries, and craftsmanship questions:</p>
              <a
                href="mailto:support@icrcustomcreations.in"
                className="text-xs font-bold text-[#2e1e12] hover:text-[#e07a28] transition-colors mt-1 underline"
              >
                support@icrcustomcreations.in
              </a>
            </div>

            {/* WhatsApp Helpdesk (Clickable with Pre-filled message) */}
            <a
              href="https://wa.me/919035765038?text=Hello%20ICR%20Support%2C%20I%20need%20assistance%20regarding%20my%20lithophane%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-[#e5ddd0] hover:border-[#a7f3d0] rounded-2xl p-5 shadow-xs flex flex-col gap-2 font-sans group transition-all cursor-pointer block"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#1e7234]">Fast Response</span>
                <span className="text-xs font-bold text-[#059669] group-hover:translate-x-0.5 transition-transform">
                  Chat Now →
                </span>
              </div>
              <h3 className="text-base font-serif font-bold text-[#2e1e12] group-hover:text-[#059669] transition-colors">
                WhatsApp Helpdesk
              </h3>
              <p className="text-xs text-[#6e5c50]">Monday to Saturday from 10:00 AM to 7:00 PM IST:</p>
              <span className="text-xs font-bold text-[#2e1e12] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                +91 90357 65038
              </span>
            </a>

            {/* Handcrafting Studio */}
            <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 shadow-xs flex flex-col gap-2 font-sans">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a3a1a]">Handcrafting Studio</span>
              <h3 className="text-base font-serif font-bold text-[#2e1e12]">Workshop &amp; Fulfillment</h3>
              <p className="text-xs text-[#6e5c50] leading-relaxed">
                ICR Custom Creations Studio<br />
                Bannerghatta Road<br />
                Bangalore, Karnataka, 560068
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
