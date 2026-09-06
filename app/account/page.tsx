"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { userApi, Address } from "@/lib/api";

export default function AccountPage() {
  const router = useRouter();
  const { totalCount } = useCart();
  const { user, isLoading, logout, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "saved">("profile");

  // Profile Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: true,
  });

  // Client guard: if loaded and no user, route to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login?redirect=/account");
    }
  }, [isLoading, user, router]);

  // Load addresses
  useEffect(() => {
    if (user) {
      setLoadingAddresses(true);
      userApi
        .getAddresses()
        .then((res) => {
          if (res.success && res.data?.addresses) {
            setAddresses(res.data.addresses);
          }
        })
        .finally(() => setLoadingAddresses(false));
    }
  }, [user]);

  // Initialize edit name when user loads
  useEffect(() => {
    if (user?.name) {
      setEditName(user.name);
    }
  }, [user?.name]);

  async function handleLogout() {
    await logout();
    showToast({ title: "Signed out successfully", type: "info" });
    router.push("/login");
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) return;

    setSavingName(true);
    const res = await updateProfile({ name: editName.trim() });
    setSavingName(false);

    if (res.success) {
      setIsEditingName(false);
      showToast({ title: "Profile updated successfully", type: "success" });
    } else {
      showToast({ title: res.error || "Failed to update profile", type: "error" });
    }
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      showToast({ title: "Please fill in all required address fields", type: "error" });
      return;
    }

    setSavingAddress(true);
    try {
      const res = await userApi.addAddress({
        label: newAddress.label || "Home",
        line1: newAddress.line1,
        line2: newAddress.line2 || undefined,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        isDefault: newAddress.isDefault,
      });

      if (res.success && res.data?.address) {
        showToast({ title: "Delivery address added", type: "success" });
        setShowAddAddressModal(false);
        // refresh address list
        const refreshed = await userApi.getAddresses();
        if (refreshed.success && refreshed.data?.addresses) {
          setAddresses(refreshed.data.addresses);
        }
        setNewAddress({
          label: "Home",
          line1: "",
          line2: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: false,
        });
      } else {
        showToast({ title: res.error || "Failed to add address", type: "error" });
      }
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!confirm("Are you sure you want to remove this delivery address?")) return;

    const res = await userApi.deleteAddress(id);
    if (res.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast({ title: "Address removed", type: "info" });
    } else {
      showToast({ title: "Failed to remove address", type: "error" });
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 border-3 border-[#e07a28] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#6e5c50] uppercase tracking-wider">
            Loading Account...
          </p>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "IC";

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2e1e12] flex flex-col pb-16">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-[#6e5c50] hover:text-[#2e1e12] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <Link href="/" className="font-serif font-bold text-sm tracking-tight text-[#2e1e12]">
            ICR Studio
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5ddd0] bg-white hover:bg-[#fdf2f0] hover:border-[#f5c6cb] hover:text-[#a92323] text-xs font-bold text-[#6e5c50] transition-colors cursor-pointer"
            title="Sign Out"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 w-full flex-1">
        {/* Profile Card */}
        <div className="bg-white border border-[#e5ddd0] rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e07a28] to-[#c96a1f] text-white flex items-center justify-center text-xl font-bold font-serif shadow-sm shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold font-serif text-[#2e1e12]">
                    {user.name}
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f4ece0] text-[#e07a28] border border-[#e8dccb]">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-[#6e5c50] flex items-center gap-1.5 font-medium">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {user.phone || "No phone linked"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditingName(!isEditingName)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#faf7f2] hover:bg-[#f2ebdc] border border-[#e5ddd0] hover:border-[#e07a28] text-xs font-bold text-[#2e1e12] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              {isEditingName ? "Cancel" : "Edit Name"}
            </button>
          </div>

          {/* Inline Edit Form */}
          {isEditingName && (
            <form onSubmit={handleSaveName} className="mt-4 pt-4 border-t border-[#f0e8dc] flex items-center gap-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your full name"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-bold text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
              />
              <button
                type="submit"
                disabled={savingName}
                className="px-4 py-2.5 bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                {savingName ? "Saving..." : "Save"}
              </button>
            </form>
          )}

          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-[#f0e8dc]">
            <Link
              href="/orders"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf7f2] border border-[#e5ddd0] hover:border-[#e07a28] hover:bg-[#fffbf7] transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#e5ddd0] flex items-center justify-center shrink-0 text-[#2e1e12] group-hover:text-[#e07a28] transition-colors shadow-xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#2e1e12] group-hover:text-[#e07a28] transition-colors">
                  My Orders
                </div>
                <div className="text-[11px] text-[#8c786a] truncate">Track & history</div>
              </div>
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf7f2] border border-[#e5ddd0] hover:border-[#e07a28] hover:bg-[#fffbf7] transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#e5ddd0] flex items-center justify-center shrink-0 text-[#2e1e12] group-hover:text-[#e07a28] transition-colors shadow-xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#2e1e12] group-hover:text-[#e07a28] transition-colors">
                  Shopping Bag
                </div>
                <div className="text-[11px] text-[#8c786a] truncate">{totalCount} items saved</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e5ddd0] mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === "profile" ? "text-[#e07a28]" : "text-[#6e5c50] hover:text-[#2e1e12]"
            }`}
          >
            Delivery Addresses ({addresses.length})
            {activeTab === "profile" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e07a28] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === "saved" ? "text-[#e07a28]" : "text-[#6e5c50] hover:text-[#2e1e12]"
            }`}
          >
            Custom Keepsakes
            {activeTab === "saved" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e07a28] rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Delivery Addresses */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#e5ddd0] rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#2e1e12]">Saved Delivery Addresses</h2>
                  <p className="text-xs text-[#6e5c50] mt-0.5">
                    Used for expedited dispatch of your handcrafted lithophanes.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Address
                </button>
              </div>

              {loadingAddresses ? (
                <div className="py-8 text-center text-xs text-[#8c786a]">Loading addresses...</div>
              ) : addresses.length === 0 ? (
                <div className="py-8 text-center bg-[#faf7f2] rounded-2xl border border-dashed border-[#e5ddd0] p-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-[#b5a596] mb-2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <p className="text-xs font-bold text-[#2e1e12] mb-1">No addresses saved yet</p>
                  <p className="text-[11px] text-[#6e5c50] max-w-xs mx-auto mb-3">
                    Add your shipping address for fast 1-click checkout on your next customized creation.
                  </p>
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="px-4 py-2 bg-white border border-[#e5ddd0] hover:border-[#e07a28] text-xs font-bold text-[#2e1e12] rounded-xl transition-colors cursor-pointer"
                  >
                    + Add New Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-2xl border border-[#e5ddd0] bg-[#faf7f2] relative group hover:border-[#e07a28] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#2e1e12] flex items-center gap-1.5">
                          <span>{addr.label || "Address"}</span>
                          {addr.isDefault && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#e07a28] text-white rounded-full">
                              Default
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-[#b5a596] hover:text-[#a92323] transition-colors p-1"
                          title="Remove address"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs font-medium text-[#2e1e12] leading-relaxed">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ""}
                      </p>
                      <p className="text-xs text-[#6e5c50] mt-1">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Studio Support Card */}
            <div className="bg-white border border-[#e5ddd0] rounded-3xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#2e1e12] mb-1">Need Assistance with your Order?</h2>
              <p className="text-xs text-[#6e5c50] leading-relaxed mb-4">
                Every lithophane lamp is precision 3D-sculpted and mounted on certified solid walnut wood. Our Bangalore studio team is available Mon - Sat (10 AM - 7 PM).
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://wa.me/919876543210?text=Hello%20ICR%20Custom%20Creations%2C%20I%20have%20an%20inquiry%20regarding%20my%20account."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#faf7f2] hover:bg-[#f2ebdc] border border-[#e5ddd0] hover:border-[#25D366] text-xs font-bold text-[#2e1e12] rounded-xl transition-all"
                >
                  <span className="text-[#25D366] font-bold">●</span> WhatsApp Studio Support
                </a>
                <a
                  href="mailto:hello@icrcustomcreations.com"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#faf7f2] hover:bg-[#f2ebdc] border border-[#e5ddd0] hover:border-[#e07a28] text-xs font-bold text-[#2e1e12] rounded-xl transition-all"
                >
                  Email hello@icrcustomcreations.com
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Keepsakes */}
        {activeTab === "saved" && (
          <div className="bg-white border border-[#e5ddd0] rounded-3xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#faf7f2] border border-[#e5ddd0] flex items-center justify-center text-[#e07a28] mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-[#2e1e12] mb-1">Create Your Next Keepsake</h2>
            <p className="text-xs text-[#6e5c50] max-w-sm mx-auto mb-5 leading-relaxed">
              Design a custom backlit 3D photo lamp with custom text engraving, anniversary dates, or Spotify code.
            </p>
            <Link
              href="/customize"
              className="inline-flex items-center justify-center bg-[#e07a28] hover:bg-[#c96a1f] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              Start New Customization
            </Link>
          </div>
        )}
      </main>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#e5ddd0] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-serif text-[#2e1e12]">Add Delivery Address</h3>
              <button
                onClick={() => setShowAddAddressModal(false)}
                className="text-[#8c786a] hover:text-[#2e1e12] p-1"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                  Address Label
                </label>
                <input
                  type="text"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  placeholder="e.g. Home, Office, Studio"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-semibold text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                  Street Address (Line 1) *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                  placeholder="Flat, building, street name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-semibold text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                  Apartment, Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                  placeholder="Near landmark or floor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-semibold text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    placeholder="Bengaluru"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-semibold text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    placeholder="Karnataka"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-semibold text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "") })}
                  placeholder="560001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-semibold text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    className="rounded text-[#e07a28] accent-[#e07a28]"
                  />
                  <span className="text-xs font-medium text-[#6e5c50]">
                    Set as default shipping address
                  </span>
                </label>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="w-1/2 py-3 bg-[#faf7f2] hover:bg-[#f2ebdc] text-[#2e1e12] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="w-1/2 py-3 bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  {savingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
