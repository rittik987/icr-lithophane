"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

function ForgotPasswordForm() {
  const router = useRouter();

  type Step = "email" | "otp" | "password" | "done";
  const [step, setStep] = useState<Step>("email");

  // Step 1
  const [email, setEmail] = useState("");

  // Step 2
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resetToken, setResetToken] = useState("");

  // Step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step !== "otp") return;
    setResendCountdown(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotSendOtp(cleanEmail);
      setStep("otp");
    } catch {
      setError("Unable to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpInput(value: string, idx: number) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft" && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("") as string[];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    const lastIdx = Math.min(pasted.length - 1, 5);
    otpRefs.current[lastIdx]?.focus();
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter all 6 digits."); return; }
    setLoading(true);
    try {
      const res = await authApi.forgotVerifyOtp(email.trim().toLowerCase(), code);
      if (res.success && res.data?.resetToken) {
        setResetToken(res.data.resetToken);
        setStep("password");
      } else {
        setError(res.error || "Invalid code. Please check and try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!canResend) return;
    setError(null);
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      await authApi.forgotSendOtp(email.trim().toLowerCase());
      setResendCountdown(60);
      setCanResend(false);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  }

  function getPasswordStrength(pass: string): { label: string; width: string; color: string } {
    if (!pass) return { label: "", width: "0%", color: "bg-transparent" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { label: "Too weak", width: "25%", color: "bg-red-400" };
    if (score === 2) return { label: "Fair", width: "50%", color: "bg-amber-400" };
    if (score === 3) return { label: "Good", width: "75%", color: "bg-emerald-500" };
    return { label: "Strong", width: "100%", color: "bg-emerald-600" };
  }

  const strength = getPasswordStrength(newPassword);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) { setError("Password must be at least 8 characters long."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await authApi.forgotResetPassword(email.trim().toLowerCase(), resetToken, newPassword);
      if (res.success) {
        setStep("done");
      } else {
        setError(res.error || "Failed to reset password. Please start over.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const Spinner = () => (
    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  const submitCls = "w-full py-3.5 px-5 bg-gradient-to-b from-[#E07A28] to-[#C85E1E] hover:from-[#D26F1E] hover:to-[#B85315] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2";
  const inputCls = "w-full px-3.5 py-3 text-sm font-medium text-[#2E1E12] placeholder-[#B8A798] bg-transparent outline-none tracking-wide";
  const inputWrapCls = "relative flex items-center rounded-2xl border border-[#E2D8C9] bg-[#FAF8F5] focus-within:border-[#D96B27] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D96B27]/10 transition-all overflow-hidden";
  const labelCls = "block text-[11px] font-bold text-[#6E5C50] uppercase tracking-wider mb-1.5";

  const stepLabels = ["Email", "Verify", "Password"];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2E1E12] flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#E5DDD0]">
        <div className="max-w-md mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-1.5 text-xs font-bold text-[#6E5C50] hover:text-[#2E1E12] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Back to Login</span>
          </Link>
          <h1 className="font-serif font-bold text-base text-[#2E1E12] tracking-tight">Reset Password</h1>
          <div className="w-20" aria-hidden="true" />
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-4 sm:px-6 pt-20 pb-8 w-full max-w-[420px] mx-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#E8E0D4] p-7 sm:p-9 shadow-[0_10px_35px_-5px_rgba(46,30,18,0.06)]">

          {/* Step indicator */}
          {step !== "done" && (
            <div className="flex items-center mb-7">
              {stepLabels.map((label, idx) => {
                const stepOrder = ["email", "otp", "password"] as Step[];
                const currentIdx = stepOrder.indexOf(step);
                const isCompleted = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isCompleted ? "bg-emerald-500 text-white"
                        : isCurrent ? "bg-[#E07A28] text-white ring-4 ring-[#E07A28]/20"
                        : "bg-[#EFE9E0] text-[#9A8778]"
                      }`}>
                        {isCompleted ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (idx + 1)}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${isCurrent ? "text-[#E07A28]" : "text-[#9A8778]"}`}>{label}</span>
                    </div>
                    {idx < 2 && (
                      <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all ${isCompleted ? "bg-emerald-400" : "bg-[#EFE9E0]"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#FDF3F2] border border-[#F5C7C3] flex items-center gap-2 text-xs text-[#A82525]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1 — Email */}
          {step === "email" && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF2E9] border border-[#F5DFC6] flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E07A28" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h2 className="font-serif text-xl font-normal text-[#2E1E12] tracking-tight">Forgot your password?</h2>
                <p className="text-xs text-[#7A6759] mt-1.5">Enter the email linked to your account and we&apos;ll send a 6-digit code.</p>
              </div>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="fp-email" className={labelCls}>Email Address</label>
                  <div className={inputWrapCls}>
                    <input id="fp-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus className={inputCls} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className={submitCls}>
                  {loading ? <><Spinner /><span>Sending...</span></> : <span>Send Verification Code</span>}
                </button>
              </form>
            </>
          )}

          {/* STEP 2 — OTP */}
          {step === "otp" && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF2E9] border border-[#F5DFC6] flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E07A28" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <h2 className="font-serif text-xl font-normal text-[#2E1E12] tracking-tight">Check your email</h2>
                <p className="text-xs text-[#7A6759] mt-1.5">We sent a 6-digit code to <span className="font-semibold text-[#2E1E12]">{email}</span></p>
              </div>
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input key={idx} ref={(el) => { otpRefs.current[idx] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpInput(e.target.value, idx)} onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className={`w-11 text-center text-lg font-bold rounded-xl border-2 bg-[#FAF8F5] outline-none transition-all ${digit ? "border-[#E07A28] bg-white" : "border-[#E2D8C9]"} focus:border-[#D96B27] focus:bg-white focus:ring-2 focus:ring-[#D96B27]/10`}
                      style={{ height: "52px" }} autoFocus={idx === 0}
                    />
                  ))}
                </div>
                <button type="submit" disabled={loading || otp.join("").length < 6} className={submitCls}>
                  {loading ? <><Spinner /><span>Verifying...</span></> : <span>Verify Code</span>}
                </button>
                <p className="text-center text-xs text-[#7A6759]">
                  Didn&apos;t receive it?{" "}
                  {canResend
                    ? <button type="button" onClick={handleResendOtp} disabled={loading} className="font-bold text-[#D96B27] hover:underline cursor-pointer">Resend code</button>
                    : <span className="text-[#9A8778]">Resend in {resendCountdown}s</span>
                  }
                </p>
                <button type="button" onClick={() => { setStep("email"); setOtp(["","","","","",""]); setError(null); }} className="w-full text-xs text-[#9A8778] hover:text-[#6E5C50] text-center cursor-pointer transition-colors">
                  ? Use a different email
                </button>
              </form>
            </>
          )}

          {/* STEP 3 — New Password */}
          {step === "password" && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF2E9] border border-[#F5DFC6] flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E07A28" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h2 className="font-serif text-xl font-normal text-[#2E1E12] tracking-tight">Set new password</h2>
                <p className="text-xs text-[#7A6759] mt-1.5">Choose a strong password for your account.</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="fp-new-pw" className={labelCls}>New Password</label>
                  <div className={`${inputWrapCls} pr-0`}>
                    <input id="fp-new-pw" type={showNewPassword ? "text" : "password"} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" required autoFocus className="w-full px-3.5 py-3 pr-11 text-sm font-medium text-[#2E1E12] placeholder-[#B8A798] bg-transparent outline-none" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3.5 text-[#9A8778] hover:text-[#2E1E12] transition-colors p-1" aria-label="Toggle password">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        {showNewPassword ? (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>) : (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>)}
                      </svg>
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="mt-2 px-1">
                      <div className="flex justify-between text-[10px] text-[#9A8778] mb-1"><span>Strength</span><span className="font-medium text-[#2E1E12]">{strength.label}</span></div>
                      <div className="w-full h-1 bg-[#EFE9E0] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="fp-confirm-pw" className={labelCls}>Confirm Password</label>
                  <div className={inputWrapCls}>
                    <input id="fp-confirm-pw" type={showNewPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" required className={inputCls} />
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="mt-1 text-[10px] text-red-500 px-1">Passwords do not match</p>
                  )}
                </div>
                <button type="submit" disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword} className={submitCls}>
                  {loading ? <><Spinner /><span>Updating...</span></> : <span>Update Password</span>}
                </button>
              </form>
            </>
          )}

          {/* DONE */}
          {step === "done" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="font-serif text-xl font-normal text-[#2E1E12] tracking-tight">Password updated!</h2>
              <p className="text-xs text-[#7A6759] mt-2 leading-relaxed">Your password has been reset successfully.<br />You can now sign in with your new password.</p>
              <button type="button" onClick={() => router.push("/login")} className={`mt-6 ${submitCls}`}>Sign In Now</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2]" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
