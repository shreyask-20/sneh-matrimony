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

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, cb: () => void) => void;
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
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/subscribe?plan=${plan}`)}`);
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
        throw new Error(orderData.error ?? "Could not start checkout");
      }

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount!,
        currency: orderData.currency ?? "INR",
        name: "Sneh Matrimony",
        description: `${planName} — yearly membership`,
        order_id: orderData.orderId,
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
        },
      });

      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });

      rzp.open();
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout"
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
        <p className="mt-2 text-center text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
