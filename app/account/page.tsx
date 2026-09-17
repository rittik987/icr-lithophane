"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { userApi, uploadApi, Address } from "@/lib/api";
import { AccountSkeleton, AddressCardSkeleton } from "@/components/Skeleton";
import AddressBottomSheet, { AddressFormData } from "@/components/AddressBottomSheet";

export default function AccountPage() {
  const router = useRouter();
  const { totalCount } = useCart();
  const { user, isLoading, logout, updateProfile } = useAuth();
  const { showToast } = useToast();

  // Profile Edit State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Address State — SWR for automatic cache across route transitions
  const {
    data: addresses = [],
    isLoading: loadingAddresses,
    mutate: mutateAddresses,
  } = useSWR(
    user ? "user-addresses" : null,
    async () => {
      const res = await userApi.getAddresses();
      if (res.success && res.data?.addresses) {
        return res.data.addresses;
      }
      return [];
    },
    { revalidateOnFocus: false, dedupingInterval: 3000 }
  );

  // Real Address Bottom Sheet / Modal state
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Inline delete confirmation per address id
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Client guard: if loaded and no user, route to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login?redirect=/account");
    }
  }, [isLoading, user, router]);

  // Handle pull-to-refresh
  useEffect(() => {
    function handlePullRefresh() {
      mutateAddresses();
    }
    window.addEventListener("app:pulled-to-refresh", handlePullRefresh);
    return () => window.removeEventListener("app:pulled-to-refresh", handlePullRefresh);
  }, [mutateAddresses]);

  function openEditProfileModal() {
    if (!user) return;
    setProfileName(user.name || "");
    setProfileEmail(user.email || "");
    const rawPhone = user.phone || "";
    setProfilePhone(rawPhone.startsWith("+91") ? rawPhone.slice(3) : rawPhone);
    setProfileAvatarUrl(user.avatarUrl || null);
    setShowEditProfileModal(true);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast({ title: "Please select an image file", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast({ title: "Image must be under 5MB", type: "error" });
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await uploadApi.uploadFiles([file], "avatars");
      if (res.success && res.assets?.[0]?.url) {
        setProfileAvatarUrl(res.assets[0].url);
        showToast({ title: "Photo uploaded. Click Save Changes to apply.", type: "success" });
      } else {
        showToast({ title: res.error || "Failed to upload photo", type: "error" });
      }
    } catch {
      showToast({ title: "Network error uploading photo", type: "error" });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast({ title: "Name cannot be empty", type: "error" });
      return;
    }

    setSavingProfile(true);
    try {
      const formattedPhone = profilePhone.trim() ? `+91${profilePhone.replace(/\D/g, "")}` : undefined;
      const res = await userApi.updateProfile({
        name: profileName.trim(),
        email: profileEmail.trim() || undefined,
        phone: formattedPhone,
        avatarUrl: profileAvatarUrl || undefined,
      });

      if (res.success && res.data?.user) {
        updateProfile({
          name: res.data.user.name,
          email: res.data.user.email || undefined,
          phone: res.data.user.phone || undefined,
          avatarUrl: res.data.user.avatarUrl,
        });
        setShowEditProfileModal(false);
        showToast({ title: "Profile updated successfully", type: "success" });
      } else {
        showToast({ title: res.error || "Failed to update profile", type: "error" });
      }
    } catch {
      showToast({ title: "Network error updating profile", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  }

  // Handle Save Address from the shared AddressBottomSheet (Add or Edit)
  async function handleSaveAddress(payload: AddressFormData, addressId?: string) {
    if (addressId) {
      // UPDATE existing address
      const res = await userApi.updateAddress(addressId, payload);
      if (res.success && res.data?.address) {
        const updated = res.data.address;
        mutateAddresses(
          (prev) =>
            (prev || []).map((a) => {
              if (a.id === updated.id) return updated;
              if (payload.isDefault) return { ...a, isDefault: false };
              return a;
            }),
          { revalidate: false }
        );
        showToast({ title: "Address updated successfully", type: "success" });
        return true;
      } else {
        throw new Error(res.error || "Failed to update address");
      }
    } else {
      // ADD new address
      const res = await userApi.addAddress(payload);
      if (res.success && res.data?.address) {
        const created = res.data.address;
        mutateAddresses(
          (prev) =>
            payload.isDefault
              ? [created, ...(prev || []).map((a) => ({ ...a, isDefault: false }))]
              : [...(prev || []), created],
          { revalidate: false }
        );
        showToast({ title: "Address saved successfully", type: "success" });
        return true;
      } else {
        throw new Error(res.error || "Failed to add address");
      }
    }
  }

  async function handleDeleteAddress(id: string) {
    const res = await userApi.deleteAddress(id);
    if (res.success) {
      mutateAddresses(
        (prev) => (prev ? prev.filter((a) => a.id !== id) : []),
        { revalidate: false }
      );
      setConfirmDeleteId(null);
      showToast({ title: "Address removed", type: "info" });
    } else {
      showToast({ title: "Failed to remove address", type: "error" });
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  function handleOpenAddAddress() {
    setEditingAddress(null);
    setIsAddressSheetOpen(true);
  }

  function handleOpenEditAddress(addr: Address) {
    setEditingAddress(addr);
    setIsAddressSheetOpen(true);
  }

  if (isLoading || !user) {
    return <AccountSkeleton />;
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
      {/* ── Fixed Header ────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Left: Back button with chevron */}
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
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#2e1e12] hover:text-[#5a3a1a] transition-colors cursor-pointer group py-1.5"
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
          <Link
            href="/"
            className="relative w-28 h-12 flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
            aria-label="ICR Custom Creations Home"
          >
            <Image
              src={ASSETS.logo}
              alt="ICR Custom Creations"
              width={110}
              height={48}
              className="object-contain"
              priority
            />
          </Link>

          {/* Right: Sign Out with icon */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#2e1e12] hover:text-[#a92323] transition-colors cursor-pointer py-1.5"
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
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Main Content — Responsive max-w-[1240px] ───────── */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-8 xl:gap-12 items-start">

          {/* ══════════════════════════════════════════════════════
              LEFT SIDEBAR: Seamless Profile & Navigation (Matches Design)
          ════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-6">
            {/* User Profile Block */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3.5">
                {/* Circular Avatar or Monogram */}
                {user.avatarUrl ? (
                  <div className="relative w-15 h-15 rounded-full overflow-hidden border-2 border-[#dfd2c0] shadow-xs shrink-0">
                    <Image
                      src={user.avatarUrl}
                      alt={user.name || "Profile"}
                      fill
                      className="object-cover"
                      sizes="60px"
                    />
                  </div>
                ) : (
                  <div className="w-15 h-15 rounded-full bg-[#f2e7d8] border-2 border-[#dfd2c0] text-[#a55214] flex items-center justify-center text-lg font-bold font-serif shadow-xs shrink-0 tracking-wider">
                    {initials}
                  </div>
                )}

                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-[#2e1e12] font-serif leading-tight truncate">
                    {user.name}
                  </h1>
                  <div className="flex flex-col gap-0.5 text-xs text-[#6e5c50] mt-1 font-sans">
                    {user.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8c786a] shrink-0">
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8c786a] shrink-0">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Profile Button Pill */}
              <button
                type="button"
                onClick={openEditProfileModal}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#ede5d8] hover:bg-[#e4dacb] text-xs font-semibold text-[#2e1e12] transition-colors shadow-2xs mt-1 self-start cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="h-px bg-[#e8dfd2]" />

            {/* Navigation Menu List */}
            <nav className="flex flex-col gap-1.5" aria-label="Account Navigation">
              {/* My Orders */}
              <Link
                href="/orders"
                className="flex items-center justify-between pl-3.5 pr-4 py-3 rounded-xl text-[#4a392e] hover:bg-[#ede5d8]/50 hover:text-[#2e1e12] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-[#6e5849] group-hover:text-[#2e1e12]">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  <span className="text-sm font-medium">My Orders</span>
                </div>
              </Link>

              {/* Shopping Cart */}
              <Link
                href="/cart"
                className="flex items-center justify-between pl-3.5 pr-4 py-3 rounded-xl text-[#4a392e] hover:bg-[#ede5d8]/50 hover:text-[#2e1e12] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-[#6e5849] group-hover:text-[#2e1e12]">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span className="text-sm font-medium">Shopping Cart</span>
                </div>
                {totalCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#ede5d8] text-[#452715] text-[11px] font-bold flex items-center justify-center">
                    {totalCount}
                  </span>
                )}
              </Link>

              {/* Saved Addresses (Active Tab with Left Accent Bar) */}
              <div
                className="flex items-center justify-between pl-4 pr-4 py-3 rounded-xl bg-[#ede5d8] text-[#2e1e12] font-semibold relative shadow-2xs select-none"
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.2 h-6 bg-[#452715] rounded-r-full" />
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="text-[#452715]">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-sm">Saved Addresses</span>
                </div>
              </div>
            </nav>

            {/* Bottom Tagline — Artisan Sign-off */}
            <div className="hidden lg:flex flex-col pt-8 mt-6 relative">
              {/* Subtle Botanical Leaf Watermark */}
              <svg
                className="absolute -bottom-10 -left-6 w-48 h-48 text-[#cbb8a3]/25 pointer-events-none select-none -z-0"
                viewBox="0 0 200 200"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M20 180 C 50 140, 80 110, 140 60 C 160 40, 180 30, 190 20"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M55 145 C 50 135, 45 125, 35 125 C 25 125, 25 140, 55 145 Z"
                  fill="currentColor"
                  strokeWidth="1"
                />
                <path
                  d="M75 130 C 85 120, 95 118, 102 126 C 108 134, 98 142, 75 130 Z"
                  fill="currentColor"
                  strokeWidth="1"
                />
                <path
                  d="M95 108 C 88 96, 78 92, 68 96 C 58 100, 68 114, 95 108 Z"
                  fill="currentColor"
                  strokeWidth="1"
                />
                <path
                  d="M115 90 C 128 78, 138 78, 142 88 C 146 98, 132 104, 115 90 Z"
                  fill="currentColor"
                  strokeWidth="1"
                />
                <path
                  d="M135 68 C 126 55, 116 52, 108 58 C 100 64, 112 76, 135 68 Z"
                  fill="currentColor"
                  strokeWidth="1"
                />
                <path
                  d="M155 48 C 168 36, 178 38, 180 48 C 182 58, 168 62, 155 48 Z"
                  fill="currentColor"
                  strokeWidth="1"
                />
              </svg>

              <div className="relative z-10">
                <div className="w-8 h-0.5 bg-[#d5c7b5] mb-3" />
                <p className="font-serif italic text-[#6e5849] text-sm sm:text-[15px] leading-snug">
                  Turning<br />Moments into<br />Custom Gifts
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              RIGHT MAIN CARD: Delivery Addresses (Matches Reference)
          ════════════════════════════════════════════════════════ */}
          <div className="bg-white border border-[#e8dfd2] rounded-3xl p-6 sm:p-9 xl:p-10 shadow-[0_4px_30px_rgba(46,30,18,0.04)]">
            {/* Header Row: Title & Subtitle on Left, Add Address on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[26px] sm:text-[32px] font-bold font-serif text-[#1f150e] leading-tight">
                  Delivery Addresses
                </h2>
                <p className="text-xs sm:text-[13.5px] text-[#736355] font-sans mt-1">
                  Save your addresses for a faster and smoother checkout experience.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#452715] hover:bg-[#341d0f] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Address</span>
              </button>
            </div>

            {/* Subtle Divider Line */}
            <div className="h-px bg-[#f0e8dc] mt-5 mb-8" />

            {/* Address Content Area */}
            {loadingAddresses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AddressCardSkeleton />
                <AddressCardSkeleton />
              </div>
            ) : addresses.length === 0 ? (
              /* Empty State (Matches screenshot: Open package box with floating location pin) */
              <div className="py-12 sm:py-16 text-center flex flex-col items-center justify-center">
                {/* 3D Isometric Cardboard Box with Floating Location Pin */}
                <div className="w-36 h-32 relative flex items-center justify-center mb-3">
                  <svg width="140" height="120" viewBox="0 0 140 120" fill="none" className="overflow-visible">
                    <defs>
                      <filter id="softBoxShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#452715" floodOpacity="0.08" />
                      </filter>
                    </defs>

                    {/* Floor ground soft shadow */}
                    <ellipse cx="70" cy="98" rx="46" ry="8" fill="#ebdccf" opacity="0.8" />

                    {/* Floating location marker pin with radiating rays */}
                    <g transform="translate(0, -4)">
                      {/* Radiating sparkle rays */}
                      <line x1="50" y1="20" x2="43" y2="16" stroke="#c4ad97" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="90" y1="20" x2="97" y2="16" stroke="#c4ad97" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="70" y1="6" x2="70" y2="1" stroke="#c4ad97" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="44" cy="27" r="1" fill="#c4ad97" />
                      <circle cx="96" cy="27" r="1" fill="#c4ad97" />

                      {/* Pin Circle Container */}
                      <circle
                        cx="70"
                        cy="24"
                        r="14"
                        fill="#f7f1e9"
                        stroke="#e2d2c1"
                        strokeWidth="1.5"
                        filter="url(#softBoxShadow)"
                      />

                      {/* Deep brown Map Pin Icon */}
                      <path
                        d="M70 14 C65.5 14, 62 17.5, 62 22 C62 26.8, 70 34, 70 34 C70 34, 78 26.8, 78 22 C78 17.5, 74.5 14, 70 14 Z"
                        fill="#452715"
                      />
                      {/* Inner dot of pin */}
                      <circle cx="70" cy="21.5" r="2.2" fill="#faf7f2" />
                    </g>

                    {/* Box Interior cavity */}
                    <polygon points="38,56 70,70 102,56 70,44" fill="#c4ad98" />

                    {/* Box Back Flaps (Open Upward) */}
                    <polygon points="38,56 70,44 65,34 26,44" fill="#ebdccf" stroke="#caa88f" strokeWidth="0.8" />
                    <polygon points="70,44 102,56 114,44 75,34" fill="#e0cebf" stroke="#caa88f" strokeWidth="0.8" />

                    {/* Box Front Faces */}
                    {/* Left front face */}
                    <polygon points="38,56 70,70 70,96 38,82" fill="#dfcfbe" stroke="#baa088" strokeWidth="0.8" />
                    {/* Right front face */}
                    <polygon points="70,70 102,56 102,82 70,96" fill="#cfbba8" stroke="#baa088" strokeWidth="0.8" />

                    {/* Box Front Flaps (Folded Downward) */}
                    {/* Left front flap hanging down-left */}
                    <polygon points="38,56 70,70 63,80 28,64" fill="#ecdcd0" stroke="#caa88f" strokeWidth="0.8" />
                    {/* Right front flap hanging down-right */}
                    <polygon points="70,70 102,56 112,64 77,80" fill="#dfcebf" stroke="#caa88f" strokeWidth="0.8" />

                    {/* Subtle center crease highlight */}
                    <line x1="70" y1="70" x2="70" y2="96" stroke="#baa088" strokeWidth="1" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-[#1f150e] font-serif mt-2 mb-2">
                  No saved addresses yet
                </h3>
                <p className="text-xs sm:text-sm text-[#736355] font-sans max-w-sm mx-auto leading-relaxed mb-6">
                  Add your delivery address to make checkout quicker and receive your handcrafted lithophanes without delay.
                </p>

                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#452715] hover:bg-[#341d0f] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add Address</span>
                </button>
              </div>
            ) : (
              /* When addresses exist: clean 2-column cards grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 rounded-2xl border border-[#e8dfd2] bg-[#faf7f2] hover:bg-white hover:border-[#dfd2c0] transition-all shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top row: Label + Default badge */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-[#5a3a1a] bg-white border border-[#e2d5c6] px-2.5 py-0.5 rounded-lg shadow-2xs">
                          {addr.label || "Home"}
                        </span>

                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-[#1e7234] bg-[#eaf5ec] border border-[#c6e6ca] px-2 py-0.5 rounded-md">
                            Default Delivery
                          </span>
                        )}
                      </div>

                      {/* Recipient & Phone */}
                      {addr.recipientName && (
                        <h4 className="text-[15px] font-bold text-[#2e1e12] font-sans">
                          {addr.recipientName}
                        </h4>
                      )}
                      {addr.phone && (
                        <p className="text-xs text-[#8c786a] font-sans mt-0.5">
                          +91 {addr.phone}
                          {addr.alternatePhone ? ` · Alt: +91 ${addr.alternatePhone}` : ""}
                        </p>
                      )}

                      {/* Address lines */}
                      <p className="text-xs font-medium text-[#4a3a2e] leading-relaxed mt-2.5">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ""}
                        {addr.landmark ? ` (Near ${addr.landmark})` : ""}
                      </p>
                      <p className="text-xs text-[#6e5c50] mt-0.5 font-medium">
                        {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                      </p>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="pt-3.5 mt-4 border-t border-[#ede3d4] flex items-center justify-between text-xs">
                      {/* Edit Action */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditAddress(addr)}
                        className="inline-flex items-center gap-1.5 font-semibold text-[#c96a1f] hover:text-[#9e4c10] transition-colors cursor-pointer py-1"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        <span>Edit Address</span>
                      </button>

                      {/* Delete with inline confirmation */}
                      {confirmDeleteId === addr.id ? (
                        <div className="flex items-center gap-2 text-xs font-sans">
                          <span className="text-[#6e5c50]">Delete?</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-[#dc2626] font-bold hover:underline"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[#6e5c50] font-medium hover:underline"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(addr.id)}
                          className="text-[#8c786a] hover:text-[#dc2626] transition-colors p-1 cursor-pointer flex items-center gap-1"
                          title="Delete address"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span className="text-[11px]">Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ── Real Delivery Address Bottom Sheet / Modal ─────────── */}
      <AddressBottomSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        editingAddress={editingAddress}
        onSave={handleSaveAddress}
        defaultRecipientName={user.name || ""}
        defaultPhone={user.phone || ""}
      />

      {/* ── Edit Profile Modal ────────────────────────────────── */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#e5ddd0] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#f3ede3] mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#2e1e12] font-serif">Edit Profile</h3>
                <p className="text-[11px] text-[#8c786a]">Update your personal details and preferences</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="w-8 h-8 rounded-full bg-[#faf7f2] text-[#8c786a] hover:text-[#2e1e12] hover:bg-[#ede4d6] flex items-center justify-center p-1 cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Upload Preview */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#faf7f2] border border-[#ede3d4]">
                <div className="relative">
                  {profileAvatarUrl ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#dfd2c0] shadow-xs">
                      <Image
                        src={profileAvatarUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#ede1d1] border-2 border-[#dfd2c0] text-[#a55214] flex items-center justify-center text-lg font-bold font-serif shadow-xs tracking-wider">
                      {initials}
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#2e1e12] mb-0.5">Profile Photo</div>
                  <div className="text-[10px] text-[#8c786a] mb-2">JPG, PNG or WebP up to 5MB</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-[#dfd2c0] hover:border-[#c96a1f] text-[#2e1e12] rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      {profileAvatarUrl ? "Change Photo" : "Upload Photo"}
                    </button>
                    {profileAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setProfileAvatarUrl(null)}
                        className="px-2 py-1 text-[11px] font-medium text-[#dc2626] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                  Full Name <span className="text-[#dc2626]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a89989]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-medium text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a89989]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5ddd0] bg-[#faf7f2] text-xs font-medium text-[#2e1e12] outline-none focus:border-[#e07a28] focus:bg-white transition-colors"
                  />
                </div>
                <p className="text-[10px] text-[#8c786a] mt-1">Used for order receipts, tracking notifications, and account recovery</p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-bold text-[#2e1e12] uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative flex rounded-xl border border-[#e5ddd0] bg-[#faf7f2] focus-within:border-[#e07a28] focus-within:bg-white transition-colors overflow-hidden">
                  <div className="flex items-center gap-1 px-3 bg-[#f2ebdc] border-r border-[#e5ddd0] text-xs font-semibold text-[#6e5c50] select-none shrink-0">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    className="flex-1 px-3 py-2 bg-transparent text-xs font-medium text-[#2e1e12] outline-none"
                  />
                </div>
              </div>

              {/* Password & Security Quick Link */}
              <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ede3d4] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#2e1e12]">Account Security</div>
                  <div className="text-[10px] text-[#8c786a]">Need to reset or change your password?</div>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#c96a1f] hover:text-[#9e4c10] transition-colors"
                >
                  Reset Password →
                </Link>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-[#f3ede3]">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="w-1/2 py-2.5 bg-[#faf7f2] hover:bg-[#f2ebdc] text-[#2e1e12] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile || uploadingAvatar}
                  className="w-1/2 py-2.5 bg-[#e07a28] hover:bg-[#c96a1f] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {savingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
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
