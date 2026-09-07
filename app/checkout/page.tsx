"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart, CartItem, syncCartWithServer } from "@/lib/cart";
import { ASSETS } from "@/lib/assets";
import { useAuth } from "@/context/AuthContext";
import {
  orderApi,
  couponApi,
  userApi,
  Address,
  CouponValidation,
} from "@/lib/api";

const INDIAN_STATES = [
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Haryana",
  "Telangana",
  "Kerala",
  "Madhya Pradesh",
  "Punjab",
  "Bihar",
  "Odisha",
  "Andhra Pradesh",
  "Assam",
  "Chhattisgarh",
  "Goa",
  "Himachal Pradesh",
  "Jharkhand",
  "Uttarakhand",
  "Jammu and Kashmir",
  "Chandigarh",
  "Puducherry",
];

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

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCoupon = searchParams.get("coupon") || "";

  const { user } = useAuth();
  const { items, subtotal, isLoaded, clear, remove } = useCart();

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);

  // Add Address Modal state (for users who want to add an address via popup)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressModalError, setAddressModalError] = useState("");
  const [modalForm, setModalForm] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "Delhi",
    pincode: "",
    isDefault: true,
  });

  // Shipping Form state
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

  // Coupons
  const [promoInput, setPromoInput] = useState(initialCoupon);
  const [appliedPromo, setAppliedPromo] = useState<CouponValidation | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [orderCompleted, setOrderCompleted] = useState<{
    orderId: string;
    items: CartItem[];
    total: number;
    shipping: ShippingFormData;
  } | null>(null);

  // Pre-fill user profile info and fetch saved addresses
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));

      setModalForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        phone: prev.phone || user.phone || "",
      }));

      setIsAddressesLoading(true);
      userApi
        .getAddresses()
        .then((res) => {
          if (res.success && res.data?.addresses) {
            const addrs = res.data.addresses;
            setSavedAddresses(addrs);

            if (addrs.length > 0) {
              const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
              setSelectedAddressId(defaultAddr.id);
              setFormData((prev) => ({
                ...prev,
                fullName: prev.fullName || user.name || "",
                phone: prev.phone || user.phone || "",
                addressLine: defaultAddr.line1 + (defaultAddr.line2 ? `, ${defaultAddr.line2}` : ""),
                city: defaultAddr.city,
                state: defaultAddr.state,
                pincode: defaultAddr.pincode,
              }));
            }
          }
        })
        .finally(() => {
          setIsAddressesLoading(false);
        });
    }
  }, [user]);

  // Validate initial coupon if passed from /cart
  const applyCouponCode = useCallback(
    async (code: string) => {
      if (!code || subtotal <= 0) return;
      setPromoLoading(true);
      setPromoError("");
      const subtotalPaise = Math.round(subtotal * 100);
      const res = await couponApi.validate(code, subtotalPaise);
      setPromoLoading(false);

      if (res.success && res.data?.coupon) {
        setAppliedPromo(res.data);
      } else {
        setPromoError(res.error || "Invalid or expired coupon code.");
      }
    },
    [subtotal]
  );

  useEffect(() => {
    if (initialCoupon && isLoaded && subtotal > 0 && !appliedPromo) {
      applyCouponCode(initialCoupon);
    }
  }, [initialCoupon, isLoaded, subtotal, appliedPromo, applyCouponCode]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddressSelect(addrId: string) {
    setSelectedAddressId(addrId);
    if (addrId === "manual_entry") {
      setFormData((prev) => ({
        ...prev,
        addressLine: "",
        city: "",
        state: "Delhi",
        pincode: "",
      }));
      return;
    }

    const addr = savedAddresses.find((a) => a.id === addrId);
    if (addr) {
      setFormData((prev) => ({
        ...prev,
        addressLine: addr.line1 + (addr.line2 ? `, ${addr.line2}` : ""),
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
      }));
    }
  }

  // Handle removing an item directly from the checkout review
  function handleRemoveReviewItem(itemId: string) {
    remove(itemId);
    const remaining = items.filter((i) => i.id !== itemId);
    const newSubtotal = remaining.reduce((s, i) => s + i.price * (i.quantity || 1), 0);

    if (appliedPromo && newSubtotal > 0) {
      couponApi.validate(appliedPromo.coupon.code, Math.round(newSubtotal * 100)).then((res) => {
        if (res.success && res.data) {
          setAppliedPromo(res.data);
        } else {
          setAppliedPromo(null);
          setPromoError(
            `Coupon ${appliedPromo.coupon.code} removed: ${res.error || "Minimum order requirement not met."}`
          );
        }
      });
    }
  }

  // Handle Saving New Address from Modal
  async function handleSaveNewAddress(e: React.FormEvent) {
    e.preventDefault();
    setAddressModalError("");

    if (!modalForm.line1.trim()) {
      setAddressModalError("Please enter your flat / house number and street name.");
      return;
    }
    if (!modalForm.city.trim()) {
      setAddressModalError("Please enter your city.");
      return;
    }
    if (!modalForm.state.trim()) {
      setAddressModalError("Please select your state.");
      return;
    }
    const cleanPincode = modalForm.pincode.replace(/\D/g, "");
    if (cleanPincode.length !== 6) {
      setAddressModalError("Please enter a valid 6-digit delivery pincode.");
      return;
    }

    setIsSavingAddress(true);
    try {
      const res = await userApi.addAddress({
        label: modalForm.label || "Home",
        line1: modalForm.line1.trim(),
        line2: modalForm.line2.trim() || undefined,
        city: modalForm.city.trim(),
        state: modalForm.state.trim(),
        pincode: cleanPincode,
        isDefault: modalForm.isDefault,
      });

      if (res.success && res.data?.address) {
        const newAddr = res.data.address;

        setSavedAddresses((prev) => {
          if (newAddr.isDefault) {
            return [newAddr, ...prev.map((a) => ({ ...a, isDefault: false }))];
          }
          return [...prev, newAddr];
        });

        setSelectedAddressId(newAddr.id);
        setFormData((prev) => ({
          ...prev,
          fullName: modalForm.fullName.trim() || prev.fullName || user?.name || "",
          phone: modalForm.phone.trim() || prev.phone || user?.phone || "",
          addressLine: newAddr.line1 + (newAddr.line2 ? `, ${newAddr.line2}` : ""),
          city: newAddr.city,
          state: newAddr.state,
          pincode: newAddr.pincode,
        }));

        setIsAddressModalOpen(false);
      } else {
        setAddressModalError(res.error || "Failed to save address. Please try again.");
      }
    } catch {
      setAddressModalError("Failed to save address. Please check your connection.");
    } finally {
      setIsSavingAddress(false);
    }
  }

  // Calculate totals
  const discountRupees = appliedPromo ? Math.round(appliedPromo.discountAmount / 100) : 0;
  const finalTotal = Math.max(0, subtotal - discountRupees);

  async function handleCompleteOrder(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.addressLine.trim() ||
      !formData.pincode.trim()
    ) {
      setErrorMessage("Please complete all mandatory delivery address fields.");
      return;
    }

    const cleanPincode = formData.pincode.replace(/\D/g, "");
    if (cleanPincode.length !== 6) {
      setErrorMessage("Pincode must be a valid 6-digit Indian postal code.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. If user entered address inline and checked "save address", save it in background
      let effectiveAddressId = selectedAddressId && selectedAddressId !== "manual_entry" ? selectedAddressId : undefined;

      if (!effectiveAddressId && saveAddressToAccount) {
        try {
          const saveRes = await userApi.addAddress({
            label: "Home",
            line1: formData.addressLine.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: cleanPincode,
            isDefault: savedAddresses.length === 0,
          });
          if (saveRes.success && saveRes.data?.address) {
            effectiveAddressId = saveRes.data.address.id;
          }
        } catch {
          // non-blocking fallback to inline address
        }
      }

      // 2. Ensure Razorpay SDK script is ready
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        setErrorMessage("Failed to load Razorpay gateway. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      // 3. Ensure server cart matches local cart items
      await syncCartWithServer(items, true);

      // 4. Create ICR Order + Razorpay Order in Backend
      const createRes = await orderApi.createOrder({
        addressId: effectiveAddressId,
        inlineAddress: !effectiveAddressId
          ? {
              fullName: formData.fullName.trim(),
              phone: formData.phone.trim(),
              email: formData.email.trim(),
              line1: formData.addressLine.trim(),
              city: formData.city.trim(),
              state: formData.state.trim(),
              pincode: cleanPincode,
            }
          : undefined,
        couponCode: appliedPromo?.coupon.code,
        notes: formData.notes || undefined,
        paymentMethod,
      });

      if (!createRes.success || !createRes.data) {
        setErrorMessage(createRes.error || "Failed to initialize order. Please try again.");
        setIsProcessing(false);
        return;
      }

      const { order, razorpay } = createRes.data;

      // 5. Open Razorpay Checkout Modal
      const options = {
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: "ICR Custom Creations",
        description: `Custom Lithophane Order #${order.id.slice(-6).toUpperCase()}`,
        image: ASSETS.logo,
        order_id: razorpay.orderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#e07a28",
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verifyRes = await orderApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              clear(); // clear local cart
              setOrderCompleted({
                orderId: order.id,
                items: [...items],
                total: finalTotal,
                shipping: { ...formData },
              });
            } else {
              setErrorMessage(
                verifyRes.error ||
                  "Payment verification failed. If money was deducted, our team will confirm your order shortly."
              );
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            setErrorMessage("Payment received. Verifying order confirmation with server...");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzpInstance = new (window as any).Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzpInstance.on("payment.failed", function (response: any) {
        setIsProcessing(false);
        setErrorMessage(
          response?.error?.description || "Payment was not completed. You can retry anytime."
        );
      });

      rzpInstance.open();
    } catch (err: unknown) {
      console.error("Checkout submission error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong during checkout.");
      setIsProcessing(false);
    }
  }

  // ── Order Placed Success View ──────────────────────────────
  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white border border-[#e8dfd5] rounded-3xl p-6 sm:p-10 shadow-xl text-center">
          {/* Checkmark Icon */}
          <div className="w-16 h-16 bg-[#eaf5ec] border-2 border-[#1e7234] rounded-full flex items-center justify-center mx-auto mb-5 text-[#1e7234] shadow-sm">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-[#e07a28] font-sans">
            Payment Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2e1e12] mt-1 mb-2">
            Thank you, {orderCompleted.shipping.fullName}!
          </h1>
          <p className="text-sm text-[#6e5c50] font-sans mb-6">
            Your custom lithophane lamp has been received and queued for handcrafted 3D laser engraving.
          </p>

          <div className="bg-[#faf7f2] border border-[#e8dfd5] rounded-2xl p-4 sm:p-5 text-left mb-6 font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-[#e8dfd5]">
              <span className="text-xs text-[#6e5c50]">Order ID</span>
              <span className="text-sm font-bold text-[#2e1e12] font-mono">
                #{orderCompleted.orderId.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#e8dfd5]">
              <span className="text-xs text-[#6e5c50]">Estimated Delivery</span>
              <span className="text-sm font-semibold text-[#1e7234]">3 - 5 Business Days</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#e8dfd5]">
              <span className="text-xs text-[#6e5c50]">Delivering to</span>
              <span className="text-xs font-medium text-[#2e1e12] text-right max-w-[240px] truncate">
                {orderCompleted.shipping.addressLine}, {orderCompleted.shipping.city} (
                {orderCompleted.shipping.pincode})
              </span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-sm font-bold text-[#2e1e12]">Total Paid</span>
              <span className="text-lg font-sans font-bold text-[#e07a28]">
                ₹{orderCompleted.total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Render preview of ordered items */}
          <div className="text-left mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6e5c50] font-sans mb-3">
              Customized Keepsakes in this Order:
            </h3>
            <div className="flex flex-col gap-3">
              {orderCompleted.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-center bg-[#faf7f2] p-3 rounded-xl border border-[#e8dfd5]"
                >
                  {item.previewDataUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.previewDataUrl}
                      alt={item.templateName}
                      className="w-16 h-16 object-cover rounded-lg border border-[#e8dfd5] shrink-0"
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
              href={`/orders/${orderCompleted.orderId}`}
              className="bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl font-sans transition-all shadow-md inline-flex items-center justify-center gap-1.5"
            >
              <span>View Order Details</span>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/orders"
              className="bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#EAE4DC] text-[#2e1e12] text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl font-sans transition-colors inline-flex items-center justify-center"
            >
              All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f2ebdc] text-[#5a3a1a] flex items-center justify-center mb-4 shadow-sm">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#2e1e12] mb-2">Your Bag is Empty</h2>
        <p className="text-sm text-[#6e5c50] font-sans mb-6 max-w-sm">
          You don&apos;t have any personalized lithophanes in your bag right now.
        </p>
        <Link
          href="/customize"
          className="bg-[#e07a28] hover:bg-[#c96a1f] text-white px-6 py-3.5 rounded-xl font-bold font-sans text-xs uppercase tracking-wider shadow-md transition-all"
        >
          Create a Personalized Lamp
        </Link>
      </div>
    );
  }

  const hasSavedAddresses = savedAddresses.length > 0;
  const isEnteringManualAddress = !hasSavedAddresses || selectedAddressId === "manual_entry";

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] flex flex-col">
      {/* ── Fixed Checkout Header ──────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e8dfd5]">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-[#6e5c50] hover:text-[#2e1e12] font-sans text-sm font-medium transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">Back to Bag</span>
            <span className="sm:hidden">Bag</span>
          </Link>

          <Link href="/" className="relative w-10 h-10 shrink-0">
            <Image
              src={ASSETS.logo}
              alt="ICR Custom Creations"
              fill
              sizes="40px"
              className="object-contain"
              priority
            />
          </Link>

          <div className="flex items-center gap-1.5 text-[#1e7234] text-xs font-semibold font-sans bg-[#eaf5ec] px-3 py-1 rounded-full border border-[#c6e6ca]">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.707 6.707l-4.5 4.5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l3.793-3.793a1 1 0 011.414 1.414z" />
            </svg>
            <span>Razorpay Secured</span>
          </div>
        </div>
      </header>

      {/* ── Main Checkout Form & Summary ───────────────────── */}
      <main className="pt-24 pb-20 max-w-[1200px] mx-auto px-4 lg:px-8 w-full">
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#2e1e12] mb-6">
          Checkout
        </h1>

        {errorMessage && (
          <div className="mb-6 bg-[#fdf2f2] border border-[#f5c6cb] text-[#901c1c] text-xs sm:text-sm px-4 py-3 rounded-xl flex items-center justify-between animate-fadeIn">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-[#901c1c] font-bold ml-2 text-sm hover:opacity-75"
            >
              ✕
            </button>
          </div>
        )}

        <form
          onSubmit={handleCompleteOrder}
          className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start"
        >
          {/* Left Column: Delivery Details & Payment */}
          <div className="flex flex-col gap-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white border border-[#e8dfd5] rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#f2ebdc]">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#e07a28] text-white flex items-center justify-center text-xs font-bold font-sans shrink-0">
                    1
                  </span>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[#2e1e12] whitespace-nowrap">
                    Delivery Address
                  </h2>
                </div>

                {/* Refined Add New button (only shown when saved addresses exist) */}
                {hasSavedAddresses && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddressModalError("");
                      setModalForm({
                        label: "Home",
                        fullName: user?.name || formData.fullName || "",
                        phone: user?.phone || formData.phone || "",
                        line1: "",
                        line2: "",
                        city: "",
                        state: "Delhi",
                        pincode: "",
                        isDefault: false,
                      });
                      setIsAddressModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold font-sans text-[#e07a28] hover:text-[#c96a1f] bg-[#fff8f2] hover:bg-[#ffede0] border border-[#f0c8a0] px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Case A: User HAS Saved Addresses */}
              {isAddressesLoading ? (
                <div className="flex flex-col gap-3 mb-5">
                  <div className="skeleton-shimmer rounded-xl h-[72px] w-full" />
                  <div className="skeleton-shimmer rounded-xl h-[72px] w-full" />
                </div>
              ) : hasSavedAddresses ? (
                <div className="mb-5 flex flex-col gap-3">
                  <span className="text-xs font-semibold text-[#5a3a1a] font-sans">
                    Deliver To:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleAddressSelect(addr.id)}
                          className={`p-3.5 rounded-xl border text-xs font-sans cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "border-[#e07a28] bg-[#fffbf7] ring-1 ring-[#e07a28]/30 shadow-sm"
                              : "border-[#e8dfd5] hover:border-[#c9baa7] hover:bg-[#faf7f2]"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    isSelected
                                      ? "border-[#e07a28] bg-[#e07a28]"
                                      : "border-[#a89887]"
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                  )}
                                </span>
                                <span className="font-bold uppercase tracking-wider text-[10px] bg-[#f2ebdc] text-[#5a3a1a] px-2 py-0.5 rounded-md">
                                  {addr.label || "Address"}
                                </span>
                              </div>
                              {addr.isDefault && (
                                <span className="text-[9px] font-bold text-[#1e7234] bg-[#eaf5ec] px-1.5 py-0.5 rounded uppercase">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="font-semibold text-[#2e1e12] mt-1 text-xs">
                              {formData.fullName || user?.name || "Recipient"}
                            </p>
                            <p className="text-[#6e5c50] text-[11px] line-clamp-2 mt-0.5 leading-relaxed">
                              {addr.line1}
                              {addr.line2 ? `, ${addr.line2}` : ""}
                            </p>
                            <p className="text-[#6e5c50] text-[11px] font-medium mt-0.5">
                              {addr.city}, {addr.state} -{" "}
                              <span className="font-mono font-semibold text-[#2e1e12]">{addr.pincode}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Option to enter manual address */}
                    <div
                      onClick={() => handleAddressSelect("manual_entry")}
                      className={`p-3.5 rounded-xl border text-xs font-sans cursor-pointer transition-all flex items-center gap-2.5 ${
                        selectedAddressId === "manual_entry"
                          ? "border-[#e07a28] bg-[#fffbf7] ring-1 ring-[#e07a28]/30 shadow-sm"
                          : "border-[#e8dfd5] hover:border-[#c9baa7] hover:bg-[#faf7f2]"
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedAddressId === "manual_entry"
                            ? "border-[#e07a28] bg-[#e07a28]"
                            : "border-[#a89887]"
                        }`}
                      >
                        {selectedAddressId === "manual_entry" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        )}
                      </span>
                      <span className="font-medium text-[#2e1e12]">
                        Deliver to a different address
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Case B: First-time Buyer or Manual Address Entry (Zero-friction, no popup required) */}
              {isEnteringManualAddress && (
                <div className="flex flex-col gap-4 mb-4">
                  {!hasSavedAddresses && (
                    <div className="bg-[#faf7f2] border border-[#e8dfd5] rounded-xl p-3 text-xs text-[#6e5c50] font-sans flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e07a28" strokeWidth="2" className="shrink-0">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      <span>Please enter your delivery destination. We&apos;ll carefully ship your custom lamp here.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans">
                    {/* Street Address Line 1 */}
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="font-semibold text-[#5a3a1a]">
                        House / Flat No., Apartment, Street Address <span className="text-[#b83a3a]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="addressLine"
                        value={formData.addressLine}
                        onChange={handleChange}
                        placeholder="e.g. Flat 402, Oakwood Residency, 14th Main"
                        className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                      />
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-[#5a3a1a]">
                        City <span className="text-[#b83a3a]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. New Delhi"
                        className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                      />
                    </div>

                    {/* State */}
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-[#5a3a1a]">
                        State <span className="text-[#b83a3a]">*</span>
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="bg-white border border-[#dcd4c8] rounded-xl px-3 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pincode */}
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-[#5a3a1a]">
                        Pincode <span className="text-[#b83a3a]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        name="pincode"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                          }))
                        }
                        placeholder="6 Digits"
                        className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 font-mono transition-all"
                      />
                    </div>

                    {/* Save to account checkbox */}
                    <div className="flex items-center gap-2 pt-1 sm:col-span-2">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        checked={saveAddressToAccount}
                        onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                        className="accent-[#e07a28] w-4 h-4 rounded"
                      />
                      <label htmlFor="saveAddress" className="text-xs text-[#5a3a1a] cursor-pointer">
                        Save this address to my account for faster checkout next time
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipient Details & Notes */}
              <div className="border-t border-[#f2ebdc] pt-4 mt-2">
                <span className="text-xs font-semibold text-[#5a3a1a] font-sans block mb-3">
                  Recipient Contact Details:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1">
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
                      className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1">
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
                      className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="font-semibold text-[#5a3a1a]">
                      Email Address (for order receipts & tracking) <span className="text-[#b83a3a]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                    />
                  </div>

                  {/* Special Instructions */}
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="font-semibold text-[#5a3a1a]">
                      Special Gift / Delivery Notes (optional)
                    </label>
                    <textarea
                      rows={2}
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="e.g. Please pack carefully as an anniversary gift"
                      className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method (Handled securely by Razorpay) */}
            <div className="bg-white border border-[#e8dfd5] rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#f2ebdc]">
                <span className="w-6 h-6 rounded-full bg-[#e07a28] text-white flex items-center justify-center text-xs font-bold font-sans shrink-0">
                  2
                </span>
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#2e1e12]">
                  Payment Method
                </h2>
              </div>

              <div className="flex flex-col gap-2.5 font-sans text-xs sm:text-sm">
                {/* UPI */}
                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "upi"
                      ? "border-[#e07a28] bg-[#fffbf7] ring-1 ring-[#e07a28]/30 shadow-sm"
                      : "border-[#e8dfd5] hover:bg-[#faf7f2]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className="accent-[#e07a28] w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-[#2e1e12] block">
                        UPI / Google Pay / PhonePe / Paytm / QR
                      </span>
                      <span className="text-[#6e5c50] text-xs">
                        Instant UPI QR code or direct payment via apps
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#1e7234] bg-[#eaf5ec] px-2 py-0.5 rounded-md shrink-0">
                    FASTEST
                  </span>
                </label>

                {/* Cards */}
                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-[#e07a28] bg-[#fffbf7] ring-1 ring-[#e07a28]/30 shadow-sm"
                      : "border-[#e8dfd5] hover:bg-[#faf7f2]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="accent-[#e07a28] w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-[#2e1e12] block">Credit / Debit Card</span>
                      <span className="text-[#6e5c50] text-xs">
                        Visa, Mastercard, RuPay, Amex
                      </span>
                    </div>
                  </div>
                </label>

                {/* NetBanking */}
                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "netbanking"
                      ? "border-[#e07a28] bg-[#fffbf7] ring-1 ring-[#e07a28]/30 shadow-sm"
                      : "border-[#e8dfd5] hover:bg-[#faf7f2]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "netbanking"}
                      onChange={() => setPaymentMethod("netbanking")}
                      className="accent-[#e07a28] w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-[#2e1e12] block">Net Banking</span>
                      <span className="text-[#6e5c50] text-xs">
                        HDFC, ICICI, SBI, Axis, Kotak & 50+ Banks
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-3.5 flex items-center gap-2 text-xs text-[#6e5c50] font-sans">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1e7234" strokeWidth="2" className="shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Payments handled securely by Razorpay. 100% RBI compliant & encrypted.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Summary */}
          <div className="flex flex-col gap-4 sticky top-24">
            <div className="bg-white border border-[#e8dfd5] rounded-2xl p-5 sm:p-6 shadow-sm">
              <h2 className="text-base font-serif font-bold text-[#2e1e12] mb-4 pb-2 border-b border-[#f2ebdc]">
                Order Review ({items.length} {items.length === 1 ? "item" : "items"})
              </h2>

              {/* Items List with Clean Remove Button */}
              <div className="flex flex-col gap-3 mb-5 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 items-start py-2.5 border-b border-[#f5ede0] last:border-0 group"
                  >
                    {item.previewDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.previewDataUrl}
                        alt={item.templateName}
                        className="w-14 h-14 object-cover rounded-lg border border-[#e8dfd5] shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[#faf7f2] border border-[#e8dfd5] flex items-center justify-center text-[10px] text-[#6e5c50]">
                        Lithophane
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[9px] bg-[#f2ebdc] text-[#5a3a1a] px-1.5 py-0.5 rounded font-bold uppercase font-sans">
                            {item.templateName}
                          </span>
                          <h4 className="text-xs font-serif font-semibold text-[#2e1e12] truncate mt-0.5">
                            Personalized Lithophane Lamp
                          </h4>
                        </div>

                        {/* Subtle Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveReviewItem(item.id)}
                          title="Remove item"
                          className="text-[#998877] hover:text-[#b83a3a] hover:bg-[#fdf2f2] p-1.5 rounded-lg transition-colors shrink-0"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>

                      <div className="flex justify-between items-baseline mt-1.5">
                        <span className="text-xs text-[#6e5c50] font-sans">Qty: {item.quantity}</span>
                        <span className="text-xs font-bold font-sans text-[#2e1e12]">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Section */}
              <div className="mb-4 pb-4 border-b border-[#f2ebdc]">
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-[#eaf5ec] border border-[#c6e6ca] rounded-xl px-3 py-2 text-xs text-[#1e7234] font-sans">
                    <div>
                      <span className="font-bold uppercase tracking-wider">
                        {appliedPromo.coupon.code}
                      </span>
                      <span className="block text-[11px] text-[#2c6e3b]">
                        ₹{Math.round(appliedPromo.discountAmount / 100).toLocaleString("en-IN")} discount applied!
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoInput("");
                      }}
                      className="text-[#b83a3a] font-bold text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo / Coupon code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-white border border-[#dcd4c8] rounded-xl px-3 py-2 text-xs sm:text-sm uppercase font-sans text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                    />
                    <button
                      type="button"
                      disabled={promoLoading || !promoInput.trim()}
                      onClick={() => applyCouponCode(promoInput.trim())}
                      className="bg-[#2e1e12] hover:bg-[#443021] text-white px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-colors disabled:opacity-50"
                    >
                      {promoLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {promoError && (
                  <span className="block mt-1.5 text-xs text-[#b83a3a] font-sans">
                    {promoError}
                  </span>
                )}
              </div>

              {/* Breakdown */}
              <div className="flex flex-col gap-2.5 text-xs sm:text-sm font-sans">
                <div className="flex justify-between text-[#6e5c50]">
                  <span>Items Subtotal</span>
                  <span className="text-[#2e1e12] font-semibold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {discountRupees > 0 && (
                  <div className="flex justify-between text-[#1e7234] font-medium">
                    <span>Coupon Discount ({appliedPromo?.coupon.code})</span>
                    <span>- ₹{discountRupees.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#6e5c50]">
                  <span>Crafting & 3D Laser Engraving</span>
                  <span className="text-[#1e7234] font-semibold uppercase">FREE</span>
                </div>
                <div className="flex justify-between text-[#6e5c50]">
                  <span>Express Insured Shipping</span>
                  <span className="text-[#1e7234] font-semibold uppercase">FREE</span>
                </div>

                <div className="border-t border-[#e8dfd5] pt-3 mt-1 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#2e1e12]">Total to Pay</span>
                  <span className="text-xl font-sans font-bold text-[#e07a28]">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-5 bg-[#e07a28] hover:bg-[#c96a1f] text-white font-bold font-sans text-xs sm:text-sm uppercase tracking-wider py-3.5 sm:py-4 rounded-xl shadow-[0_4px_14px_rgba(224,122,40,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>Opening Razorpay Gateway...</span>
                  </div>
                ) : (
                  <>
                    <span>Pay ₹{finalTotal.toLocaleString("en-IN")} & Place Order</span>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M4 8h8M8 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>

              <div className="mt-3.5 text-[11px] text-center text-[#6e5c50] font-sans">
                100% Satisfaction Guarantee · Verified Handmade Lithophanes
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* ── Add New Address Modal ───────────────────────────── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-[#e8dfd5] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-[#f2ebdc] mb-5">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2e1e12]">
                  Add Delivery Address
                </h3>
                <p className="text-xs text-[#6e5c50] font-sans mt-0.5">
                  Where should we ship your personalized lithophane lamp?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#faf7f2] hover:bg-[#f2ebdc] text-[#6e5c50] flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {addressModalError && (
              <div className="mb-4 bg-[#fdf2f2] border border-[#f5c6cb] text-[#901c1c] text-xs px-3.5 py-2.5 rounded-xl">
                {addressModalError}
              </div>
            )}

            <form onSubmit={handleSaveNewAddress} className="flex flex-col gap-4 text-xs sm:text-sm font-sans">
              {/* Address Label Chips */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-[#5a3a1a] text-xs">Address Type</label>
                <div className="flex gap-2">
                  {["Home", "Work", "Other"].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setModalForm((prev) => ({ ...prev, label: lbl }))}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        modalForm.label === lbl
                          ? "border-[#e07a28] bg-[#fff8f2] text-[#e07a28]"
                          : "border-[#e8dfd5] text-[#6e5c50] hover:bg-[#faf7f2]"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#5a3a1a] text-xs">
                    Contact Person <span className="text-[#b83a3a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.fullName}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Recipient's Name"
                    className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#5a3a1a] text-xs">
                    Phone Number <span className="text-[#b83a3a]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={modalForm.phone}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>
              </div>

              {/* Street Line 1 */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#5a3a1a] text-xs">
                  Flat, House No., Building, Street <span className="text-[#b83a3a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalForm.line1}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, line1: e.target.value }))}
                  placeholder="e.g. Flat 301, Silver Oak Apts, 2nd Cross"
                  className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                />
              </div>

              {/* Street Line 2 */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#5a3a1a] text-xs">
                  Area, Colony, Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={modalForm.line2}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, line2: e.target.value }))}
                  placeholder="e.g. Near Metro Station, Indiranagar"
                  className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                />
              </div>

              {/* City, State & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#5a3a1a] text-xs">
                    City <span className="text-[#b83a3a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.city}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Bengaluru"
                    className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#5a3a1a] text-xs">
                    State <span className="text-[#b83a3a]">*</span>
                  </label>
                  <select
                    value={modalForm.state}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, state: e.target.value }))}
                    className="bg-white border border-[#dcd4c8] rounded-xl px-2.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#5a3a1a] text-xs">
                    Pincode <span className="text-[#b83a3a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={modalForm.pincode}
                    onChange={(e) =>
                      setModalForm((prev) => ({
                        ...prev,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    placeholder="6 Digits"
                    className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] font-mono"
                  />
                </div>
              </div>

              {/* Set as Default Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={modalForm.isDefault}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                  }
                  className="accent-[#e07a28] w-4 h-4 rounded"
                />
                <span className="text-xs text-[#5a3a1a]">
                  Make this my default delivery address
                </span>
              </label>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-[#f2ebdc] mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e8dfd5] text-xs font-semibold text-[#6e5c50] hover:bg-[#faf7f2] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-5 py-2.5 rounded-xl bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingAddress ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save & Deliver Here</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin w-8 h-8 text-[#e07a28]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span className="text-[#6e5c50] text-sm font-sans">Loading checkout...</span>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
