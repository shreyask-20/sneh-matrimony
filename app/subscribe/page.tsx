import Navbar from "@/components/shared/Navbar";
import PageBackdrop from "@/components/shared/PageBackdrop";
import PlanCards from "@/components/subscription/PlanCards";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { getActiveSubscription } from "@/lib/subscription-status";
import { PLANS, type PlanKey } from "@/lib/subscriptions";
import Link from "next/link";
import Badge from "@/components/shared/Badge";

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
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
              Choose your membership
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Yearly plans with a limited-time 25% introductory discount at checkout.
            </p>
          </div>

          {subscription && (
            <div className="mb-8 rounded-3xl border border-brand-200 bg-brand-50/60 p-6 dark:border-brand-500/30 dark:bg-white/5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                    Current plan
                  </p>
                  <p className="mt-1 font-serif text-2xl text-slate-900 dark:text-white">
                    {subscription.planName}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Active until{" "}
                    {new Date(subscription.expiresAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge label="Active" tone="verified" />
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                You can upgrade anytime — select a higher plan below.
              </p>
            </div>
          )}

          {highlightedPlan &&
            (highlightedPlan === "SILVER" ||
              highlightedPlan === "GOLD" ||
              highlightedPlan === "PLATINUM") && (
            <p className="mb-4 text-center text-sm text-brand-600">
              You selected {PLANS[highlightedPlan as PlanKey].name}. Complete checkout
              below.
            </p>
          )}

          <PlanCards />

          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Secure payments powered by Razorpay.{" "}
            <Link href="/dashboard" className="text-brand-600 hover:underline">
              Back to dashboard
            </Link>
          </p>
        </div>
      </main>
    </PageBackdrop>
  );
}
