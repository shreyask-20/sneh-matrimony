"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "./Button";

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
};

export default function InterestActionButton({
  targetUserId,
  signedIn,
  initialState,
  fullWidth = false,
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<InterestState>(initialState);
  const [loading, setLoading] = useState(false);

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
      router.push("/auth/login");
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
      window.alert(
        error instanceof Error ? error.message : "Failed to send interest."
      );
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || state === "pending" || state === "accepted";

  // When fullWidth (used in the match CTA card), use a gradient button for "none"/"withdrawn"
  if (fullWidth && (state === "none" || state === "withdrawn")) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled || loading}
        className="w-full rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? "Sending..." : labelMap[state]}
      </button>
    );
  }

  if (fullWidth && state === "incoming") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="w-full rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        {labelMap[state]}
      </button>
    );
  }

  if (fullWidth) {
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white/70 px-5 py-3 text-center text-sm font-medium text-slate-500 dark:border-white/10 dark:bg-white/5">
        {labelMap[state]}
      </div>
    );
  }

  const variant =
    state === "none" || state === "withdrawn"
      ? "primary"
      : state === "incoming"
        ? "primary"
        : "ghost";

  return (
    <Button
      size="sm"
      variant={variant}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {loading ? "Saving..." : labelMap[state]}
    </Button>
  );
}
