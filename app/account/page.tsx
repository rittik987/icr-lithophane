"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { userApi, Address } from "@/lib/api";
import { AccountSkeleton, AddressCardSkeleton } from "@/components/Skeleton";

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
  // Inline delete confirmation per address id — avoids window.confirm()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
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

  // Handle pull-to-refresh
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  useEffect(() => {
    function handlePullRefresh() {
      setIsPullRefreshing(true);
      if (user) {
        userApi.getAddresses().then((res) => {
          if (res.success && res.data?.addresses) {
            setAddresses(res.data.addresses);
          }
        });
      }
      setTimeout(() => {
        setIsPullRefreshing(false);
      }, 700);
    }
    window.addEventListener("app:pulled-to-refresh", handlePullRefresh);
    return () => window.removeEventListener("app:pulled-to-refresh", handlePullRefresh);
  }, [user]);

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
    const res = await userApi.deleteAddress(id);
    if (res.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setConfirmDeleteId(null);
      showToast({ title: "Address removed", type: "info" });
    } else {
      showToast({ title: "Failed to remove address", type: "error" });
    }
  }

  if (isLoading || !user || isPullRefreshing) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-40 h-14 sm:h-16 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]" />
        <AccountSkeleton />
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
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Left: Subtle back link */}
          <button
            type="button"
            onClick={() => {
              if (
                typeof document !== "undefined" &&
                (document.referrer.includes("/login") || document.referrer.includes("/register"))
              ) {
                router.replace("/");
              } else if (typeof window !== "undefined" && window.history.length > 2) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-[#6e5c50] hover:text-[#2e1e12] transition-colors cursor-pointer group py-1.5 z-10"
            aria-label="Go back"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:-translate-x-0.5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Back</span>
          </button>

          {/* Center: Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex items-center justify-center">
            <Link
              href="/"
              className="relative w-24 h-24 flex items-center justify-center shrink-0 block hover:opacity-90 transition-opacity"
              aria-label="ICR Studio Home"
            >
              <Image
                src={ASSETS.logo}
                alt="ICR Studio"
                fill
                sizes="96px"
                className="object-contain object-center"
                priority
              />
            </Link>
          </div>

          {/* Right: Balanced spacing matching back button */}
          <div className="w-12" aria-hidden="true" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 w-full flex-1">
        {/* Personal Profile Summary */}
        <div className="flex items-center justify-between mb-5 pt-1">
          <div className="flex items-center gap-3.5">
            {/* Warm circular monogram */}
            <div className="w-12 h-12 rounded-full bg-[#f2e7d8] border border-[#dfd2c0] text-[#a55214] flex items-center justify-center text-sm font-bold font-serif shadow-2xs shrink-0 tracking-wider">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-[#2e1e12] font-serif leading-tight">
                {user.name}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-[#8c786a] mt-0.5">
                <span>{user.phone || "No phone linked"}</span>
                <span className="text-[#d5c5b2]">·</span>
                <button
                  type="button"
                  onClick={() => setIsEditingName(!isEditingName)}
                  className="text-[#c96a1f] hover:text-[#9e4c10] font-semibold transition-colors cursor-pointer"
                >
                  {isEditingName ? "Cancel" : "Edit"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Inline Edit Form */}
        {isEditingName && (
          <form onSubmit={handleSaveName} className="mb-5 p-3 rounded-2xl bg-white border border-[#e8dfd2] shadow-xs flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter your full name"
              className="flex-1 px-3 py-1.5 rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-medium text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
            />
            <button
              type="submit"
              disabled={savingName}
              className="px-3 py-1.5 bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            >
              {savingName ? "Saving..." : "Save"}
            </button>
          </form>
        )}

        {/* Account Navigation Rows (Boutique list style — no border fatigue) */}
        <div className="bg-white border border-[#e8dfd2] rounded-2xl overflow-hidden shadow-xs divide-y divide-[#f3ede3] mb-5">
          <Link
            href="/orders"
            className="flex items-center justify-between p-3.5 hover:bg-[#faf7f2] active:bg-[#f5ede0] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#faf5ee] border border-[#ede3d4] text-[#8c6b4e] group-hover:text-[#c96a1f] flex items-center justify-center transition-colors shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-[#2e1e12]">My Orders</div>
                <div className="text-[10px] text-[#8c786a]">Track packages &amp; order history</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[#a89989] group-hover:text-[#2e1e12] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>

          <Link
            href="/cart"
            className="flex items-center justify-between p-3.5 hover:bg-[#faf7f2] active:bg-[#f5ede0] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#faf5ee] border border-[#ede3d4] text-[#8c6b4e] group-hover:text-[#c96a1f] flex items-center justify-center transition-colors shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-[#2e1e12]">Shopping Cart</div>
                <div className="text-[10px] text-[#8c786a]">{totalCount} {totalCount === 1 ? "item" : "items"} saved</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#f4ece0] text-[#c96a1f] text-[10px] font-bold">
                  {totalCount}
                </span>
              )}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a89989] group-hover:text-[#2e1e12] transition-colors">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Tactile Segmented Pill Selector */}
        <div className="bg-[#ebe3d5] p-1 rounded-xl flex gap-1 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              activeTab === "profile"
                ? "bg-white text-[#2e1e12] shadow-2xs"
                : "text-[#7a685b] hover:text-[#2e1e12]"
            }`}
          >
            <span>Saved Addresses</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
              activeTab === "profile" ? "bg-[#f4ece0] text-[#c96a1f]" : "bg-[#ded4c3] text-[#7a685b]"
            }`}>
              {addresses.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              activeTab === "saved"
                ? "bg-white text-[#2e1e12] shadow-2xs"
                : "text-[#7a685b] hover:text-[#2e1e12]"
            }`}
          >
            <span>Custom Keepsakes</span>
          </button>
        </div>

        {/* Tab 1: Delivery Addresses */}
        {activeTab === "profile" && (
          <div className="space-y-3">
            {/* Section Subheading (Single contextual Add button) */}
            <div className="flex items-center justify-between px-0.5">
              <div>
                <h2 className="text-xs font-bold text-[#2e1e12] uppercase tracking-wider">
                  Delivery Addresses
                </h2>
                <p className="text-[11px] text-[#8c786a] mt-0.5">
                  Used for expedited dispatch of your handcrafted lithophanes
                </p>
              </div>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#c96a1f] hover:text-[#9e4c10] py-1 cursor-pointer transition-colors"
                >
                  <span>+ Add New</span>
                </button>
              )}
            </div>

            {loadingAddresses ? (
              <div className="flex flex-col gap-2.5">
                <AddressCardSkeleton />
                <AddressCardSkeleton />
              </div>
            ) : addresses.length === 0 ? (
              /* Warm artisanal empty state (No dashed upload box, single clean button) */
              <div className="p-6 text-center bg-white rounded-2xl border border-[#e8dfd2] shadow-xs">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#faf5ee] border border-[#ede3d4] flex items-center justify-center text-[#a89989] mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold text-[#2e1e12] mb-1">No saved addresses yet</h3>
                <p className="text-[11px] text-[#8c786a] max-w-xs mx-auto mb-4 leading-relaxed">
                  Save your delivery address for seamless 1-click checkout on your next personalized creation.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  <span>+ Add Delivery Address</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3.5 rounded-2xl border border-[#e8dfd2] bg-white shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2e1e12]">{addr.label || "Address"}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-[#f4ece0] text-[#c96a1f] rounded-md border border-[#eddcca]">
                            Default
                          </span>
                        )}
                      </div>
                      {/* Inline delete confirmation */}
                      {confirmDeleteId === addr.id ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-sans">
                          <span className="text-[#6e5c50]">Remove?</span>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-[#dc2626] font-bold hover:underline"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[#6e5c50] font-medium hover:underline"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(addr.id)}
                          className="text-[#a89989] hover:text-[#dc2626] transition-colors p-1 cursor-pointer"
                          title="Remove address"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-xs font-medium text-[#2e1e12] leading-relaxed">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                    </p>
                    <p className="text-[11px] text-[#8c786a] mt-0.5">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Custom Keepsakes */}
        {activeTab === "saved" && (
          <div className="bg-white border border-[#e8dfd2] rounded-2xl p-6 shadow-xs text-center">
            <div className="w-11 h-11 mx-auto rounded-full bg-[#faf5ee] border border-[#ede3d4] flex items-center justify-center text-[#c96a1f] mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-[#2e1e12] font-serif mb-1">Create Your Next Keepsake</h2>
            <p className="text-[11px] text-[#8c786a] max-w-xs mx-auto mb-4 leading-relaxed">
              Design a custom backlit 3D photo lamp with text engraving, anniversary dates, or Spotify code.
            </p>
            <Link
              href="/customize"
              className="inline-flex items-center justify-center bg-[#e07a28] hover:bg-[#c96a1f] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs active:scale-[0.98]"
            >
              Start New Customization
            </Link>
          </div>
        )}

        {/* Studio Concierge (High-Touch Customer Care) */}
        <div className="mt-7 pt-5 border-t border-[#ebe3d5]">
          <div className="mb-3 px-0.5">
            <h3 className="text-xs font-bold text-[#2e1e12] uppercase tracking-wider">Studio Concierge</h3>
            <p className="text-[11px] text-[#8c786a] mt-0.5">Direct assistance from our Bangalore artisan workshop</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="https://wa.me/919876543210?text=Hello%20ICR%20Custom%20Creations%2C%20I%20have%20an%20inquiry%20regarding%20my%20account."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-[#e8dfd2] hover:border-[#25D366] text-xs font-semibold text-[#2e1e12] transition-all shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              <span>WhatsApp</span>
            </a>
            <a
              href="mailto:hello@icrcustomcreations.com"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-[#e8dfd2] hover:border-[#c96a1f] text-xs font-semibold text-[#2e1e12] transition-all shadow-2xs"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8c786a]">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>Email Studio</span>
            </a>
          </div>
        </div>

        {/* Refined, Understated Sign Out Link */}
        <div className="text-center pt-8 pb-4">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8c786a] hover:text-[#a92323] transition-colors py-2 px-3 cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out of Account</span>
          </button>
        </div>
      </main>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#e5ddd0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-bold text-[#2e1e12]">Add Delivery Address</h3>
              <button
                type="button"
                onClick={() => setShowAddAddressModal(false)}
                className="text-[#8c786a] hover:text-[#2e1e12] p-1 cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-2.5 sm:space-y-3">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                  Address Label
                </label>
                <input
                  type="text"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  placeholder="e.g. Home, Office, Studio"
                  className="w-full px-3 py-2 rounded-lg sm:rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-medium text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                  Street Address (Line 1) *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                  placeholder="Flat, building, street name"
                  className="w-full px-3 py-2 rounded-lg sm:rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-medium text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                  Apartment, Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                  placeholder="Near landmark or floor"
                  className="w-full px-3 py-2 rounded-lg sm:rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-medium text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    placeholder="Bengaluru"
                    className="w-full px-3 py-2 rounded-lg sm:rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-medium text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    placeholder="Karnataka"
                    className="w-full px-3 py-2 rounded-lg sm:rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-medium text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "") })}
                  placeholder="560001"
                  className="w-full px-3 py-2 rounded-lg sm:rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-medium text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white"
                />
              </div>

              <div className="pt-0.5">
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

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="w-1/2 py-2.5 bg-[#faf7f2] hover:bg-[#f2ebdc] text-[#2e1e12] text-xs font-bold uppercase tracking-wider rounded-lg sm:rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="w-1/2 py-2.5 bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-bold uppercase tracking-wider rounded-lg sm:rounded-xl transition-colors cursor-pointer"
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
