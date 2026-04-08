"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import Button from "../../../components/shared/Button";
import Navbar from "../../../components/shared/Navbar";
import PageBackdrop from "../../../components/shared/PageBackdrop";

export default function LoginPage() {
  const router = useRouter();
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

      router.replace("/dashboard?login=1");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
      setLoading(false);
    }
  };

  return (
    <PageBackdrop>
      <Navbar />
      <main className="relative flex w-full flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
        <div
          className={`glass-card relative w-full max-w-md rounded-3xl p-8 transition duration-300 ${
            loading ? "scale-[0.99] opacity-90" : ""
          }`}
        >
          {loading ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-white/70 p-8 text-center backdrop-blur-md dark:bg-slate-950/70">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-rose-500 to-fuchsia-500 text-white shadow-[0_14px_30px_rgba(176,38,88,0.35)]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-500">
                Signing you in
              </p>
              <p className="mt-2 font-serif text-2xl text-slate-900 dark:text-white">
                Just a moment
              </p>
              <p className="mt-2 max-w-xs text-sm text-slate-600 dark:text-slate-300">
                Verifying your details and opening your dashboard.
              </p>
              <div className="mt-5 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.2s]" />
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.1s]" />
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-500" />
              </div>
              <div className="mt-6 h-1.5 w-full max-w-52 overflow-hidden rounded-full bg-brand-100/80 dark:bg-white/10">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-brand-500 via-rose-500 to-fuchsia-500" />
              </div>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-100/60 bg-white/70 px-3 py-1 text-xs text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                Preparing your match dashboard
              </div>
            </div>
          ) : null}
          <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Log in to continue your matchmaking journey.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Email or phone number"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              disabled={loading}
            />
            <div className="relative">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 pr-12 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
              />
              {password.length > 0 ? (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-1 text-slate-400 transition hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              ) : null}
            </div>
            {error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in
                </span>
              ) : (
                "Log in"
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            New here?{" "}
            <a className="font-semibold text-brand-500" href="/auth/register">
              Create a profile
            </a>
          </p>
        </div>
      </main>
    </PageBackdrop>
  );
}
