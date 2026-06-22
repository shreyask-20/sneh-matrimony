"use client";

import { useState } from "react";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import InfoPageLayout from "@/components/info/InfoPageLayout";
import Button from "@/components/shared/Button";

const REASONS = [
  "Changed mind",
  "Found a match",
  "Technical issue",
  "Not satisfied with service",
  "Other",
];

export default function RefundRequestPage() {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/refund-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit request. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <InfoPageLayout
        title="Refund request submitted"
        subtitle="We have received your request and will review it shortly."
      >
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
            <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="font-serif text-xl text-slate-900 dark:text-white">
            Thank you, your request is in
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Our team will review your refund request and get back to you within{" "}
            <strong>2–3 business days</strong> at the email address associated with your account.
          </p>
          <a
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </a>
        </div>
      </InfoPageLayout>
    );
  }

  return (
    <InfoPageLayout
      title="Request a refund"
      subtitle="If you have changed your mind or face any issues, submit your request below and we will get back to you."
    >
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Reason for refund
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select a reason</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Additional details <span className="normal-case tracking-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
              placeholder="Tell us more about your situation…"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-3 text-base" disabled={loading || !reason}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </span>
            ) : (
              "Submit refund request"
            )}
          </Button>
        </form>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs leading-relaxed text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
          <p>
            Refund requests are reviewed manually. Processing typically takes 2–3 business days.
            You will receive an update at your registered email address.
          </p>
        </div>
      </div>
    </InfoPageLayout>
  );
}
