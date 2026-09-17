"use client";

import { useState, useEffect, useCallback } from "react";
import { Address } from "@/lib/api";
import CustomSelect from "@/components/CustomSelect";

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export interface AddressFormData {
  label: string;
  recipientName: string;
  phone: string;
  alternatePhone?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface AddressBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editingAddress?: Address | null;
  onSave: (data: AddressFormData, addressId?: string) => Promise<boolean | void>;
  defaultRecipientName?: string;
  defaultPhone?: string;
}

export default function AddressBottomSheet({
  isOpen,
  onClose,
  editingAddress,
  onSave,
  defaultRecipientName = "",
  defaultPhone = "",
}: AddressBottomSheetProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  const [form, setForm] = useState<AddressFormData>({
    label: "Home",
    recipientName: "",
    phone: "",
    alternatePhone: "",
    line1: "",
    line2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  // Populate form when opening or changing address
  useEffect(() => {
    if (isOpen) {
      if (editingAddress) {
        setForm({
          label: editingAddress.label || "Home",
          recipientName: editingAddress.recipientName || defaultRecipientName || "",
          phone: (editingAddress.phone || defaultPhone || "").replace(/\D/g, "").slice(-10),
          alternatePhone: (editingAddress.alternatePhone || "").replace(/\D/g, "").slice(-10),
          line1: editingAddress.line1 || "",
          line2: editingAddress.line2 || "",
          landmark: editingAddress.landmark || "",
          city: editingAddress.city || "",
          state: editingAddress.state || "",
          pincode: editingAddress.pincode || "",
          isDefault: Boolean(editingAddress.isDefault),
        });
      } else {
        setForm({
          label: "Home",
          recipientName: defaultRecipientName || "",
          phone: (defaultPhone || "").replace(/\D/g, "").slice(-10),
          alternatePhone: "",
          line1: "",
          line2: "",
          landmark: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: false,
        });
      }
      setErrorMessage("");
    }
  }, [isOpen, editingAddress, defaultRecipientName, defaultPhone]);

  // Entrance & Exit animation handling
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateIn(true);
        });
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Real Indian Postal Pincode Auto-Lookup
  const handlePincodeChange = async (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, pincode: clean }));

    if (clean.length === 6) {
      setIsPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const detectedCity = po.District || po.Block || "";
          const detectedState = po.State || "";

          setForm((prev) => ({
            ...prev,
            city: prev.city || detectedCity,
            state: prev.state || detectedState,
          }));
        }
      } catch (err) {
        console.warn("Pincode lookup failed:", err);
      } finally {
        setIsPincodeLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.recipientName.trim()) {
      setErrorMessage("Please enter recipient / contact person name.");
      return;
    }
    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!form.line1.trim()) {
      setErrorMessage("Please enter your flat, house number, or building.");
      return;
    }
    if (!form.line2?.trim()) {
      setErrorMessage("Please enter your street, area, or sector.");
      return;
    }
    if (!form.city.trim()) {
      setErrorMessage("Please enter your city.");
      return;
    }
    if (!form.state.trim()) {
      setErrorMessage("Please select your state.");
      return;
    }
    const cleanPincode = form.pincode.replace(/\D/g, "");
    if (cleanPincode.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit delivery pincode.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: AddressFormData = {
        recipientName: form.recipientName.trim(),
        phone: cleanPhone,
        alternatePhone: form.alternatePhone?.trim() || undefined,
        label: form.label || "Home",
        line1: form.line1.trim(),
        line2: form.line2.trim(),
        landmark: form.landmark?.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: cleanPincode,
        isDefault: form.isDefault,
      };

      const result = await onSave(payload, editingAddress?.id);
      if (result !== false) {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Dark backdrop with blur */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          animateIn ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer / Modal Container */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-0 sm:p-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full sm:max-w-lg bg-[#faf7f2] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] border border-[#e5ddd0] transition-all duration-300 ease-out transform ${
            animateIn
              ? "translate-y-0 opacity-100 sm:scale-100"
              : "translate-y-full opacity-0 sm:translate-y-4 sm:scale-95"
          }`}
        >
          {/* Mobile Handle Bar */}
          <div className="w-12 h-1.5 rounded-full bg-[#d5c7b5] mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

          {/* Header */}
          <div className="px-5 sm:px-6 pt-3 pb-3.5 border-b border-[#e5ddd0] flex items-center justify-between shrink-0 bg-white sm:rounded-t-2xl">
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2e1e12]">
                {editingAddress ? "Edit Delivery Address" : "Add Delivery Address"}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6e5c50] font-sans mt-0.5">
                {editingAddress
                  ? "Update your destination details for lithophane shipments"
                  : "Where should we deliver your handcrafted lithophane lamp?"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#faf7f2] hover:bg-[#f2ebdc] text-[#6e5c50] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col overscroll-contain">
            <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm font-sans flex-1">
              {errorMessage && (
                <div className="bg-[#fdf2f2] border border-[#f5c6cb] text-[#901c1c] text-xs px-3.5 py-2.5 rounded-xl">
                  {errorMessage}
                </div>
              )}

              {/* Section 1: Receiver Details */}
              <div className="flex items-center gap-2 pb-1 border-b border-[#f0e8dc]">
                <span className="text-xs font-bold text-[#2e1e12]">Receiver Details</span>
                <span className="text-[11px] text-[#8c7b70]">(for courier contact)</span>
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
                    value={form.recipientName}
                    onChange={(e) => setForm((prev) => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="e.g. Rahul Sharma"
                    className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                  />
                </div>

                {/* Mobile Number with +91 badge */}
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#5a3a1a] text-xs">
                    Mobile Number <span className="text-[#b83a3a]">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="bg-[#f5ede0] border border-r-0 border-[#dcd4c8] text-[#5a3a1a] text-xs font-bold px-3 py-2.5 rounded-l-xl select-none shrink-0">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        }))
                      }
                      placeholder="10-digit mobile"
                      className="w-full bg-white border border-[#dcd4c8] rounded-r-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
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
                    value={form.alternatePhone || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        alternatePhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    placeholder="Optional 10-digit backup mobile"
                    className="w-full bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                  />
                </div>
              </div>

              {/* Section 2: Address Details */}
              <div className="flex items-center gap-2 pt-2 pb-1 border-b border-[#f0e8dc]">
                <span className="text-xs font-bold text-[#2e1e12]">Delivery Address</span>
                <span className="text-[11px] text-[#8c7b70]">(where courier delivers)</span>
              </div>

              {/* Flat / Building */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#5a3a1a] text-xs">
                  Flat, House No., Building, Apartment <span className="text-[#b83a3a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.line1}
                  onChange={(e) => setForm((prev) => ({ ...prev, line1: e.target.value }))}
                  placeholder="e.g. Flat 301, Tower B, Silver Oak"
                  className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                />
              </div>

              {/* Street / Area */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#5a3a1a] text-xs">
                  Area, Street, Colony, Sector <span className="text-[#b83a3a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.line2 || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, line2: e.target.value }))}
                  placeholder="e.g. 12th Main, 4th Block, Koramangala"
                  className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
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
                  value={form.landmark || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, landmark: e.target.value }))}
                  placeholder="e.g. Near Apollo Pharmacy"
                  className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                />
              </div>

              {/* Pincode, City & State Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Pincode with Auto-detection */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#5a3a1a] text-xs">
                      Pincode <span className="text-[#b83a3a]">*</span>
                    </label>
                    {isPincodeLoading && (
                      <span className="text-[10px] text-[#e07a28] animate-pulse">Finding...</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="6 digits"
                    className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
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
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Bengaluru"
                    className="bg-white border border-[#dcd4c8] rounded-xl px-3.5 py-2.5 text-sm text-[#2e1e12] focus:outline-none focus:border-[#e07a28] focus:ring-2 focus:ring-[#e07a28]/15 transition-all"
                  />
                </div>

                {/* State */}
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                  <label className="font-semibold text-[#5a3a1a] text-xs">
                    State <span className="text-[#b83a3a]">*</span>
                  </label>
                  <CustomSelect
                    value={form.state}
                    onChange={(st) => setForm((prev) => ({ ...prev, state: st }))}
                    options={INDIAN_STATES}
                    placeholder="Select State"
                  />
                </div>
              </div>

              {/* Section 3: Save Address As Chips */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="font-semibold text-[#5a3a1a] text-xs">Save Address As</label>
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
                      onClick={() => setForm((prev) => ({ ...prev, label: item.id }))}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        form.label === item.id
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
                  checked={form.isDefault}
                  onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                  className="accent-[#e07a28] w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-xs text-[#5a3a1a]">Make this my default delivery address</span>
              </label>
            </div>

            {/* Action Buttons Footer */}
            <div className="p-3.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-5 bg-white border-t border-[#e5ddd0] flex items-center gap-2.5 shrink-0 sm:rounded-b-2xl">
              <button
                type="button"
                onClick={onClose}
                className="h-11 px-4 rounded-xl border border-[#d5c7b5] text-xs font-semibold text-[#5a3a1a] hover:bg-[#faf7f2] active:bg-[#f0e8dc] transition-colors cursor-pointer shrink-0 flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 flex-1 px-4 rounded-xl bg-[#e07a28] hover:bg-[#c96a1f] active:scale-[0.99] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{editingAddress ? "Updating..." : "Saving..."}</span>
                  </>
                ) : (
                  <span>{editingAddress ? "Update Address" : "Save Delivery Address"}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
