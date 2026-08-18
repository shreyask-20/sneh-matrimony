"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "./Button";
import Toast from "./Toast";

type InterestState =
  | "none"
  | "pending"
  | "incoming"
  | "accepted"
  | "declined"
  | "withdrawn";

type Props = {
  targetUserId: string;
  signedIn: boolean;
  initialState: InterestState;
  fullWidth?: boolean;
  isApproved?: boolean;
};

export default function InterestActionButton({
  targetUserId,
  signedIn,
  initialState,
  fullWidth = false,
  isApproved = true,
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<InterestState>(initialState);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const labelMap: Record<InterestState, string> = {
    none: "Send Interest",
    pending: "Interest Sent",
    incoming: "Respond in Dashboard",
    accepted: "Matched",
    declined: "Declined",
    withdrawn: "Send Again",
  };

  const handleClick = async () => {
    if (!signedIn) {
      router.push("/login");
      return;
    }

    if (state === "incoming") {
      router.push("/dashboard");
      return;
    }

    if (state === "pending" || state === "accepted" || loading) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: targetUserId }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Failed to send interest.");
      }

      const data = (await response.json()) as {
        acceptedExistingInterest?: boolean;
      };
      setState(data.acceptedExistingInterest ? "accepted" : "pending");
      router.refresh();
    } catch (error) {
      setToastMessage(
        error instanceof Error ? error.message : "Failed to send interest."
      );
    } finally {
      setLoading(false);
    }
  };

  if (signedIn && !isApproved) {
    const disabledContent = (
      <span className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400 dark:border-white/10 dark:bg-white/5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Pending approval
      </span>
    );

    if (fullWidth) {
      return (
        <>
          {toastMessage && <Toast message={toastMessage} />}
          <div className="w-full">{disabledContent}</div>
        </>
      );
    }

    return (
      <>
        {toastMessage && <Toast message={toastMessage} />}
        {disabledContent}
      </>
    );
  }

  const isDisabled = loading || state === "pending" || state === "accepted";

  // When fullWidth (used in the match CTA card), use a gradient button for "none"/"withdrawn"
  if (fullWidth && (state === "none" || state === "withdrawn")) {
    return (
      <>
        {toastMessage && <Toast message={toastMessage} />}
        <button
          type="button"
          onClick={handleClick}
          disabled={isDisabled || loading}
          className="w-full rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : labelMap[state]}
        </button>
      </>
    );
  }

  if (fullWidth && state === "incoming") {
    return (
      <>
        {toastMessage && <Toast message={toastMessage} />}
        <button
          type="button"
          onClick={handleClick}
          className="w-full rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          {labelMap[state]}
        </button>
      </>
    );
  }

  if (fullWidth) {
    return (
      <>
        {toastMessage && <Toast message={toastMessage} />}
        <div className="w-full rounded-2xl border border-slate-200 bg-white/70 px-5 py-3 text-center text-sm font-medium text-slate-500 dark:border-white/10 dark:bg-white/5">
          {labelMap[state]}
        </div>
      </>
    );
  }

  const variant =
    state === "none" || state === "withdrawn"
      ? "primary"
      : state === "incoming"
        ? "primary"
        : "ghost";

  return (
    <>
      {toastMessage && <Toast message={toastMessage} />}
      <Button
        size="sm"
        variant={variant}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {loading ? "Saving..." : labelMap[state]}
      </Button>
    </>
  );
}
