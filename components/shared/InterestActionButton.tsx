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
};

export default function InterestActionButton({
  targetUserId,
  signedIn,
  initialState,
}: Props) {
  const router = useRouter();
  const [state, setState] = useState<InterestState>(initialState);
  const [loading, setLoading] = useState(false);

  const labelMap: Record<InterestState, string> = {
    none: "Express Interest",
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
  const variant =
    state === "none" || state === "withdrawn"
      ? "secondary"
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
