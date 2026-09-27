"use client";

import { useState, useEffect, Suspense, useCallback, useMemo, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart, CartItem, syncCartWithServer } from "@/lib/cart";
import { ASSETS } from "@/lib/assets";
import { useAuth } from "@/context/AuthContext";
import { CheckoutSkeleton } from "@/components/Skeleton";
import {
  orderApi,
  couponApi,
  userApi,
  Address,
  CouponValidation,
} from "@/lib/api";
import CouponDrawer from "@/components/cart/CouponDrawer";
import CustomSelect from "@/components/CustomSelect";

type PaymentModel = "FULL_ONLINE" | "PARTIAL_COD";

const INDIAN_STATES = [
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
  "Gujarat",
  "Telangana",
  "Kerala",
  "Rajasthan",
  "Haryana",
  "Punjab",
  "Andhra Pradesh",
  "Bihar",
  "Madhya Pradesh",
  "Odisha",
  "Assam",
  "Jharkhand",
  "Chhattisgarh",
  "Uttarakhand",
  "Goa",
  "Himachal Pradesh",
  "Tripura",
  "Meghalaya",
  "Manipur",
  "Nagaland",
  "Arunachal Pradesh",
  "Mizoram",
  "Sikkim",
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
  const buyNowItemId = searchParams.get("buyNow") || "";

  const { user, isLoading: isAuthLoading } = useAuth();
  const { items: allCartItems, isLoaded, clear, remove } = useCart();

  // If ?buyNow=... is present, isolate ONLY that item for express checkout
  const buyNowItem = useMemo(() => {
    if (!buyNowItemId) return undefined;
    return allCartItems.find((i) => i.id === buyNowItemId);
  }, [allCartItems, buyNowItemId]);

  const items = useMemo(() => {
    return buyNowItem ? [buyNowItem] : allCartItems;
  }, [buyNowItem, allCartItems]);

  const isExpressBuyNow = Boolean(buyNowItemId && buyNowItem);
  const otherItemsCount = allCartItems.length - items.length;

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  }, [items]);

  // Saved addresses — shared SWR cache key 'user-addresses' (same as account page)
  const { data: savedAddresses = [], isLoading: isAddressesLoading, mutate: mutateAddresses } = useSWR(
    user ? "user-addresses" : null,
    async () => {
      const res = await userApi.getAddresses();
      if (res.success && res.data?.addresses) {
        return res.data.addresses;
      }
      return [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 3000,
    }
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Address Drawer / Modal state (handles both Add and Edit)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressDrawerShouldRender, setAddressDrawerShouldRender] = useState(false);
  const [addressDrawerAnimateIn, setAddressDrawerAnimateIn] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressModalError, setAddressModalError] = useState("");

  const [modalForm, setModalForm] = useState({
    label: "Home",
    recipientName: "",
    phone: "",
    alternatePhone: "",
    line1: "",
    line2: "",
    landmark: "",
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
  const [isCouponDrawerOpen, setIsCouponDrawerOpen] = useState(false);
  const [availableCouponsCount, setAvailableCouponsCount] = useState<number | null>(null);
  // Track when user explicitly removes a coupon to prevent auto-reapply
  const userRemovedCouponRef = useRef(false);

  const [selectedPaymentModel, setSelectedPaymentModel] = useState<PaymentModel>("FULL_ONLINE");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentRecoveryModal, setPaymentRecoveryModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    orderId?: string;
  } | null>(null);

  const [orderCompleted, setOrderCompleted] = useState<{
    orderId: string;
    items: CartItem[];
    total: number;
    shipping: ShippingFormData;
    paymentType?: "FULL_ONLINE" | "PARTIAL_COD";
    advanceAmount?: number;
    shippingCharge?: number;
    balanceDue?: number;
  } | null>(null);

  // Pre-fill user profile info on load
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
        recipientName: prev.recipientName || user.name || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Auto-select default address and pre-fill form when addresses load
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddressId(defaultAddr.id);
      const formattedLine = [
        defaultAddr.line1,
        defaultAddr.line2,
        defaultAddr.landmark ? `Near ${defaultAddr.landmark}` : null,
      ]
        .filter(Boolean)
        .join(", ");

      setFormData((prev) => ({
        ...prev,
        fullName: defaultAddr.recipientName || prev.fullName || user?.name || "",
        phone: defaultAddr.phone || prev.phone || user?.phone || "",
        addressLine: formattedLine,
        city: defaultAddr.city,
        state: defaultAddr.state,
        pincode: defaultAddr.pincode,
      }));
    }
  }, [savedAddresses, selectedAddressId, user]);

  // Fetch available coupons count for Zepto-style coupon banner
  useEffect(() => {
    couponApi
      .listAvailable()
      .then((res) => {
        if (res.success && res.data?.coupons) {
          setAvailableCouponsCount(res.data.coupons.length);
        }
      })
      .catch(() => {});
  }, []);

  // Smooth entrance & exit transitions for Address Bottom Sheet / Modal
  useEffect(() => {
    if (isAddressModalOpen) {
      setAddressDrawerShouldRender(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAddressDrawerAnimateIn(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setAddressDrawerAnimateIn(false);
      const timer = setTimeout(() => {
        setAddressDrawerShouldRender(false);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [isAddressModalOpen]);

  // Lock body scroll when Address Bottom Sheet is open
  useEffect(() => {
    if (isAddressModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAddressModalOpen]);

  // Handle escape key to close Address Bottom Sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isAddressModalOpen) setIsAddressModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddressModalOpen]);

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
    // Skip if user manually removed the coupon, or if a coupon is already applied
    if (isLoaded && subtotal > 0 && !appliedPromo && !userRemovedCouponRef.current) {
      let codeToApply = initialCoupon;
      if (!codeToApply) {
        try {
          // sessionStorage is tab-scoped — cleared when the tab closes.
          codeToApply = sessionStorage.getItem("icr_ref") || "";
        } catch {}
      }
      if (codeToApply) {
        applyCouponCode(codeToApply);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCoupon, isLoaded, subtotal, applyCouponCode]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddressSelect(addrId: string) {
    setSelectedAddressId(addrId);
    const addr = savedAddresses.find((a) => a.id === addrId);
    if (addr) {
      const formattedLine = [
        addr.line1,
        addr.line2,
        addr.landmark ? `Near ${addr.landmark}` : null,
      ]
        .filter(Boolean)
        .join(", ");

      setFormData((prev) => ({
        ...prev,
        fullName: addr.recipientName || prev.fullName || user?.name || "",
        phone: addr.phone || prev.phone || user?.phone || "",
        addressLine: formattedLine,
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

  // Open modal in Add mode
  function handleOpenAddAddress() {
    setEditingAddressId(null);
    setAddressModalError("");
    setModalForm({
      label: "Home",
      recipientName: user?.name || formData.fullName || "",
      phone: user?.phone || formData.phone || "",
      alternatePhone: "",
      line1: "",
      line2: "",
      landmark: "",
      city: "",
      state: "Delhi",
      pincode: "",
      isDefault: savedAddresses.length === 0,
    });
    setIsAddressModalOpen(true);
  }

  // Open modal in Edit mode (pre-fills all existing fields; empty fields remain blank for easy comprehension)
  function handleOpenEditAddress(addr: Address) {
    setEditingAddressId(addr.id);
    setAddressModalError("");
    setModalForm({
      label: addr.label || "Home",
      recipientName: addr.recipientName || "",
      phone: addr.phone || "",
      alternatePhone: addr.alternatePhone || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "Delhi",
      pincode: addr.pincode || "",
      isDefault: addr.isDefault || false,
    });
    setIsAddressModalOpen(true);
  }

  // Handle Saving Address from Modal / Bottom Sheet (Add or Update)
  async function handleSaveNewAddress(e: React.FormEvent) {
    e.preventDefault();
    setAddressModalError("");

    if (!modalForm.recipientName.trim()) {
      setAddressModalError("Please enter recipient / contact person name.");
      return;
    }
    const cleanPhone = modalForm.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setAddressModalError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!modalForm.line1.trim()) {
      setAddressModalError("Please enter your flat / house number and building.");
      return;
    }
    if (!modalForm.line2.trim()) {
      setAddressModalError("Please enter your street, area or sector.");
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

    const payload = {
      recipientName: modalForm.recipientName.trim(),
      phone: cleanPhone,
      alternatePhone: modalForm.alternatePhone.trim() || undefined,
      label: modalForm.label || "Home",
      line1: modalForm.line1.trim(),
      line2: modalForm.line2.trim() || undefined,
      landmark: modalForm.landmark.trim() || undefined,
      city: modalForm.city.trim(),
      state: modalForm.state.trim(),
      pincode: cleanPincode,
      isDefault: modalForm.isDefault,
    };

    setIsSavingAddress(true);
    try {
      if (editingAddressId) {
        // UPDATE existing address
        const res = await userApi.updateAddress(editingAddressId, payload);
        if (res.success && res.data?.address) {
          const updatedAddr = res.data.address;

          // Optimistically update the SWR cache with the updated address
          mutateAddresses(
            (prev) =>
              (prev || []).map((a) => {
                if (a.id === updatedAddr.id) return updatedAddr;
                if (updatedAddr.isDefault) return { ...a, isDefault: false };
                return a;
              }),
            { revalidate: false }
          );

          // Synchronize currently selected address and checkout shipping form data
          setSelectedAddressId(updatedAddr.id);
          const formattedLine = [
            updatedAddr.line1,
            updatedAddr.line2,
            updatedAddr.landmark ? `Near ${updatedAddr.landmark}` : null,
          ]
            .filter(Boolean)
            .join(", ");

          setFormData((prev) => ({
            ...prev,
            fullName: updatedAddr.recipientName || prev.fullName,
            phone: updatedAddr.phone || prev.phone,
            addressLine: formattedLine,
            city: updatedAddr.city,
            state: updatedAddr.state,
            pincode: updatedAddr.pincode,
          }));

          setIsAddressModalOpen(false);
        } else {
          setAddressModalError(res.error || "Failed to update address. Please try again.");
        }
      } else {
        // CREATE new address
        const res = await userApi.addAddress(payload);
        if (res.success && res.data?.address) {
          const newAddr = res.data.address;

          // Optimistically update the SWR cache with the new address
          mutateAddresses(
            (prev) => {
              const list = prev || [];
              if (newAddr.isDefault) {
                return [newAddr, ...list.map((a) => ({ ...a, isDefault: false }))];
              }
              return [...list, newAddr];
            },
            { revalidate: false }
          );

          setSelectedAddressId(newAddr.id);
          const formattedLine = [
            newAddr.line1,
            newAddr.line2,
            newAddr.landmark ? `Near ${newAddr.landmark}` : null,
          ]
            .filter(Boolean)
            .join(", ");

          setFormData((prev) => ({
            ...prev,
            fullName: newAddr.recipientName || modalForm.recipientName.trim() || prev.fullName || user?.name || "",
            phone: newAddr.phone || cleanPhone || prev.phone || user?.phone || "",
            addressLine: formattedLine,
            city: newAddr.city,
            state: newAddr.state,
            pincode: newAddr.pincode,
          }));

          setIsAddressModalOpen(false);
        } else {
          setAddressModalError(res.error || "Failed to save address. Please try again.");
        }
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
  const advanceAmountRupees = Math.min(finalTotal, 500);
  const codShippingRupees = 70;
  const codPayNowTotal = advanceAmountRupees + codShippingRupees;
  const codBalanceDue = Math.max(0, finalTotal - advanceAmountRupees);
  const payNowRupees =
    selectedPaymentModel === "PARTIAL_COD" ? codPayNowTotal : finalTotal;
  const balanceDueRupees =
    selectedPaymentModel === "PARTIAL_COD" ? codBalanceDue : 0;

  // Step 1: Validates delivery address and launches Razorpay directly
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
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const cleanPincode = formData.pincode.replace(/\D/g, "");
    if (cleanPincode.length !== 6) {
      setErrorMessage("Pincode must be a valid 6-digit Indian postal code.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsProcessing(true);

    try {
      const effectiveAddressId = selectedAddressId || undefined;

      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        setErrorMessage("Failed to load Razorpay gateway. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      if (isExpressBuyNow && buyNowItem) {
        await syncCartWithServer(allCartItems, false);
      } else {
        await syncCartWithServer(items, true);
      }

      // Read partner referral code from session (set by ReferralTracker when ?ref=CODE link was visited)
      let partnerLinkCode: string | undefined;
      try {
        partnerLinkCode = sessionStorage.getItem("icr_ref") ?? undefined;
      } catch {}

      const createRes = await orderApi.createOrder({
        addressId: effectiveAddressId,
        inlineAddress: !effectiveAddressId
          ? {
              fullName: formData.fullName.trim(),
              phone: formData.phone.trim(),
              email: formData.email.trim() || undefined,
              line1: formData.addressLine.trim(),
              city: formData.city.trim(),
              state: formData.state.trim(),
              pincode: cleanPincode,
            }
          : undefined,
        couponCode: appliedPromo?.coupon.code,
        notes: formData.notes || undefined,
        paymentMethod: "upi",
        paymentType: selectedPaymentModel,
        cartItemId: isExpressBuyNow && buyNowItem ? (buyNowItem.serverItemId || buyNowItem.templateId) : undefined,
        partnerLinkCode, // backend ignores this if couponCode is set (mutual exclusion prevents double attribution)
      });


      if (!createRes.success || !createRes.data) {
        setErrorMessage(createRes.error || "Failed to initialize order. Please try again.");
        setIsProcessing(false);
        return;
      }

      const { order, razorpay } = createRes.data;
      const isPartialCod = selectedPaymentModel === "PARTIAL_COD";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options: any = {
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: "ICR Custom Creations",
        description: isPartialCod
          ? `Advance for Order #${order.id.slice(-6).toUpperCase()}`
          : `Custom Lithophane Order #${order.id.slice(-6).toUpperCase()}`,
        image: ASSETS.logo,
        order_id: razorpay.orderId,
        prefill: {
          name: formData.fullName,
          email: formData.email.trim() || undefined,
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
              if (isExpressBuyNow && buyNowItemId) {
                remove(buyNowItemId);
              } else {
                clear(); // clear local cart
              }
              setOrderCompleted({
                orderId: order.id,
                items: [...items],
                total: finalTotal,
                shipping: { ...formData },
                paymentType: order.paymentType,
                advanceAmount: order.advanceAmount,
                shippingCharge: order.shippingCharge,
                balanceDue: order.balanceDue,
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
          ondismiss: async function () {
            setIsProcessing(false);
            // Cancel unconfirmed draft order on backend so it never becomes a ghost order
            try {
              await orderApi.cancelOrder(order.id, "Customer closed checkout window");
            } catch (err) {
              console.warn("Could not cancel draft order on dismiss:", err);
            }
          },
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzpInstance = new (window as any).Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzpInstance.on("payment.failed", async function (response: any) {
        setIsProcessing(false);
        const reason =
          response?.error?.description || "Payment was declined by your bank or UPI app.";
        try {
          await orderApi.cancelOrder(order.id, reason);
        } catch (err) {
          console.warn("Could not cancel draft order on failure:", err);
        }

        setPaymentRecoveryModal({
          isOpen: true,
          title: "Payment Could Not Be Completed",
          message: reason,
          orderId: order.id,
        });
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
      <div className="min-h-screen bg-[#FAF8F5] text-[#1A1412] py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white border border-[#EAE4DC] rounded-3xl p-6 sm:p-10 shadow-xl text-center">
          {/* Artisan Glow Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#FAF6F0] border border-[#F0EAE1] text-[#D47124] text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-4 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D47124] animate-pulse"></span>
            <span>Handcrafted Keepsake Confirmed</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1412] mb-2">
            Thank you, {orderCompleted.shipping.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-[#786F66] font-sans max-w-md mx-auto mb-6 leading-relaxed">
            Your personalized lithophane lamp order is verified and registered with our artisan 3D workshop.
          </p>

          {/* Artisan Production Tracker */}
          <div className="bg-[#FAF8F5] border border-[#EAE4DC] rounded-2xl p-4 sm:p-5 mb-6 text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#786F66] block mb-3">
              Artisan Workshop Progress
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white border border-[#A7F3D0] rounded-xl p-2.5 flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold text-xs mb-1">
                  ✓
                </span>
                <span className="font-bold text-[#047857] text-[11px]">Verified</span>
                <span className="text-[10px] text-[#786F66]">Order Placed</span>
              </div>
              <div className="bg-white border border-[#D47124] rounded-xl p-2.5 flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-[#FFF7ED] text-[#D47124] flex items-center justify-center font-bold text-xs mb-1 animate-pulse">
                  2
                </span>
                <span className="font-bold text-[#D47124] text-[11px]">In Queue</span>
                <span className="text-[10px] text-[#786F66]">3D Light Carving</span>
              </div>
              <div className="bg-white/60 border border-[#EAE4DC] rounded-xl p-2.5 flex flex-col items-center opacity-70">
                <span className="w-6 h-6 rounded-full bg-[#FAF8F5] text-[#786F66] flex items-center justify-center font-bold text-xs mb-1">
                  3
                </span>
                <span className="font-semibold text-[#1A1412] text-[11px]">Assembly</span>
                <span className="text-[10px] text-[#786F66]">Wood & LED Base</span>
              </div>
              <div className="bg-white/60 border border-[#EAE4DC] rounded-xl p-2.5 flex flex-col items-center opacity-70">
                <span className="w-6 h-6 rounded-full bg-[#FAF8F5] text-[#786F66] flex items-center justify-center font-bold text-xs mb-1">
                  4
                </span>
                <span className="font-semibold text-[#1A1412] text-[11px]">Dispatch</span>
                <span className="text-[10px] text-[#786F66]">Express Transit</span>
              </div>
            </div>
          </div>

          {/* Order Details Breakdown */}
          <div className="bg-[#FAF8F5] border border-[#EAE4DC] rounded-2xl p-4 sm:p-5 text-left mb-6 font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-[#EAE4DC]">
              <span className="text-xs text-[#786F66]">Order Reference</span>
              <span className="text-sm font-bold text-[#1A1412] font-mono tracking-wide">
                #{orderCompleted.orderId.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#EAE4DC]">
              <span className="text-xs text-[#786F66]">Estimated Delivery</span>
              <span className="text-sm font-semibold text-[#047857]">5 – 7 Business Days</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#EAE4DC]">
              <span className="text-xs text-[#786F66]">Delivering to</span>
              <span className="text-xs font-medium text-[#1A1412] text-right max-w-[240px] truncate">
                {orderCompleted.shipping.addressLine}, {orderCompleted.shipping.city} - {orderCompleted.shipping.pincode}
              </span>
            </div>

            {orderCompleted.paymentType === "PARTIAL_COD" ? (
              <>
                <div className="flex justify-between items-center py-3 border-b border-[#EAE4DC]">
                  <span className="text-xs text-[#786F66]">Payment Mode</span>
                  <span className="text-[11px] font-bold text-[#D47124] bg-[#FFF7ED] border border-[#FED7AA] px-2.5 py-0.5 rounded-md font-sans">
                    Partial COD
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#EAE4DC]">
                  <div>
                    <span className="text-xs text-[#786F66] block">Advance Paid Online</span>
                    <span className="text-[11px] text-[#047857]">₹500 craft advance + ₹70 courier handling</span>
                  </div>
                  <span className="text-sm font-bold text-[#047857]">
                    ₹{Math.round(((orderCompleted.advanceAmount ?? 50000) + (orderCompleted.shippingCharge ?? 7000)) / 100).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <div>
                    <span className="text-sm font-bold text-[#1A1412] block">Balance Due on Delivery</span>
                    <span className="text-[11px] text-[#786F66]">Payable at your doorstep via Cash or UPI</span>
                  </div>
                  <span className="text-lg font-sans font-bold text-[#D47124]">
                    ₹{Math.round((orderCompleted.balanceDue ?? 0) / 100).toLocaleString("en-IN")}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center pt-3">
                <div>
                  <span className="text-sm font-bold text-[#1A1412] block">Total Paid Online</span>
                  <span className="text-[11px] text-[#047857]">100% Paid · Free Insured Delivery</span>
                </div>
                <span className="text-lg font-sans font-bold text-[#047857]">
                  ₹{orderCompleted.total.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          {/* Render preview of ordered items */}
          <div className="text-left mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#786F66] font-sans mb-3">
              Keepsakes in this Order:
            </h3>
            <div className="flex flex-col gap-3">
              {orderCompleted.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-center bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE4DC]"
                >
                  {item.previewDataUrl && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#EAE4DC] shrink-0">
                      <Image
                        src={item.previewDataUrl}
                        alt={item.templateName}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] bg-[#F5EFE6] text-[#785B3C] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {item.templateName || "Personalized Lamp"}
                    </span>
                    <h4 className="text-xs sm:text-sm font-serif font-bold text-[#1A1412] mt-0.5 truncate">
                      Personalized Lithophane Lamp
                    </h4>
                    <span className="text-xs text-[#786F66] font-sans">
                      Qty: {item.quantity} · ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions & WhatsApp Support */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/orders/${orderCompleted.orderId}`}
              className="bg-[#D47124] hover:bg-[#BA5D17] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl font-sans transition-all shadow-sm inline-flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <span>View Order & Tracking</span>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a
              href={`https://wa.me/919035765038?text=${encodeURIComponent(`Hi ICR, I just placed order #${orderCompleted.orderId.slice(-8).toUpperCase()} for my personalized lithophane lamp!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-[#FAF8F5] border border-[#EAE4DC] text-[#1A1412] text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl font-sans transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Artisan WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Loading skeleton while cart and auth state are hydrating
  if (!isLoaded || isAuthLoading) {
    return <CheckoutSkeleton />;
  }

  function handleBackToCart() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace("/cart");
    }
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
        <h2 className="text-2xl font-serif font-bold text-[#2e1e12] mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-[#6e5c50] font-sans mb-6 max-w-sm">
          You don&apos;t have any personalized lithophanes in your cart right now.
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

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] flex flex-col">
      {/* ── Fixed Checkout Header ──────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e8dfd5]">
        <div className="relative max-w-[1200px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToCart}
            className="flex items-center gap-1.5 text-[#6e5c50] hover:text-[#2e1e12] font-sans text-sm font-medium transition-colors z-10 cursor-pointer"
            aria-label="Back to Cart"
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
            <span className="hidden sm:inline">Back to Cart</span>
            <span className="sm:hidden">Cart</span>
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

          <div className="flex items-center gap-1.5 text-[#1e7234] text-xs font-semibold font-sans bg-[#eaf5ec] px-3 py-1 rounded-full border border-[#c6e6ca] z-10">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.707 6.707l-4.5 4.5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l3.793-3.793a1 1 0 011.414 1.414z" />
            </svg>
            <span>Secured</span>
          </div>
        </div>
      </header>

      {/* ── Main Checkout Form & Summary ───────────────────── */}
      <main className="pt-24 pb-32 sm:pb-20 max-w-[1200px] mx-auto px-4 lg:px-8 w-full">
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#2e1e12] mb-6">
          Checkout
        </h1>

        {errorMessage && (
          <div className="mb-6 bg-[#fdf2f2] border border-[#f5c6cb] text-[#901c1c] text-xs sm:text-sm px-4 py-3 rounded-sm flex items-center justify-between animate-fadeIn">
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

        {isExpressBuyNow && otherItemsCount > 0 && (
          <div className="mb-6 bg-[#FAF6F0] border border-[#EAE4DC] rounded-sm p-3.5 flex flex-wrap items-center justify-between gap-2.5 text-xs text-[#5C534E] font-sans shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#D47124] uppercase tracking-wider text-[10px] bg-[#FFF7ED] px-2 py-0.5 rounded-sm border border-[#FED7AA]">
                Express Buy Now
              </span>
              <span>
                Checking out this customized item. Your other {otherItemsCount} {otherItemsCount === 1 ? "item is" : "items are"} saved safely in your cart.
              </span>
            </div>
            <Link href="/cart" className="text-[#D47124] hover:text-[#BA5D17] font-bold underline shrink-0">
              View Full Cart
            </Link>
          </div>
        )}

        <form
          onSubmit={handleCompleteOrder}
          className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start"
        >
          {/* Left Column: Delivery Details & Payment */}
          <div className="flex flex-col gap-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white border border-[#e8dfd5] rounded-sm p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#f2ebdc]">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#e07a28] text-white flex items-center justify-center text-xs font-bold font-sans shrink-0">
                    1
                  </span>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[#2e1e12] whitespace-nowrap">
                    Delivery Address
                  </h2>
                </div>

                {/* Add New button (only shown when saved addresses exist) */}
                {hasSavedAddresses && (
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="flex items-center gap-1 text-xs font-semibold font-sans text-[#e07a28] hover:text-[#c96a1f] bg-[#fff8f2] hover:bg-[#ffede0] border border-[#f0c8a0] px-2.5 py-1.5 rounded-sm transition-all cursor-pointer"
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

              {/* Case A: Existing addresses exist */}
              {isAddressesLoading ? (
                <div className="flex flex-col gap-3 mb-5">
                  <div className="skeleton-shimmer rounded-sm h-[72px] w-full" />
                  <div className="skeleton-shimmer rounded-sm h-[72px] w-full" />
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
                          className={`p-3.5 rounded-sm border text-xs font-sans cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "border-[#e07a28] bg-[#fffbf7] ring-1 ring-[#e07a28]/30 shadow-sm"
                              : "border-[#e8dfd5] hover:border-[#c9baa7] hover:bg-[#faf7f2]"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? "border-[#e07a28] bg-[#e07a28]"
                                      : "border-[#a89887]"
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                  )}
                                </span>
                                <span className="font-bold uppercase tracking-wider text-[10px] bg-[#f2ebdc] text-[#5a3a1a] px-2 py-0.5 rounded-sm shrink-0">
                                  {addr.label || "Address"}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[9px] font-bold text-[#1e7234] bg-[#eaf5ec] px-1.5 py-0.5 rounded-sm uppercase shrink-0">
                                    Default
                                  </span>
                                )}
                              </div>

                              {/* Edit Address Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditAddress(addr);
                                }}
                                className="text-xs font-semibold text-[#e07a28] hover:text-[#c96a1f] px-2.5 py-1 rounded-sm hover:bg-[#fff3e8] border border-[#f0c8a0] transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                                title="Edit or complete address details"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                <span>Edit</span>
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-1 gap-2">
                              <p className="font-semibold text-[#2e1e12] text-xs truncate">
                                {addr.recipientName || formData.fullName || user?.name || "Recipient"}
                              </p>
                              {addr.phone && (
                                <span className="text-[11px] text-[#6e5c50] font-sans font-medium shrink-0">
                                  +91 {addr.phone}
                                </span>
                              )}
                            </div>
                            <p className="text-[#6e5c50] text-[11px] line-clamp-2 mt-0.5 leading-relaxed">
                              {addr.line1}
                              {addr.line2 ? `, ${addr.line2}` : ""}
                              {addr.landmark ? `, Near ${addr.landmark}` : ""}
                            </p>
                            <p className="text-[#6e5c50] text-[11px] font-medium mt-0.5">
                              {addr.city}, {addr.state} -{" "}
                              <span className="font-mono font-semibold text-[#2e1e12]">{addr.pincode}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Option to add a different address via bottom sheet */}
                    <div
                      onClick={handleOpenAddAddress}
                      className="p-3.5 rounded-sm border border-dashed border-[#d5c7b5] hover:border-[#e07a28] bg-[#faf7f2] hover:bg-[#fffbf7] text-xs font-sans cursor-pointer transition-all flex items-center gap-2.5 group"
                    >
                      <div className="w-4 h-4 rounded-full border border-[#a89887] group-hover:border-[#e07a28] flex items-center justify-center shrink-0 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e07a28] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="font-medium text-[#2e1e12] group-hover:text-[#e07a28] transition-colors">
                        Deliver to a different address
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Case B: First-time Buyer (Prompt to add delivery address via bottom sheet) */}
              {!hasSavedAddresses && !isAddressesLoading && (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-[#dcd4c8] rounded-sm bg-[#faf7f2] mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#f2ebdc] text-[#5a3a1a] flex items-center justify-center mb-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-[#2e1e12] mb-1">
                    No delivery address added yet
                  </h3>
                  <p className="text-xs text-[#6e5c50] font-sans mb-4 max-w-xs leading-relaxed">
                    Add your delivery address to proceed with your order.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="h-11 px-5 rounded-sm bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-bold font-sans uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add Delivery Address</span>
                  </button>
                </div>
              )}

              {/* Order Communication & Notes */}
              <div className="border-t border-[#f2ebdc] pt-4 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans">
                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#5a3a1a]">
                      Email Address <span className="text-[#8c7b70] text-[11px] font-normal">Optional · For invoice & tracking</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="bg-white border border-[#dcd4c8] rounded-sm px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                    />
                  </div>

                  {/* Special Instructions */}
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#5a3a1a]">
                      Delivery Notes <span className="text-[#8c7b70] text-[11px] font-normal">Optional</span>
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="e.g. Please pack carefully as an anniversary gift"
                      className="bg-white border border-[#dcd4c8] rounded-sm px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Mode */}
            <div className="bg-white border border-[#e8dfd5] rounded-sm p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#f2ebdc]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#e07a28] text-white flex items-center justify-center text-[11px] font-bold font-sans shrink-0">
                    2
                  </span>
                  <h2 className="text-sm sm:text-base font-serif font-bold text-[#2e1e12]">
                    Payment Mode
                  </h2>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#1e7234] font-sans font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Encrypted & Safe</span>
                </div>
              </div>

              {/* Mode Selection Cards: Pay Online vs Pay on Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* 100% Online Option */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPaymentModel("FULL_ONLINE")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPaymentModel("FULL_ONLINE");
                    }
                  }}
                  className={`p-4 rounded-sm border transition-all cursor-pointer text-left relative flex flex-col justify-between ${
                    selectedPaymentModel === "FULL_ONLINE"
                      ? "border-[#D47124] bg-[#FAF6F0] ring-1 ring-[#D47124]/30 shadow-xs"
                      : "border-[#EAE4DC] hover:border-[#D5C7B5] bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            selectedPaymentModel === "FULL_ONLINE"
                              ? "border-[#D47124] bg-[#D47124]"
                              : "border-[#C4BCB3] bg-white"
                          }`}
                        >
                          {selectedPaymentModel === "FULL_ONLINE" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-[#1A1412] font-sans truncate">
                          100% Online Payment
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-sm uppercase shrink-0">
                        Free Delivery
                      </span>
                    </div>

                    <p className="pl-6 text-xs text-[#786F66] font-sans leading-relaxed">
                      Instant confirmation via UPI, Cards & Net Banking. Zero doorstep fee.
                    </p>
                  </div>

                  <div className="pl-6 pt-3 mt-3 border-t border-[#EAE4DC]/70 flex items-baseline justify-between">
                    <span className="text-[10px] text-[#786F66] uppercase font-bold tracking-wider">Pay Full Amount</span>
                    <span className="text-sm font-bold text-[#1A1412]">
                      ₹{finalTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Partial COD Option */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPaymentModel("PARTIAL_COD")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPaymentModel("PARTIAL_COD");
                    }
                  }}
                  className={`p-4 rounded-sm border transition-all cursor-pointer text-left relative flex flex-col justify-between ${
                    selectedPaymentModel === "PARTIAL_COD"
                      ? "border-[#D47124] bg-[#FAF6F0] ring-1 ring-[#D47124]/30 shadow-xs"
                      : "border-[#EAE4DC] hover:border-[#D5C7B5] bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            selectedPaymentModel === "PARTIAL_COD"
                              ? "border-[#D47124] bg-[#D47124]"
                              : "border-[#C4BCB3] bg-white"
                          }`}
                        >
                          {selectedPaymentModel === "PARTIAL_COD" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-[#1A1412] font-sans truncate">
                          Pay on Delivery
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#D47124] bg-[#FFF7ED] border border-[#FED7AA] px-2 py-0.5 rounded-sm uppercase shrink-0">
                        ₹570 Advance
                      </span>
                    </div>

                    <p className="pl-6 text-xs text-[#786F66] font-sans leading-relaxed">
                      ₹500 custom item advance + ₹70 courier handling now. Balance on delivery.
                    </p>
                  </div>

                  <div className="pl-6 pt-3 mt-3 border-t border-[#EAE4DC]/70 flex items-baseline justify-between">
                    <span className="text-[10px] text-[#786F66] uppercase font-bold tracking-wider">Pay Advance Now</span>
                    <span className="text-sm font-bold text-[#1A1412]">
                      ₹{codPayNowTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Badges Row */}
              <div className="pt-2.5 border-t border-[#f2ebdc] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#786F66] font-sans">
                <div className="flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.2" className="shrink-0">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>256-Bit SSL Encrypted Checkout via Razorpay</span>
                </div>
                
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Summary */}
          <div className="flex flex-col gap-4 sticky top-24">
            <div className="bg-white border border-[#e8dfd5] rounded-sm p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#f2ebdc]">
                <h2 className="text-sm sm:text-base font-serif font-bold text-[#2e1e12]">
                  Order Review
                </h2>
                <span className="text-xs text-[#786a5e] font-sans font-medium">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Items List with Clean Remove Button */}
              <div className="flex flex-col gap-3 mb-5 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 items-start py-2.5 border-b border-[#f5ede0] last:border-0 group"
                  >
                    {item.previewDataUrl ? (
                      <div className="relative w-14 h-14 rounded-sm overflow-hidden border border-[#e8dfd5] shrink-0">
                        <Image
                          src={item.previewDataUrl}
                          alt={item.templateName}
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-sm bg-[#faf7f2] border border-[#e8dfd5] flex items-center justify-center text-[10px] text-[#6e5c50]">
                        Lithophane
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[9px] bg-[#f2ebdc] text-[#5a3a1a] px-1.5 py-0.5 rounded-sm font-bold uppercase font-sans">
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
                          className="text-[#998877] hover:text-[#b83a3a] hover:bg-[#fdf2f2] p-1.5 rounded-sm transition-colors shrink-0"
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

                      {item.texts && Object.values(item.texts).some((t) => t?.value) && (
                        <p className="text-[11px] text-[#6e5c50] truncate font-sans mt-0.5 italic">
                          &ldquo;{Object.values(item.texts).map((t) => t?.value).filter(Boolean).join(" · ")}&rdquo;
                        </p>
                      )}

                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-[11px] text-[#8c7b70] font-sans">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-xs font-bold text-[#2e1e12] font-sans">
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
                  <div className="flex items-center justify-between bg-[#f0f9f2] border border-[#bfe5c6] rounded-sm px-3.5 py-2.5 text-xs text-[#1e7234] font-sans animate-fadeIn">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-sm bg-[#e0f3e4] text-[#1e7234] flex items-center justify-center shrink-0 border border-[#bfe5c6]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold uppercase tracking-wider block truncate">
                          {appliedPromo.coupon.code}
                        </span>
                        <span className="block text-[11px] text-[#2e6e3c] font-medium leading-tight">
                          ₹{Math.round(appliedPromo.discountAmount / 100).toLocaleString("en-IN")} discount applied!
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        userRemovedCouponRef.current = true; // prevent auto-reapply
                        setAppliedPromo(null);
                        setPromoInput("");
                        setPromoError("");
                      }}
                      className="text-[#b83a3a] font-bold text-xs hover:underline cursor-pointer ml-2 shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo / Coupon code"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          if (promoError) setPromoError("");
                        }}
                        className="flex-1 bg-white border border-[#dcd4c8] rounded-sm px-3 py-2 text-xs sm:text-sm uppercase font-sans text-[#2e1e12] focus:outline-none focus:border-[#e07a28]"
                      />
                      <button
                        type="button"
                        disabled={promoLoading || !promoInput.trim()}
                        onClick={() => applyCouponCode(promoInput.trim())}
                        className="bg-[#2e1e12] hover:bg-[#443021] text-white px-3.5 py-2 rounded-sm text-xs font-bold font-sans transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {promoLoading ? "..." : "Apply"}
                      </button>
                    </div>

                    {promoError && (
                      <span className="block mt-1.5 text-xs text-[#b83a3a] font-sans">
                        {promoError}
                      </span>
                    )}

                    {/* Zepto/Blinkit-style "View all available coupons" banner */}
                    <div
                      onClick={() => setIsCouponDrawerOpen(true)}
                      className="mt-2.5 bg-[#fdfaf5] border border-[#e8dfd5] hover:border-[#e07a28]/60 active:bg-[#f5ede0] rounded-sm p-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors group"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setIsCouponDrawerOpen(true);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-sm bg-[#fdf2e8] text-[#e07a28] flex items-center justify-center shrink-0 border border-[#f8dec8]">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-[#2e1e12] font-sans">
                          View all available coupons
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#e07a28] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-sans">
                        View
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                          <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
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
                    <span>Coupon Discount: {appliedPromo?.coupon.code}</span>
                    <span>- ₹{discountRupees.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#6e5c50]">
                  <span>Crafting & Packaging</span>
                  <span className="text-[#1e7234] font-semibold uppercase">FREE</span>
                </div>

                {selectedPaymentModel === "PARTIAL_COD" ? (
                  <>
                    <div className="flex justify-between text-[#6e5c50]">
                      <span>Courier and COD Handling Fee</span>
                      <span className="text-[#2e1e12] font-semibold">₹70</span>
                    </div>

                    <div className="border-t border-[#e8dfd5] pt-3 mt-1 flex justify-between items-baseline">
                      <div>
                        <span className="text-sm font-bold text-[#2e1e12] block">Advance Due Now</span>
                        <span className="text-[11px] text-[#6e5c50]">₹500 item advance + ₹70 courier fee</span>
                      </div>
                      <span className="text-xl font-sans font-bold text-[#e07a28]">
                        ₹{payNowRupees.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="bg-[#fff8f2] border border-[#f5d9c2] rounded-sm p-2.5 mt-1 flex justify-between items-center text-xs">
                      <span className="text-[#5a3a1a] font-medium">Balance on Delivery</span>
                      <span className="font-bold text-[#2e1e12]">
                        ₹{balanceDueRupees.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-[#6e5c50]">
                      <span>Express Insured Shipping</span>
                      <span className="text-[#1e7234] font-semibold uppercase">FREE</span>
                    </div>

                    <div className="border-t border-[#e8dfd5] pt-3 mt-1 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-[#2e1e12]">Total to Pay</span>
                      <span className="text-xl font-sans font-bold text-[#1e7234]">
                        ₹{finalTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Submit CTA - Hidden on mobile to prevent double CTA, only visible on desktop/tablet */}
              <button
                type="submit"
                disabled={isProcessing}
                className="hidden sm:flex w-full mt-5 bg-[#e07a28] hover:bg-[#c96a1f] active:bg-[#b55c14] text-white font-bold font-sans text-xs sm:text-sm uppercase tracking-wider py-3.5 sm:py-4 rounded-sm shadow-[0_4px_14px_rgba(224,122,40,0.35)] transition-all active:scale-[0.98] items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <>
                    <span>
                      {selectedPaymentModel === "PARTIAL_COD"
                        ? `Pay Advance ₹${payNowRupees.toLocaleString("en-IN")}`
                        : `Pay ₹${finalTotal.toLocaleString("en-IN")}`}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3.5 8h9M8.5 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>

              <div className="mt-3 text-[11px] text-center text-[#786a5e] font-sans flex items-center justify-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e7234" strokeWidth="2.2" className="shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Secure 256-bit payment · Fast dispatch across India</span>
              </div>
            </div>
          </div>

          {/* ── Mobile Sticky Bottom Bar (Single Unified CTA on Mobile) ──────── */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#e8dfd5] p-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#6e5c50] tracking-wider block">
                {selectedPaymentModel === "PARTIAL_COD" ? "Advance Due" : "Total to Pay"}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-[#2e1e12] font-sans">
                  ₹{payNowRupees.toLocaleString("en-IN")}
                </span>
                {selectedPaymentModel === "PARTIAL_COD" && (
                  <span className="text-[10px] text-[#855325] font-medium font-sans">
                    + ₹{balanceDueRupees.toLocaleString("en-IN")} on delivery
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="h-11 px-5 rounded-sm bg-[#e07a28] hover:bg-[#c96a1f] active:scale-[0.98] text-white text-xs font-bold font-sans uppercase tracking-wider shadow-[0_2px_8px_rgba(224,122,40,0.3)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {selectedPaymentModel === "PARTIAL_COD"
                      ? `Pay Advance ₹${payNowRupees.toLocaleString("en-IN")}`
                      : `Pay ₹${finalTotal.toLocaleString("en-IN")}`}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3.5 8h9M8.5 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* ── Add New Address Bottom Sheet / Modal ───────────── */}
      {addressDrawerShouldRender && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsAddressModalOpen(false)}
            className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
              addressDrawerAnimateIn ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden="true"
          />

          <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-0 sm:p-4 pointer-events-none">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Add Delivery Address"
              className={`pointer-events-auto w-full sm:max-w-lg bg-[#faf7f2] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[85vh] border border-[#e5ddd0] transition-all duration-300 ease-out transform ${
                addressDrawerAnimateIn
                  ? "translate-y-0 opacity-100 sm:scale-100"
                  : "translate-y-full opacity-0 sm:translate-y-4 sm:scale-95"
              }`}
            >
              {/* Mobile Handle Indicator */}
              <div className="w-12 h-1.5 rounded-full bg-[#d5c7b5] mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

              {/* Header */}
              <div className="px-5 sm:px-6 pt-3 pb-3.5 border-b border-[#e5ddd0] flex items-center justify-between shrink-0 bg-white sm:rounded-t-2xl">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#2e1e12]">
                    {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#6e5c50] font-sans mt-0.5">
                    {editingAddressId
                      ? "Review or update your delivery destination and contact details"
                      : "Where should we ship your personalized lithophane lamp?"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#faf7f2] hover:bg-[#f2ebdc] text-[#6e5c50] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                  aria-label="Close address dialog"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form
                onSubmit={handleSaveNewAddress}
                className="flex-1 overflow-y-auto flex flex-col overscroll-contain"
              >
                <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm font-sans flex-1">
                  {addressModalError && (
                    <div className="bg-[#fdf2f2] border border-[#f5c6cb] text-[#901c1c] text-xs px-3.5 py-2.5 rounded-sm">
                      {addressModalError}
                    </div>
                  )}

                  {/* Section 1: Receiver Details */}
                  <div className="flex items-center gap-2 pb-1 border-b border-[#f0e8dc]">
                    <span className="text-xs font-bold text-[#2e1e12]">
                      Receiver Details
                    </span>
                    <span className="text-[11px] text-[#8c7b70]">
                      (for delivery contact)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-[#5a3a1a] text-xs">
                        Full Name <span className="text-[#b83a3a]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={modalForm.recipientName}
                        onChange={(e) =>
                          setModalForm((prev) => ({ ...prev, recipientName: e.target.value }))
                        }
                        placeholder="e.g. Rittik Sharma"
                        className="bg-white border border-[#dcd4c8] rounded-sm px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                      />
                    </div>

                    {/* Mobile Number with +91 badge */}
                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-[#5a3a1a] text-xs">
                        Mobile Number <span className="text-[#b83a3a]">*</span>
                      </label>
                      <div className="flex items-center">
                        <span className="bg-[#f5ede0] border border-r-0 border-[#dcd4c8] text-[#5a3a1a] text-xs font-bold px-3 py-2.5 rounded-l-sm select-none shrink-0">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={modalForm.phone}
                          onChange={(e) =>
                            setModalForm((prev) => ({
                              ...prev,
                              phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                            }))
                          }
                          placeholder="10-digit mobile number"
                          className="w-full bg-white border border-[#dcd4c8] rounded-r-sm px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                        />
                      </div>
                    </div>

                    {/* Alternate Phone Number */}
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="font-semibold text-[#5a3a1a] text-xs">
                        Alternate Phone{" "}
                        <span className="text-[#8c7b70] text-[11px] font-normal">
                          (Optional — backup if primary unreachable)
                        </span>
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={modalForm.alternatePhone}
                        onChange={(e) =>
                          setModalForm((prev) => ({
                            ...prev,
                            alternatePhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                          }))
                        }
                        placeholder="Optional 10-digit backup mobile number"
                        className="w-full bg-white border border-[#dcd4c8] rounded-sm px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* Section 2: Address Details */}
                  <div className="flex items-center gap-2 pt-2 pb-1 border-b border-[#f0e8dc]">
                    <span className="text-xs font-bold text-[#2e1e12]">
                      Delivery Address
                    </span>
                    <span className="text-[11px] text-[#8c7b70]">
                      (where courier will deliver)
                    </span>
                  </div>

                  {/* Flat / Building */}
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#5a3a1a] text-xs">
                      Flat, House No., Building, Apartment <span className="text-[#b83a3a]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={modalForm.line1}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, line1: e.target.value }))}
                      placeholder="e.g. Flat 301, Tower B, Silver Oak Residency"
                      className="bg-white border border-[#dcd4c8] rounded-sm px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                    />
                  </div>

                  {/* Street / Area / Sector */}
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#5a3a1a] text-xs">
                      Area, Street, Colony, Sector <span className="text-[#b83a3a]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={modalForm.line2}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, line2: e.target.value }))}
                      placeholder="e.g. 12th Main, 4th Block, Koramangala"
                      className="bg-white border border-[#dcd4c8] rounded-sm px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                    />
                  </div>

                  {/* Landmark */}
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#5a3a1a] text-xs">
                      Nearby Landmark{" "}
                      <span className="text-[#8c7b70] text-[11px] font-normal">
                        (Optional — helps courier locate you)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={modalForm.landmark}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, landmark: e.target.value }))}
                      placeholder="e.g. Near Apollo Pharmacy"
                      className="bg-white border border-[#dcd4c8] rounded-sm px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                    />
                  </div>

                  {/* Pincode, City & State Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Pincode */}
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
                        placeholder="6 digits"
                        className="bg-white border border-[#dcd4c8] rounded-sm px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                      />
                    </div>

                    {/* City */}
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
                        className="bg-white border border-[#dcd4c8] rounded-sm px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                      />
                    </div>

                    {/* State using CustomSelect */}
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                      <label className="font-semibold text-[#5a3a1a] text-xs">
                        State <span className="text-[#b83a3a]">*</span>
                      </label>
                      <CustomSelect
                        value={modalForm.state}
                        onChange={(st) => setModalForm((prev) => ({ ...prev, state: st }))}
                        options={INDIAN_STATES}
                        placeholder="Select State"
                      />
                    </div>
                  </div>

                  {/* Section 3: Save Address As Chips */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="font-semibold text-[#5a3a1a] text-xs">
                      Save Address As
                    </label>
                    <div className="flex gap-2">
                      {[
                        {
                          id: "Home",
                          label: "Home",
                          icon: (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                              <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                          ),
                        },
                        {
                          id: "Work",
                          label: "Work",
                          icon: (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                          ),
                        },
                        {
                          id: "Other",
                          label: "Other",
                          icon: (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          ),
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setModalForm((prev) => ({ ...prev, label: item.id }))}
                          className={`px-3 py-1.5 rounded-sm border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            modalForm.label === item.id
                              ? "border-[#e07a28] bg-[#fff8f2] text-[#e07a28] shadow-2xs"
                              : "border-[#e5ddd0] text-[#6e5c50] hover:bg-[#faf7f2] bg-white"
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Set as Default Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={modalForm.isDefault}
                      onChange={(e) =>
                        setModalForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                      }
                      className="accent-[#e07a28] w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-xs text-[#5a3a1a]">
                      Make this my default delivery address
                    </span>
                  </label>
                </div>

                {/* Sticky Action Footer */}
                <div className="p-3.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-5 bg-white border-t border-[#e5ddd0] flex items-center gap-2.5 shrink-0 sm:rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="h-11 px-4 rounded-sm border border-[#d5c7b5] text-xs font-semibold text-[#5a3a1a] hover:bg-[#faf7f2] active:bg-[#f0e8dc] transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAddress}
                    className="h-11 flex-1 px-4 rounded-sm bg-[#e07a28] hover:bg-[#c96a1f] active:scale-[0.99] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {isSavingAddress ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{editingAddressId ? "Updating..." : "Saving..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{editingAddressId ? "Update Address" : "Save Address"}</span>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Coupon Drawer ─────────────────────────────────── */}
      <CouponDrawer
        isOpen={isCouponDrawerOpen}
        onClose={() => setIsCouponDrawerOpen(false)}
        subtotal={subtotal}
        appliedCouponCode={appliedPromo?.coupon.code || null}
        onApplyCoupon={async (code: string) => {
          const res = await couponApi.validate(code, Math.round(subtotal * 100));
          if (res.success && res.data?.coupon) {
            setAppliedPromo(res.data);
            setPromoInput(code);
            setPromoError("");
            return true;
          }
          return false;
        }}
        onRemoveCoupon={() => {
          userRemovedCouponRef.current = true; // prevent auto-reapply
          setAppliedPromo(null);
          setPromoInput("");
          setPromoError("");
        }}
      />

      {/* ── Payment Recovery Modal (Luxury Mobile Bottom Sheet / Centered Desktop Modal) ── */}
      {paymentRecoveryModal?.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn cursor-pointer"
          onClick={() => {
            setPaymentRecoveryModal(null);
            setErrorMessage("");
          }}
        >
          <div
            className="bg-[#FAF8F5] border-t sm:border border-[#EAE4DC] rounded-t-[28px] sm:rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl relative text-left max-h-[92vh] overflow-y-auto pb-8 sm:pb-7 pb-[max(2rem,env(safe-area-inset-bottom))] animate-scaleUp cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag bar */}
            <div className="w-10 h-1 bg-[#D8CEBE] rounded-full mx-auto mb-4 sm:hidden" aria-hidden="true" />

            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => {
                setPaymentRecoveryModal(null);
                setErrorMessage("");
              }}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-[#F0EAE1] hover:bg-[#E5DDD0] text-[#6E5C50] hover:text-[#1A1412] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Header with warm terracotta badge */}
            <div className="flex items-center gap-3 mb-3 pr-8">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF3E8] border border-[#FED7AA] text-[#D47124] flex items-center justify-center shrink-0 shadow-2xs">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D47124] block font-sans">
                  Checkout Assistance
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1A1412] leading-snug">
                  Payment Incomplete
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#6E5C50] leading-relaxed mb-4">
              {paymentRecoveryModal.message?.toLowerCase().includes("cancelled") || paymentRecoveryModal.message?.toLowerCase().includes("dismiss")
                ? "Your payment window was closed before completing. Your customized lamp design is fully saved."
                : paymentRecoveryModal.message || "Your bank or UPI app session timed out. No worry, your order is safely saved."}
            </p>

            {/* Reassurance Card */}
            <div className="bg-white border border-[#EAE4DC] rounded-2xl p-4 mb-5 space-y-3 shadow-2xs">
              <div className="flex items-start gap-2.5 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#EAF5EC] text-[#1E7234] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#1A1412]">Your Photo &amp; Lamp Design are Safe</p>
                  <p className="text-[11px] text-[#786F66] leading-normal mt-0.5">
                    Your uploaded photograph, base engraving text, and coupon remain intact.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs pt-2.5 border-t border-[#F2EBDC]">
                <div className="w-5 h-5 rounded-full bg-[#EAF5EC] text-[#1E7234] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#1A1412]">No Double-Deduction Guarantee</p>
                  <p className="text-[11px] text-[#786F66] leading-normal mt-0.5">
                    If your bank debited any funds, UPI and banking rules automatically refund it within 24–48 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setPaymentRecoveryModal(null);
                  setErrorMessage("");
                }}
                className="w-full bg-[#D47124] hover:bg-[#BA5D17] text-white text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Retry Payment</span>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <a
                href="https://wa.me/919035765038?text=Hello%20ICR%20Studio%2C%20I%20had%20an%20issue%20during%20checkout%20for%20my%20personalized%20lithophane%20lamp."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-[#FAF8F5] border border-[#EAE4DC] text-[#1A1412] hover:text-[#D47124] text-xs font-semibold py-3 px-4 rounded-sm transition-colors inline-flex items-center justify-center gap-2 shadow-2xs"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.587 1.961.913 3.013.913h.005c3.181 0 5.768-2.586 5.769-5.766.001-3.181-2.585-5.768-5.769-5.768zm7.391 10.963c-.416.924-2.146 1.776-3.033 1.896-.807.108-1.854.195-5.326-1.246-4.437-1.843-7.29-6.386-7.51-6.684-.22-.299-1.802-2.399-1.802-4.577 0-2.179 1.139-3.25 1.545-3.693.407-.444.887-.555 1.183-.555.297 0 .593.003.854.016.277.014.646-.105 1.01.767.416.999 1.42 3.469 1.545 3.722.126.253.21.55.042.884-.168.334-.253.541-.5.83-.247.288-.521.644-.744.863-.247.243-.505.508-.217.999.288.491 1.282 2.115 2.753 3.424 1.892 1.684 3.486 2.206 3.981 2.45.495.245.786.205 1.077-.128.291-.334 1.25-1.458 1.583-1.959.334-.5.667-.417 1.125-.25.458.167 2.915 1.375 3.414 1.625.5.25.833.375.958.583.125.208.125 1.208-.291 2.132z"/>
                </svg>
                <span>get assistance</span>
              </a>
            </div>
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
