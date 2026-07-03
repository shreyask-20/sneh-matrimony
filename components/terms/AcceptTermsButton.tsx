"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AcceptTermsButton() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user;
  const needsToAccept = user && user.termsAccepted === false;

  if (!needsToAccept) return null;

  const handleAccept = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/accept-terms", { method: "POST" });
      if (!res.ok) {
        throw new Error("Failed to accept terms. Please try again.");
      }

      // Update the session to reflect the new termsAccepted status
      await update();

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-brand-100 bg-brand-50/50 p-6 text-center dark:border-brand-500/20 dark:bg-white/5">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Please accept the Terms &amp; Conditions to continue using Sneh
        Matrimony.
      </p>
      {error && (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      )}
      <button
        onClick={handleAccept}
        disabled={loading}
        className="mt-4 rounded-2xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? "Accepting..." : "I Accept"}
      </button>
    </div>
  );
}
