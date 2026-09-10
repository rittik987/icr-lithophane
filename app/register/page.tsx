"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { user, isLoading, register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth guard: if already logged in, navigate away immediately (no coming back to register)
  useEffect(() => {
    if (!isLoading && user) {
      window.location.replace(redirect);
    }
  }, [isLoading, user, redirect]);

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

    if (score <= 1) return { label: "Too weak", width: "25%", color: "bg-red-400" };
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
      const res = await register(formattedPhone, password, name.trim());

      if (res.success) {
        showToast({
          title: "Account created",
          message: "Welcome to ICR Custom Creations",
          type: "success",
        });
        // Keep loading true so button displays spinner while navigating to root /
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

  function handleGoogleSignup() {
    showToast({
      title: "Google Authentication",
      message: "Configure GOOGLE_CLIENT_ID in backend .env to enable instant Google Sign-Up",
      type: "info",
    });
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2E1E12] flex flex-col">
      {/* Top Header with left < Home and centered Register */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#E5DDD0]">
        <div className="max-w-md mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#6E5C50] hover:text-[#2E1E12] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Home</span>
          </Link>

          <h1 className="font-serif font-bold text-base text-[#2E1E12] tracking-tight">
            Register
          </h1>

          <div className="w-12" aria-hidden="true" />
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-6 pt-20 pb-8 w-full max-w-[420px] mx-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#E8E0D4] p-7 sm:p-9 shadow-[0_10px_35px_-5px_rgba(46,30,18,0.06)]">
          {/* Card Title */}
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl font-normal text-[#2E1E12] tracking-tight">
              Create an account
            </h2>
            <p className="text-xs text-[#7A6759] mt-1 font-sans">
              Save your photo designs & track artisan crafting
            </p>
          </div>

          {/* Social Sign-in Button: Google */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-[#FAF7F2] border border-[#E2D8C9] hover:border-[#D5C7B3] text-xs font-semibold text-[#2E1E12] transition-all shadow-2xs cursor-pointer active:scale-[0.99]"
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>Sign up with Google</span>
          </button>

          {/* Minimalist Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="w-full border-t border-[#EAE3D6]" />
            <span className="absolute bg-white px-3 text-[11px] font-medium text-[#9A8778]">
              or phone number
            </span>
          </div>

          {/* Inline Error Alert */}
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
              <label htmlFor="reg-name" className="block text-[11px] font-bold text-[#6E5C50] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center rounded-2xl border border-[#E2D8C9] bg-[#FAF8F5] focus-within:border-[#D96B27] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D96B27]/10 transition-all overflow-hidden">
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aryan Sharma"
                  required
                  className="w-full px-3.5 py-3 text-sm font-medium text-[#2E1E12] placeholder-[#B8A798] bg-transparent outline-none tracking-wide"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="block text-[11px] font-bold text-[#6E5C50] uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative flex items-center rounded-2xl border border-[#E2D8C9] bg-[#FAF8F5] focus-within:border-[#D96B27] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D96B27]/10 transition-all overflow-hidden">
                <span className="pl-3.5 pr-2.5 text-xs font-bold text-[#7A6759] border-r border-[#EAE3D6] select-none">
                  +91
                </span>
                <input
                  id="reg-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="98765 43210"
                  required
                  className="w-full px-3 py-3 text-sm font-medium text-[#2E1E12] placeholder-[#B8A798] bg-transparent outline-none tracking-wide"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-[11px] font-bold text-[#6E5C50] uppercase tracking-wider mb-1.5">
                Create Password
              </label>
              <div className="relative flex items-center rounded-2xl border border-[#E2D8C9] bg-[#FAF8F5] focus-within:border-[#D96B27] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D96B27]/10 transition-all overflow-hidden">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full px-3.5 py-3 pr-11 text-sm font-medium text-[#2E1E12] placeholder-[#B8A798] bg-transparent outline-none"
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

              {/* Minimalist strength indicator */}
              {password.length > 0 && (
                <div className="mt-2 px-1">
                  <div className="flex items-center justify-between text-[10px] text-[#9A8778] mb-1">
                    <span>Password strength</span>
                    <span className="font-medium text-[#2E1E12]">{strength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-[#EFE9E0] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-[11px] font-bold text-[#6E5C50] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative flex items-center rounded-2xl border border-[#E2D8C9] bg-[#FAF8F5] focus-within:border-[#D96B27] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D96B27]/10 transition-all overflow-hidden">
                <input
                  id="reg-confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full px-3.5 py-3 text-sm font-medium text-[#2E1E12] placeholder-[#B8A798] bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Agreement */}
            <div className="pt-1 px-0.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 rounded text-[#D96B27] accent-[#D96B27] border-[#E2D8C9]"
                />
                <span className="text-[11px] text-[#7A6759] leading-snug">
                  I agree to ICR Custom Creations’{" "}
                  <Link href="/privacy-policy" className="text-[#D96B27] hover:underline">
                    Photo Privacy Policy
                  </Link>.
                </span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 bg-gradient-to-b from-[#E07A28] to-[#C85E1E] hover:from-[#D26F1E] hover:to-[#B85315] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
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

          {/* Understated Link */}
          <div className="mt-6 text-center pt-4 border-t border-[#F0EAE1]">
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
      </main>

      {/* Footer */}
      <footer className="w-full max-w-sm mx-auto text-center pb-6">
        <p className="text-[11px] text-[#9A8778]">
          <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <span className="mx-1.5">·</span>
          <Link href="/contact" className="hover:underline">Studio Support</Link>
        </p>
      </footer>
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
