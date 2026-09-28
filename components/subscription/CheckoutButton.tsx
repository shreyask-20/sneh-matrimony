"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import Button from "../shared/Button";
import type { PlanKey } from "@/lib/subscriptions";

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
    step?: string;
    source?: string;
    field?: string;
  };
};

function mapRazorpayFailureToMessage(response?: RazorpayFailureResponse): string {
  const err = response?.error;
  const reason = (err?.reason ?? "").toLowerCase();
  const code = (err?.code ?? "").toUpperCase();
  const step = (err?.step ?? "").toLowerCase();
  const description = err?.description?.trim();

  if (reason.includes("timed_out") || reason.includes("timeout")) {
    return "UPI approval timed out (no approval within ~10 mins). No money was debited. Please tap Retry and approve the Collect request in your UPI app within 5 minutes.";
  }
  if (reason.includes("cancelled") || reason.includes("user_cancelled") || reason.includes("modal_closed")) {
    return "Payment was cancelled before completion. Please tap Retry to start a fresh payment.";
  }
  if (code.includes("INSUFFICIENT") || reason.includes("insufficient")) {
    return "Payment failed: insufficient balance or UPI limit exceeded. Please try a different UPI ID or card.";
  }
  if (step.includes("authentication") || step.includes("authorization")) {
    return description
      ? `Payment authentication failed: ${description} Please retry and approve promptly in your UPI app.`
      : "Payment authentication failed before approval. Please retry and approve promptly in your UPI app.";
  }
  if (description) {
    return `Payment failed: ${description} Please retry.`;
  }
  return "Payment failed before completion. Please retry with a fresh payment.";
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  timeout?: number;
  retry?: { enabled: boolean; max_count: number };
  remember_customer?: boolean;
  send_sms_hash?: boolean;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void; escape?: boolean; confirm_close?: boolean };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, cb: (response?: RazorpayFailureResponse) => void) => void;
    };
  }
}

type CheckoutButtonProps = {
  plan: PlanKey;
  planName: string;
  className?: string;
  scriptReady: boolean;
  locked?: boolean;
  label?: string;
  infoMessage?: { title: string; message: string } | null;
  onInfoClick?: (() => void) | null;
};

export default function CheckoutButton({
  plan,
  planName,
  className = "",
  scriptReady,
  locked = false,
  label,
  infoMessage,
  onInfoClick,
}: CheckoutButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async () => {
    setError(null);

    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/subscribe?plan=${plan}`)}`);
      return;
    }

    if (!scriptReady || !window.Razorpay) {
      setError("Payment gateway is still loading. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const orderData = (await orderRes.json()) as {
        error?: string;
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        prefill?: RazorpayOptions["prefill"];
      };

      if (!orderRes.ok || !orderData.orderId || !orderData.keyId) {
        if (orderRes.status === 401) {
          throw new Error("Your session has expired. Please sign in again.");
        }
        throw new Error(orderData.error ?? "Could not start checkout");
      }

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount!,
        currency: orderData.currency ?? "INR",
        name: "Sneh Matrimony",
        description: `${planName} — yearly membership`,
        order_id: orderData.orderId,
        // Fail fast instead of buffering indefinitely on desktop UPI Collect.
        timeout: 900,
        retry: { enabled: true, max_count: 3 },
        remember_customer: true,
        send_sms_hash: true,
        notes: { plan },
        prefill: orderData.prefill,
        theme: { color: "#7F103E" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = (await verifyRes.json()) as {
              error?: string;
              success?: boolean;
            };

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error ?? "Payment verification failed");
            }

            window.location.assign("/dashboard?subscribed=1");
          } catch (verifyError) {
            setError(
              verifyError instanceof Error
                ? verifyError.message
                : "Payment verification failed"
            );
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
          escape: true,
          confirm_close: true,
        },
      });

      rzp.on("payment.failed", (response) => {
        setError(mapRazorpayFailureToMessage(response));
        setLoading(false);
      });

      rzp.open();
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "We couldn't reach the payment service. Please try again."
      );
      setLoading(false);
    }
  }, [plan, planName, router, scriptReady, status]);

  const handleClick = useCallback(() => {
    if (infoMessage && onInfoClick) {
      onInfoClick();
      return;
    }
    void startCheckout();
  }, [infoMessage, onInfoClick, startCheckout]);

  return (
    <div className={className}>
      <Button
        type="button"
        className="w-full"
        disabled={locked || loading}
        onClick={handleClick}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </span>
        ) : (
          label ?? `Choose ${planName}`
        )}
      </Button>
      {error && (
        <div className="mt-2 text-center">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => void startCheckout()}
            className="mt-1 text-xs font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-400"
          >
            Retry payment
          </button>
        </div>
      )}
    </div>
  );
}
