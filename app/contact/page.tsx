"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";
import { useToast } from "@/context/ToastContext";

export default function ContactUsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderId: "",
    subject: "Order Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitted(true);
    showToast({
      title: "Message Sent Successfully",
      message: "We will get back to you within 24 business hours.",
      type: "success",
    });
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
          Customer Care
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2e1e12] mt-1 mb-2">
          Contact Us
        </h1>
        <p className="text-sm text-[#6e5c50] font-sans mb-8 leading-relaxed max-w-xl">
          Have a question about your custom lithophane, bulk corporate gifting, or order tracking? We are here to assist you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8">
          {/* Form */}
          <div className="bg-white border border-[#e5ddd0] rounded-2xl p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#eaf5ec] border border-[#c6e6ca] flex items-center justify-center text-[#1e7234]">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#2e1e12]">Thank You!</h3>
                <p className="text-xs text-[#6e5c50] font-sans max-w-xs">
                  Your message has been received. Our support team will reply to <strong>{formData.email}</strong> within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-bold font-sans text-[#e07a28] underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-sans">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#5a3a1a]">
                    Full Name <span className="text-[#b83a3a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rittik Sharma"
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#5a3a1a]">
                    Email Address <span className="text-[#b83a3a]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#5a3a1a]">
                      Order ID (if applicable)
                    </label>
                    <input
                      type="text"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      placeholder="e.g. #ICR-8491"
                      className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#5a3a1a]">
                      Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                    >
                      <option value="Order Inquiry">Order Status &amp; Tracking</option>
                      <option value="Customization Question">Customization / Photo Assistance</option>
                      <option value="Corporate Gifting">Bulk / Corporate Gifting</option>
                      <option value="Other">Other Query</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#5a3a1a]">
                    Message <span className="text-[#b83a3a]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe how we can help you..."
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl p-3 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 bg-[#e07a28] hover:bg-[#c96a1f] text-white font-bold font-sans text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98]"
                >
                  Send Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Quick Contact Info Cards */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 shadow-xs flex flex-col gap-2 font-sans">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#e07a28]">Direct Support</span>
              <h3 className="text-base font-serif font-bold text-[#2e1e12]">Email Us</h3>
              <p className="text-xs text-[#6e5c50]">For order support, photo design queries, and general questions:</p>
              <a href="mailto:hello@icrcustomcreations.in" className="text-xs font-bold text-[#2e1e12] hover:text-[#e07a28] transition-colors mt-1">
                hello@icrcustomcreations.in
              </a>
            </div>

            <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 shadow-xs flex flex-col gap-2 font-sans">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#1e7234]">Quick Response</span>
              <h3 className="text-base font-serif font-bold text-[#2e1e12]">WhatsApp Helpdesk</h3>
              <p className="text-xs text-[#6e5c50]">Mon - Sat from 10:00 AM to 7:00 PM IST:</p>
              <span className="text-xs font-bold text-[#2e1e12]">
                +91 9035765038
              </span>
            </div>

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
