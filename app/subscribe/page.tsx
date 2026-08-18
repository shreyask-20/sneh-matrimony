import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import PageBackdrop from "@/components/shared/PageBackdrop";
import PlanCards from "@/components/subscription/PlanCards";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { getActiveSubscription } from "@/lib/subscription-status";
import { PLANS, type PlanKey } from "@/lib/subscriptions";
import Badge from "@/components/shared/Badge";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Membership Plans",
  description:
    "Choose a Sneh Matrimony membership plan to unlock premium features, unlimited messaging, and curated matchmaking.",
  robots: { index: false, follow: false },
};

export default async function SubscribePage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const session = await getServerSession(authOptions);
  const subscription = session?.user?.id
    ? await getActiveSubscription(session.user.id)
    : null;

  const highlightedPlan = resolved?.plan?.toUpperCase();

  return (
    <PageBackdrop>
      <Navbar />
      <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-brand-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              Pricing
            </span>
            <h1 className="section-heading mt-4">Choose your membership</h1>
            <p className="section-subtitle mx-auto mt-3 max-w-2xl">
              Yearly plans with a limited-time{" "}
              <span className="font-semibold text-brand-600">25% introductory discount</span>{" "}
              applied at checkout. Pick the plan that fits your journey.
            </p>
          </div>

          {/* Current subscription banner */}
          {subscription && (
            <div className="mb-10 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-fuchsia-50 p-5 dark:border-brand-500/30 dark:from-white/[0.04] dark:to-white/[0.02] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 sm:flex dark:bg-brand-500/20 dark:text-brand-300">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                      Current plan
                    </p>
                    <p className="mt-0.5 font-serif text-xl text-slate-900 dark:text-white sm:text-2xl">
                      {subscription.planName}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Active until{" "}
                      {new Date(subscription.expiresAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Badge label="Active" tone="verified" />
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                You can upgrade to a higher plan anytime. Lower plans are not available for downgrade.
              </p>
            </div>
          )}

          {/* Selected plan notice */}
          {highlightedPlan &&
            (highlightedPlan === "SILVER" ||
              highlightedPlan === "GOLD" ||
              highlightedPlan === "PLATINUM") && (
            <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/80 px-5 py-4 text-center text-sm font-medium text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
              You selected{" "}
              <span className="font-semibold">{PLANS[highlightedPlan as PlanKey].name}</span>.
              Complete checkout below to activate your membership.
            </div>
          )}

          {/* Plan cards */}
          <PlanCards currentPlan={subscription ? { plan: subscription.plan, planName: subscription.planName, expiresAt: subscription.expiresAt } : null} />
        </div>
      </main>
    </PageBackdrop>
  );
}
