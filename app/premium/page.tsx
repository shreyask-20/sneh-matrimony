"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import PageBackdrop from "@/components/shared/PageBackdrop";

const plans = [
  {
    key: "monthly",
    label: "1 Month",
    price: "₹199",
    messages: "100 messages per match",
    tag: null,
  },
  {
    key: "quarterly",
    label: "3 Months",
    price: "₹499",
    messages: "100 messages per match",
    tag: "Best Value",
  },
];

export default function PremiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (planKey: string) => {
    setLoading(planKey);
    setError(null);

    try {
      // 1. Create order
      const orderRes = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json() as { error?: string };
        throw new Error(data.error ?? "Failed to create order.");
      }

      const order = await orderRes.json() as {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        plan: string;
        label: string;
      };

      // 2. Load Razorpay script dynamically
      await new Promise<void>((resolve, reject) => {
        if (window.Razorpay) { resolve(); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay."));
        document.body.appendChild(script);
      });

      // 3. Open Razorpay checkout
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Sneh Matrimony",
          description: order.label,
          order_id: order.orderId,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // 4. Verify payment
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan: order.plan,
                }),
              });

              if (!verifyRes.ok) {
                const data = await verifyRes.json() as { error?: string };
                throw new Error(data.error ?? "Payment verification failed.");
              }

              resolve();
              router.push("/dashboard?premium=1");
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled.")),
          },
          theme: { color: "#9b1c4a" },
        });
        rzp.open();
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <PageBackdrop>
      <Navbar />
      <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
              Premium Membership
            </p>
            <h1 className="mt-2 font-serif text-3xl text-slate-900 dark:text-white">
              Unlock more conversations
            </h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Free members can send up to 10 messages per match. Upgrade to send up to 100.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className="glass-card relative rounded-3xl p-6"
              >
                {plan.tag && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                    {plan.tag}
                  </span>
                )}
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                  {plan.label}
                </p>
                <p className="mt-2 font-serif text-4xl text-slate-900 dark:text-white">
                  {plan.price}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>✓ {plan.messages}</li>
                  <li>✓ Priority profile visibility</li>
                  <li>✓ Premium badge on profile</li>
                </ul>
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={loading !== null}
                  className="mt-6 w-full rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {loading === plan.key ? "Processing..." : `Upgrade for ${plan.price}`}
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <p className="mt-8 text-center text-xs text-slate-400">
            Payments are securely processed by Razorpay. You can cancel anytime.
          </p>
        </div>
      </main>
    </PageBackdrop>
  );
}
