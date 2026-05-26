"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, Sparkles, ShieldCheck, Heart, Users } from "lucide-react";
import Button from "../../../components/shared/Button";
import Navbar from "../../../components/shared/Navbar";
import PageBackdrop from "../../../components/shared/PageBackdrop";

const trustPoints = [
  { icon: ShieldCheck, text: "Verified profiles only" },
  { icon: Heart, text: "Curated matches" },
  { icon: Users, text: "Trusted by families" },
];

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      // Wait for the session cookie before navigating (avoids race on Vercel).
      await getSession();
      const callbackUrl = new URLSearchParams(window.location.search).get(
        "callbackUrl"
      );
      const destination = callbackUrl?.startsWith("/")
        ? callbackUrl
        : "/dashboard?login=1";
      window.location.assign(destination);
      return;
    } catch {
      setError("Unable to sign in right now. Please try again.");
      setLoading(false);
    }
  };

  return (
    <PageBackdrop>
      <Navbar />
      <main className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center px-3 py-6 sm:px-6 sm:py-12 lg:px-8">

        <div className="w-full max-w-4xl">
          <div className="grid gap-0 overflow-hidden rounded-3xl shadow-[0_32px_64px_rgba(127,16,62,0.12)] lg:grid-cols-[1fr_1.1fr]">

            {/* Left panel — brand */}
            <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[#7F103E] via-[#9b1c4a] to-[#c2185b] p-10 lg:flex">
              {/* Decorative circles */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/5" />

              <div className="relative z-10">
                <img
                  src="/profiles/navi.png"
                  alt="Sneh Matrimony"
                  className="h-16 w-auto object-contain"
                />
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/60">
                  Sneh Matrimony
                </p>
              </div>

              <div className="relative z-10 space-y-6">
                <div>
                  <h2 className="font-serif text-3xl leading-snug text-white">
                    Find your perfect<br />life partner
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    A trusted space where meaningful connections begin and families come together.
                  </p>
                </div>

                <div className="space-y-3">
                  {trustPoints.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm text-white/80">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="relative z-10 text-xs text-white/40">
                © {new Date().getFullYear()} Sneh Matrimony. All rights reserved.
              </p>
            </div>

            {/* Right panel — form */}
            <div className="relative bg-white px-4 py-8 dark:bg-slate-900 sm:px-10 sm:py-10">
              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-r-3xl bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-lg">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                  <p className="font-serif text-xl text-slate-900 dark:text-white">Signing you in</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Just a moment…</p>
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" />
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-brand-300">
                    <Sparkles className="h-3 w-3" />
                    Preparing your dashboard
                  </div>
                </div>
              )}

              <div className="mb-8">
                {/* Mobile logo */}
                <img
                  src="/profiles/nav-logo.png"
                  alt="Sneh Matrimony"
                  className="mb-6 h-12 w-auto object-contain lg:hidden"
                />
                <h1 className="font-serif text-2xl text-slate-900 dark:text-white sm:text-3xl">
                  Welcome back
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Sign in to continue your journey.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Email or phone number
                  </label>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                    placeholder="you@example.com or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="current-password"
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

                {error && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full py-3 text-base" disabled={loading}>
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </span>
                  ) : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 flex items-center gap-2 sm:gap-3">
                <div className="h-px flex-1 bg-slate-100 dark:bg-white/10" />
                <span className="shrink-0 text-xs text-slate-400">New to Sneh Matrimony?</span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-white/10" />
              </div>

              <a
                href="/auth/register"
                className="mt-4 flex w-full items-center justify-center rounded-2xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-100/60 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
              >
                Create a profile
              </a>
            </div>
          </div>
        </div>
      </main>
    </PageBackdrop>
  );
}
