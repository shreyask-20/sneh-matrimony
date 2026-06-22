"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import Button from "../../../components/shared/Button";
import Navbar from "../../../components/shared/Navbar";
import PageBackdrop from "../../../components/shared/PageBackdrop";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password. Please try again.");
        setLoading(false);
        return;
      }

      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <PageBackdrop>
        <Navbar />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-3 py-6">
          <div className="rounded-3xl bg-white p-8 text-center shadow dark:bg-slate-900">
            <p className="text-sm text-slate-500">Invalid reset link. Please request a new code.</p>
            <a href="/auth/forgot-password" className="mt-4 inline-block text-sm text-brand-600 underline">
              Request a new code
            </a>
          </div>
        </main>
      </PageBackdrop>
    );
  }

  if (done) {
    return (
      <PageBackdrop>
        <Navbar />
        <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-3 py-6">
          <div className="w-full max-w-md">
            <div className="glass-card rounded-3xl p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="font-serif text-2xl text-slate-900 dark:text-white">
                Password reset
              </h1>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Your password has been updated successfully. Sign in with your new password.
              </p>
              <a
                href="/auth/login"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </a>
            </div>
          </div>
        </main>
      </PageBackdrop>
    );
  }

  return (
    <PageBackdrop>
      <Navbar />
      <main className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center px-3 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white p-8 shadow-[0_32px_64px_rgba(127,16,62,0.12)] dark:bg-slate-900">
            <a
              href="/auth/forgot-password"
              className="mb-6 inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-brand-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </a>

            <h1 className="font-serif text-2xl text-slate-900 dark:text-white">
              Reset your password
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter the 5-digit code sent to{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>{" "}
              and choose a new password.
            </p>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Reset code
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                  placeholder="Enter 5-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  New password
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                    placeholder="At least 8 characters"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                    required
                  />
                  {password.length > 0 && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:text-brand-600"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Confirm password
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                  placeholder="Re-enter password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full py-3 text-base" disabled={loading || !otp || !password || !confirmPassword}>
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resetting…
                  </span>
                ) : "Reset password"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Didn&apos;t receive a code?{" "}
              <a href="/auth/forgot-password" className="text-brand-600 hover:underline">
                Request again
              </a>
            </p>
          </div>
        </div>
      </main>
    </PageBackdrop>
  );
}
