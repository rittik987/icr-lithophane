"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function RegisterForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { user, isLoading, register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gsiReady, setGsiReady] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const credentialHandlerRef = useRef<((response: { credential: string }) => Promise<void>) | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoading && user) {
      window.location.replace(redirect);
    }
  }, [isLoading, user, redirect]);

  // Keep credential handler ref up to date
  const handleGoogleCredential = useCallback(async (response: { credential: string }) => {
    setGoogleLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle(response.credential);
      if (res.success) {
        showToast({ title: "Welcome!", message: "Signed in with Google", type: "success" });
        window.location.replace(redirect);
      } else {
        setError(res.error || "Google sign-in failed. Please try again.");
        setGoogleLoading(false);
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
      setGoogleLoading(false);
    }
  }, [loginWithGoogle, redirect, showToast]);

  useEffect(() => {
    credentialHandlerRef.current = handleGoogleCredential;
  }, [handleGoogleCredential]);

  // Load Google GSI script and render official button
  useEffect(() => {
    if (!googleClientId) return;

    function initAndRenderButton() {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: { credential: string }) => {
          credentialHandlerRef.current?.(response);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const containerWidth = Math.min(Math.max(googleBtnRef.current.offsetWidth || 340, 260), 380);

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "signup_with",
        width: containerWidth,
      });

      setGsiReady(true);
    }

    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript) {
      initAndRenderButton();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initAndRenderButton;
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId]);

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 10) {
      setPhone(raw);
    }
  }

  function getPasswordStrength(pass: string): { label: string; width: string; color: string } {
    if (!pass) return { label: "", width: "0%", color: "bg-transparent" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { label: "Weak", width: "25%", color: "bg-red-400" };
    if (score === 2) return { label: "Fair", width: "50%", color: "bg-amber-400" };
    if (score === 3) return { label: "Good", width: "75%", color: "bg-emerald-500" };
    return { label: "Strong", width: "100%", color: "bg-emerald-600" };
  }

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to our privacy policy to create an account");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
      const res = await register(formattedPhone, password, name.trim(), email.trim().toLowerCase());

      if (res.success) {
        showToast({
          title: "Account created",
          message: "Welcome to ICR Custom Creations",
          type: "success",
        });
        window.location.replace(redirect);
        return;
      } else {
        setError(res.error || "Registration failed. Mobile number may already be in use.");
        setLoading(false);
      }
    } catch {
      setError("Unable to connect to server. Please check your connection.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2E1E12] flex flex-col lg:flex-row">
      {/* ── Left Showcase Panel (Desktop Only) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[48%] relative bg-[#1B110B] flex-col justify-between p-10 xl:p-14 overflow-hidden select-none">
        {/* Ambient Finished Lamp Background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 opacity-80"
          style={{ backgroundImage: "url('/photos/how-step-3.png')" }}
        />
        {/* Scrim Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140D08]/95 via-[#140D08]/60 to-[#140D08]/40" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#D96B27]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="ICR Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-white tracking-tight block">
                ICR Custom Creations
              </span>
            </div>
          </Link>
        </div>

        {/* Bottom Artisanal Highlights */}
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D96B27]/20 border border-[#D96B27]/40 text-[#F5B57F] text-xs font-semibold tracking-wide mb-3 backdrop-blur-md">
            <span>Carved with Care &amp; Light</span>
          </div>

          <h2 className="font-serif text-2xl xl:text-3xl text-white font-normal leading-snug tracking-tight mb-3">
            A gift that brings happy tears before words even come out.
          </h2>

          <p className="text-xs xl:text-sm text-[#D1C2B4] leading-relaxed mb-5 font-light">
            Whether it&apos;s for an anniversary, your parents, or a quiet moment you never want to forget — we take the time to sculpt every smile and contour into warm, tangible light.
          </p>

          {/* Real Human Touch Story Card */}
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-left">
            <p className="text-xs text-[#E5DDD0] font-serif italic leading-relaxed mb-2.5">
              &ldquo;Gifted this to my parents for their anniversary. The moment the light turned on and revealed their old wedding photo, my mother couldn&apos;t hold back her tears.&rdquo;
            </p>
            <div className="flex items-center justify-between text-[11px] text-[#F5B57F] pt-2 border-t border-white/10 font-sans">
              <span className="font-medium text-white/75">Individually carved · Hand-finished wooden frame</span>
              <span className="text-[#D96B27] font-semibold">ICR Studio</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Authentication Panel ── */}
      <div className="flex-1 flex flex-col justify-between min-h-screen lg:min-h-0 bg-[#FAF7F2] p-4 sm:p-8 lg:p-10 xl:p-14 overflow-y-auto">
        {/* Top Navigation */}
        <div className="w-full max-w-[440px] mx-auto flex items-center justify-between pb-4 sm:pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6759] hover:text-[#2E1E12] transition-colors py-1.5 px-3 rounded-full hover:bg-[#EFE9DF]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Home</span>
          </Link>

          <Link
            href={`/login${redirect && redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-xs font-bold text-[#D96B27] hover:text-[#B85315] hover:underline transition-colors"
          >
            Sign in instead
          </Link>
        </div>

        {/* Center Form Card */}
        <div className="w-full max-w-[440px] mx-auto my-auto">
          <div className="bg-white rounded-3xl border border-[#E8E0D4] p-6 sm:p-9 shadow-[0_12px_40px_-8px_rgba(46,30,18,0.06)]">
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#2E1E12] tracking-tight">
                Create an account
              </h1>
              <p className="text-xs text-[#7A6759] mt-1.5 font-sans leading-relaxed">
                Save your custom designs and track your orders
              </p>
            </div>

            {/* Google Sign-Up Button */}
            <div className="relative w-full flex justify-center" id="google-register-btn-wrapper">
              <div
                ref={googleBtnRef}
                id="google-register-btn-container"
                className="w-full flex justify-center overflow-hidden rounded-2xl"
                style={{ minHeight: 44, opacity: gsiReady ? 1 : 0, transition: "opacity 0.2s" }}
              />

              {/* Loading overlay */}
              {googleLoading && (
                <div className="absolute inset-0 flex items-center justify-center gap-2.5 rounded-2xl bg-white border border-[#E2D8C9] z-10 shadow-sm">
                  <svg className="animate-spin h-4 w-4 text-[#D96B27]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs font-semibold text-[#2E1E12]">Signing in with Google...</span>
                </div>
              )}

              {/* Skeleton while GSI loads */}
              {!gsiReady && !googleLoading && (
                <div className="absolute inset-0 flex items-center justify-center gap-3 rounded-2xl bg-white border border-[#E2D8C9] animate-pulse">
                  <div className="w-4 h-4 rounded-full bg-[#E2D8C9]" />
                  <div className="h-3 w-32 rounded bg-[#E2D8C9]" />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="w-full border-t border-[#EAE3D6]" />
              <span className="absolute bg-white px-3 text-[11px] font-medium text-[#9A8778]">
                or register with details
              </span>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#FDF3F2] border border-[#F5C7C3] flex items-center gap-2 text-xs text-[#A82525] animate-in fade-in duration-200">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label htmlFor="name-input" className="block text-[11px] font-bold text-[#6E5C50] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center rounded-2xl border border-[#E2D8C9] bg-[#FAF8F5] focus-within:border-[#D96B27] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D96B27]/15 transition-all overflow-hidden">
                  <input
                    id="name-input"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-3.5 py-2.5 text-sm font-medium text-[#2E1E12] placeholder-[#B8A798] bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email-input" className="block text-[11px] font-bold text-[#6E5C50] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center rounded-2xl border border-[#E2D8C9] bg-[#FAF8F5] focus-within:border-[#D96B27] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D96B27]/15 transition-all overflow-hidden">
                  <input
                    id="email-input"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-3.5 py-2.5 text-sm font-medium text-[#2E1E12] placeholder-[#B8A798] bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="register-phone-input" className="block text-[11px] font-bold text-[#6E5C50] uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative flex items-center rounded-2xl border border-[#E2D8C9] bg-[#FAF8F5] focus-within:border-[#D96B27] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D96B27]/15 transition-all overflow-hidden">
                  <span className="pl-3.5 pr-2.5 text-xs font-bold text-[#7A6759] border-r border-[#EAE3D6] select-none">
                    +91
                  </span>
                  <input
                    id="register-phone-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="10-digit mobile number"
                    required
                    className="w-full px-3 py-2.5 text-sm font-medium text-[#2E1E12] placeholder-[#B8A798] bg-transparent outline-none tracking-wide"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="register-password-input" className="block text-[11px] font-bold text-[#6E5C50] uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative flex items-center rounded-2xl border border-[#E2D8C9] bg-[#FAF8F5] focus-within:border-[#D96B27] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D96B27]/15 transition-all overflow-hidden">
                  <input
                    id="register-password-input"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className="w-full px-3.5 py-2.5 pr-11 text-sm font-medium text-[#2E1E12] placeholder-[#B8A798] bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-[#9A8778] hover:text-[#2E1E12] transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password strength bar */}
                {password && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#EAE3D6] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[#7A6759]">{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password-input" className="block text-[11px] font-bold text-[#6E5C50] uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative flex items-center rounded-2xl border border-[#E2D8C9] bg-[#FAF8F5] focus-within:border-[#D96B27] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D96B27]/15 transition-all overflow-hidden">
                  <input
                    id="confirm-password-input"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="w-full px-3.5 py-2.5 text-sm font-medium text-[#2E1E12] placeholder-[#B8A798] bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[#D0C6B8] text-[#D96B27] focus:ring-[#D96B27] cursor-pointer"
                  />
                  <span className="text-[11px] text-[#7A6759] leading-tight">
                    I agree to the{" "}
                    <Link href="/privacy-policy" className="text-[#D96B27] hover:underline">Privacy Policy</Link>{" "}
                    and{" "}
                    <Link href="/terms" className="text-[#D96B27] hover:underline">Terms of Service</Link>
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-[#D96B27] via-[#C85E1E] to-[#B85315] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>
            </form>

            {/* Switch to Login */}
            <div className="mt-5 text-center pt-3.5 border-t border-[#F0EAE1]">
              <p className="text-xs text-[#7A6759]">
                Already have an account?{" "}
                <Link
                  href={`/login${redirect && redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                  className="font-bold text-[#D96B27] hover:text-[#B85315] hover:underline ml-1"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Anchored Footer */}
        <div className="w-full max-w-[440px] mx-auto text-center pt-6 pb-2">
          <p className="text-[11px] text-[#9A8778]">
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <span className="mx-2">·</span>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <span className="mx-2">·</span>
            <Link href="/contact" className="hover:underline">Studio Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2]" />}>
      <RegisterForm />
    </Suspense>
  );
}
