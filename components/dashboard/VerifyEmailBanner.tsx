"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyEmailBanner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // best-effort — navigate regardless
    } finally {
      setLoading(false);
      router.push("/auth/verify-email");
    }
  };

  return (
    <div className="rounded-3xl border border-amber-200/70 bg-amber-50/80 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
            Email not verified
          </p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            Verify your email address to earn the Email Verified badge on your profile.
          </p>
        </div>
        <button
          onClick={handleClick}
          disabled={loading}
          className="shrink-0 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {loading ? "Sending code..." : "Verify email"}
        </button>
      </div>
    </div>
  );
}
