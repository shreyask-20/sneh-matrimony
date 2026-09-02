"use client";

import Script from "next/script";
import { Check, Crown, Loader2, Sparkles, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { getPlanPricing, PLAN_KEYS, type PlanKey } from "@/lib/subscriptions";

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
  prefill?: { name?: string; email?: string; contact?: string };
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

type SubscriptionOverlayProps = {
  userName?: string;
};

const allFeatures = [
  { label: "Profiles allowed to view", tiers: ["SILVER", "GOLD", "PLATINUM"] },
  { label: "Who viewed your profile", tiers: ["SILVER", "PLATINUM"] },
  { label: "Express Interest", tiers: ["SILVER", "GOLD", "PLATINUM"] },
  { label: "Messages allowed per profile", tiers: ["SILVER", "GOLD", "PLATINUM"] },
  { label: "Featured profile", tiers: ["PLATINUM"] },
];

export default function SubscriptionOverlay({ userName }: SubscriptionOverlayProps) {
  const { status } = useSession();
  const router = useRouter();
  const [scriptReady, setScriptReady] = useState(false);
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plans = PLAN_KEYS.map((key) => getPlanPricing(key));

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const startCheckout = useCallback(
    async (plan: PlanKey, planName: string) => {
      setError(null);
      setLoading(plan);

      if (status !== "authenticated") {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (!scriptReady || !window.Razorpay) {
        setError("Payment gateway is still loading. Please try again.");
        setLoading(null);
        return;
      }

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

              window.location.reload();
            } catch (verifyError) {
              setError(
                verifyError instanceof Error
                  ? verifyError.message
                  : "Payment verification failed"
              );
              setLoading(null);
            }
          },
          modal: {
            ondismiss: () => setLoading(null),
          },
        });

        rzp.on("payment.failed", () => {
          setError("Payment failed. Please try again.");
          setLoading(null);
        });

        rzp.open();
      } catch (checkoutError) {
        setError(
          checkoutError instanceof Error
            ? checkoutError.message
            : "We couldn't reach the payment service. Please try again."
        );
        setLoading(null);
      }
    },
    [scriptReady, status, router]
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />
      <div className="fixed inset-x-0 top-16 bottom-0 z-[40] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="mx-4 max-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
          <div className="p-5 sm:p-6">
            {/* Lock icon + heading */}
            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/10">
                <Lock className="h-5 w-5 text-brand-500" />
              </div>
              <h2 className="font-serif text-xl text-slate-900 dark:text-white sm:text-2xl">
                {userName ? `${userName}, subscribe` : "Subscribe"} to unlock profiles
              </h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Get access to browse, chat, and view detailed profiles.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-center text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Plan cards */}
            <div className="grid gap-3 lg:grid-cols-3">
              {plans.map((plan, i) => {
                const isFeatured = i === 1;
                const isPremiumPlan = i === 2;
                const isLoading = loading === plan.key;

                return (
                  <div
                    key={plan.key}
                    className={`relative flex flex-col rounded-2xl border-2 transition-all ${
                      isFeatured
                        ? "z-10 scale-[1.02] border-brand-400 bg-white shadow-[0_16px_48px_-12px_rgba(160,20,77,0.2)] dark:bg-slate-800"
                        : isPremiumPlan
                          ? "border-amber-300 bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/20 dark:to-slate-800"
                          : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-800"
                    }`}
                  >
                    {isPremiumPlan && (
                      <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                          <Crown className="h-3 w-3" />
                          Premium
                        </span>
                      </div>
                    )}
                    {isFeatured && (
                      <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-600 to-fuchsia-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                          <Sparkles className="h-3 w-3" />
                          Popular
                        </span>
                      </div>
                    )}

                    <div className={`flex flex-col p-4 ${isFeatured || isPremiumPlan ? "pt-5" : ""}`}>
                      <div>
                        <h3 className={`font-serif text-lg ${isPremiumPlan ? "text-amber-900 dark:text-amber-300" : "text-slate-900 dark:text-white"}`}>
                          {plan.name}
                        </h3>
                      </div>

                      <div className="mt-2">
                        <div className="flex items-baseline gap-1">
                          <span className={`font-serif text-3xl font-bold ${isPremiumPlan ? "text-amber-900 dark:text-amber-300" : "text-slate-900 dark:text-white"}`}>
                            {plan.payablePrice}
                          </span>
                          <span className="text-xs text-slate-500">/year</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-slate-400 line-through">{plan.listPrice}/yr</span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            {plan.listPricePaise > 0
                              ? `-${Math.round((1 - plan.payablePaise / plan.listPricePaise) * 100)}%`
                              : "-25%"}
                          </span>
                        </div>
                      </div>

                      <ul className="mt-3 space-y-1.5">
                        {plan.perks.map((perk) => (
                          <li key={perk} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                            <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isPremiumPlan ? "text-amber-500" : "text-brand-500"}`} />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3 space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          Included
                        </p>
                        {allFeatures.map((f) => {
                          const included = f.tiers.includes(plan.key);
                          return (
                            <div
                              key={f.label}
                              className={`flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] ${
                                included ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-600"
                              }`}
                            >
                              {included ? (
                                <Check className={`h-3 w-3 shrink-0 ${isPremiumPlan ? "text-amber-500" : "text-brand-500"}`} />
                              ) : (
                                <span className="h-3 w-3 shrink-0 rounded-full border border-slate-300 dark:border-slate-600" />
                              )}
                              <span className={included ? "" : "line-through"}>{f.label}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-auto pt-3">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => void startCheckout(plan.key as PlanKey, plan.name)}
                          className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            isPremiumPlan
                              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600"
                              : isFeatured
                                ? "bg-gradient-to-r from-brand-600 to-fuchsia-600 text-white hover:from-brand-700 hover:to-fuchsia-700"
                                : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-white/20 dark:bg-white/10 dark:text-white"
                          }`}
                        >
                          {isLoading ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Processing&hellip;
                            </span>
                          ) : (
                            `Choose ${plan.name}`
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
              Already subscribed?{" "}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-400"
              >
                Reload page
              </button>
            </p>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
