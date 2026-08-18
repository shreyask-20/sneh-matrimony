"use client";

import { useState } from "react";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Button from "../../components/shared/Button";
import Navbar from "../../components/shared/Navbar";
import PageBackdrop from "../../components/shared/PageBackdrop";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Unable to process request. Please try again.");
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <PageBackdrop>
        <Navbar />
        <main className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center px-3 py-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="glass-card rounded-3xl p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
                <Mail className="h-7 w-7 text-brand-600 dark:text-brand-300" />
              </div>
              <h1 className="font-serif text-2xl text-slate-900 dark:text-white">
                Check your email
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                If an account exists for{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>,
                we've sent a 5-digit code to reset your password. It expires in 15 minutes.
              </p>
              <a
                href={`/reset-password?email=${encodeURIComponent(email)}`}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Enter code
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </a>
              <button
                type="button"
                onClick={() => { setSent(false); setLoading(false); }}
                className="mt-4 block w-full text-center text-xs text-slate-400 underline transition hover:text-brand-600"
              >
                Use a different email
              </button>
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
              href="/login"
              className="mb-6 inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-brand-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </a>

            <h1 className="font-serif text-2xl text-slate-900 dark:text-white">
              Forgot password?
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter your email and we'll send you a code to reset your password.
            </p>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Email address
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full py-3 text-base" disabled={loading || !email}>
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending code…
                  </span>
                ) : "Send reset code"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </PageBackdrop>
  );
}
