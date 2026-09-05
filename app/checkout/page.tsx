"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "@/lib/cart";
import { ASSETS } from "@/lib/assets";

interface ShippingFormData {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, isLoaded, clear } = useCart();

  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "Delhi",
    pincode: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<{
    orderId: string;
    items: CartItem[];
    total: number;
    shipping: ShippingFormData;
  } | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCompleteOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.addressLine || !formData.pincode) {
      alert("Please fill in all mandatory delivery details.");
      return;
    }

    setIsProcessing(true);
    // Simulate payment & server payload construction
    setTimeout(() => {
      const orderId = `ICR-${Date.now().toString().slice(-6)}`;
      setOrderCompleted({
        orderId,
        items: [...items],
        total: subtotal,
        shipping: { ...formData },
      });
      clear();
      setIsProcessing(false);
    }, 1200);
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-[#e07a28]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-[#6e5c50] text-sm font-sans">Loading checkout...</span>
        </div>
      </div>
    );
  }

  // ── Order Placed Success View ──────────────────────────────
  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white border border-[#e5ddd0] rounded-3xl p-6 sm:p-10 shadow-xl text-center">
          {/* Checkmark Icon */}
          <div className="w-20 h-20 bg-[#eaf5ec] border-2 border-[#1e7234] rounded-full flex items-center justify-center mx-auto mb-6 text-[#1e7234]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[#e07a28] font-sans">
            Order Confirmed
          </span>
          <h1 className="text-3xl font-serif font-bold text-[#2e1e12] mt-1 mb-2">
            Thank you, {orderCompleted.shipping.fullName}!
          </h1>
          <p className="text-sm text-[#6e5c50] font-sans mb-6">
            Your custom lithophane lamp has been received and queued for handcrafted 3D laser engraving.
          </p>

          <div className="bg-[#faf7f2] border border-[#e5ddd0] rounded-2xl p-4 sm:p-5 text-left mb-6 font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5ddd0]">
              <span className="text-xs text-[#6e5c50]">Order ID</span>
              <span className="text-sm font-bold text-[#2e1e12] font-mono">#{orderCompleted.orderId}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#e5ddd0]">
              <span className="text-xs text-[#6e5c50]">Estimated Delivery</span>
              <span className="text-sm font-semibold text-[#1e7234]">3 - 5 Business Days</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#e5ddd0]">
              <span className="text-xs text-[#6e5c50]">Delivering to</span>
              <span className="text-xs font-medium text-[#2e1e12] text-right max-w-[240px] truncate">
                {orderCompleted.shipping.addressLine}, {orderCompleted.shipping.city} ({orderCompleted.shipping.pincode})
              </span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-sm font-bold text-[#2e1e12]">Total Paid</span>
              <span className="text-lg font-sans font-bold text-[#e07a28]">
                ₹{orderCompleted.total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Render composite preview of ordered items */}
          <div className="text-left mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6e5c50] font-sans mb-3">
              Customized Keepsakes in this Order:
            </h3>
            <div className="flex flex-col gap-3">
              {orderCompleted.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center bg-[#faf7f2] p-3 rounded-xl border border-[#e5ddd0]">
                  {item.previewDataUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.previewDataUrl}
                      alt={item.templateName}
                      className="w-20 h-16 object-cover rounded-lg border border-[#e5ddd0] shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] bg-[#f2ebdc] text-[#5a3a1a] px-2 py-0.5 rounded font-bold uppercase font-sans">
                      {item.templateName}
                    </span>
                    <h4 className="text-xs font-serif font-semibold text-[#2e1e12] mt-0.5 truncate">
                      Personalized Lithophane Lamp
                    </h4>
                    <span className="text-xs text-[#6e5c50] font-sans">
                      Qty: {item.quantity} · ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-[#2e1e12] hover:bg-[#443021] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl font-sans transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/customize"
              className="bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl font-sans transition-colors shadow-md"
            >
              Customize Another Lamp
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and user directly entered /checkout
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-serif font-bold text-[#2e1e12] mb-2">
          Your cart is empty
        </h2>
        <p className="text-sm text-[#6e5c50] font-sans mb-6">
          Please add a personalized lithophane to your bag before checking out.
        </p>
        <Link
          href="/customize"
          className="bg-[#e07a28] text-white px-6 py-3 rounded-xl font-bold font-sans text-xs uppercase tracking-wider"
        >
          Go to Customize
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] flex flex-col">
      {/* ── Fixed Checkout Header ──────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-[#6e5c50] hover:text-[#2e1e12] font-sans text-sm font-medium transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back to Bag</span>
          </Link>

          <Link href="/" className="relative w-16 h-8 shrink-0">
            <Image
              src={ASSETS.logo}
              alt="ICR Custom Creations"
              fill
              className="object-contain"
              unoptimized
            />
          </Link>

          <div className="flex items-center gap-1.5 text-[#1e7234] text-xs font-semibold font-sans bg-[#eaf5ec] px-3 py-1 rounded-full border border-[#c6e6ca]">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.707 6.707l-4.5 4.5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l3.793-3.793a1 1 0 011.414 1.414z"/>
            </svg>
            <span>256-Bit Encrypted</span>
          </div>
        </div>
      </header>

      {/* ── Main Checkout Form & Summary ───────────────────── */}
      <main className="pt-24 pb-20 max-w-[1200px] mx-auto px-4 lg:px-8 w-full">
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#2e1e12] mb-6">
          Checkout
        </h1>

        <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
          {/* Left Column: Delivery Details & Payment */}
          <div className="flex flex-col gap-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 lg:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#f2ebdc]">
                <span className="w-6 h-6 rounded-full bg-[#e07a28] text-white flex items-center justify-center text-xs font-bold font-sans">
                  1
                </span>
                <h2 className="text-base font-serif font-bold text-[#2e1e12]">
                  Delivery Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                {/* Full Name */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="font-semibold text-[#5a3a1a]">
                    Full Name <span className="text-[#b83a3a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Rittik Sharma"
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[#5a3a1a]">
                    Email Address <span className="text-[#b83a3a]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[#5a3a1a]">
                    Mobile Phone (for delivery SMS) <span className="text-[#b83a3a]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>

                {/* Address Line */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="font-semibold text-[#5a3a1a]">
                    House / Flat No., Apartment, Street Address <span className="text-[#b83a3a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleChange}
                    placeholder="e.g. Flat 402, Oakwood Residency, MG Road"
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>

                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[#5a3a1a]">
                    City <span className="text-[#b83a3a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="New Delhi"
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>

                {/* State */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[#5a3a1a]">
                    State <span className="text-[#b83a3a]">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  >
                    <option value="Delhi">Delhi</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* PIN Code */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[#5a3a1a]">
                    Pincode <span className="text-[#b83a3a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="110001"
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2.5 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>

                {/* Special Instructions */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="font-semibold text-[#5a3a1a]">
                    Special Gift / Delivery Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Please pack carefully as a wedding gift"
                    className="bg-[#faf7f2] border border-[#e5ddd0] rounded-xl px-3.5 py-2 text-xs text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 lg:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#f2ebdc]">
                <span className="w-6 h-6 rounded-full bg-[#e07a28] text-white flex items-center justify-center text-xs font-bold font-sans">
                  2
                </span>
                <h2 className="text-base font-serif font-bold text-[#2e1e12]">
                  Payment Method
                </h2>
              </div>

              <div className="flex flex-col gap-3 font-sans text-xs">
                {/* UPI */}
                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === "upi" ? "border-[#e07a28] bg-[#fff8f2]" : "border-[#e5ddd0] hover:bg-[#faf7f2]"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className="accent-[#e07a28]"
                    />
                    <div>
                      <span className="font-bold text-[#2e1e12] block">UPI / Google Pay / PhonePe / Paytm</span>
                      <span className="text-[#6e5c50] text-[11px]">Instant UPI QR or Direct App Payment</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#1e7234] bg-[#eaf5ec] px-2 py-0.5 rounded">
                    FASTEST
                  </span>
                </label>

                {/* Cards */}
                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === "card" ? "border-[#e07a28] bg-[#fff8f2]" : "border-[#e5ddd0] hover:bg-[#faf7f2]"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="accent-[#e07a28]"
                    />
                    <div>
                      <span className="font-bold text-[#2e1e12] block">Credit / Debit Card</span>
                      <span className="text-[#6e5c50] text-[11px]">Visa, Mastercard, RuPay, Amex</span>
                    </div>
                  </div>
                </label>

                {/* NetBanking */}
                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === "netbanking" ? "border-[#e07a28] bg-[#fff8f2]" : "border-[#e5ddd0] hover:bg-[#faf7f2]"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "netbanking"}
                      onChange={() => setPaymentMethod("netbanking")}
                      className="accent-[#e07a28]"
                    />
                    <div>
                      <span className="font-bold text-[#2e1e12] block">Net Banking</span>
                      <span className="text-[#6e5c50] text-[11px]">All Indian Banks Supported</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="flex flex-col gap-4 sticky top-24">
            <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 lg:p-6 shadow-sm">
              <h2 className="text-base font-serif font-bold text-[#2e1e12] mb-4">
                Order Review ({items.length} item{items.length > 1 ? "s" : ""})
              </h2>

              {/* Items List */}
              <div className="flex flex-col gap-3 mb-5 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center py-2 border-b border-[#f5ede0] last:border-0">
                    {item.previewDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.previewDataUrl}
                        alt={item.templateName}
                        className="w-16 h-14 object-cover rounded-lg border border-[#e5ddd0] shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-14 rounded-lg bg-[#faf7f2] border border-[#e5ddd0] flex items-center justify-center text-[10px] text-[#6e5c50]">
                        Lithophane
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] bg-[#f2ebdc] text-[#5a3a1a] px-1.5 py-0.5 rounded font-bold uppercase font-sans">
                        {item.templateName}
                      </span>
                      <h4 className="text-xs font-serif font-semibold text-[#2e1e12] truncate mt-0.5">
                        Personalized Lithophane Lamp
                      </h4>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-[11px] text-[#6e5c50] font-sans">Qty: {item.quantity}</span>
                        <span className="text-xs font-bold font-sans text-[#2e1e12]">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="flex flex-col gap-2.5 text-xs font-sans border-t border-[#f2ebdc] pt-3">
                <div className="flex justify-between text-[#6e5c50]">
                  <span>Items Subtotal</span>
                  <span className="text-[#2e1e12] font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[#6e5c50]">
                  <span>Crafting & Engraving</span>
                  <span className="text-[#1e7234] font-semibold uppercase">FREE</span>
                </div>
                <div className="flex justify-between text-[#6e5c50]">
                  <span>Express Insured Shipping</span>
                  <span className="text-[#1e7234] font-semibold uppercase">FREE</span>
                </div>

                <div className="border-t border-[#e5ddd0] pt-3 mt-1 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#2e1e12]">Total to Pay</span>
                  <span className="text-xl font-sans font-bold text-[#e07a28]">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-6 bg-[#e07a28] hover:bg-[#c96a1f] text-white font-bold font-sans text-xs uppercase tracking-wider py-4 rounded-xl shadow-[0_4px_14px_rgba(224,122,40,0.35)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Securing Order...</span>
                  </div>
                ) : (
                  <>
                    <span>Pay ₹{subtotal.toLocaleString("en-IN")} & Place Order</span>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>

              <div className="mt-4 text-[10px] text-center text-[#6e5c50] font-sans">
                By placing this order you agree to our handcrafted bespoke terms & satisfaction guarantee.
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
