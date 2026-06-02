import { Check, Sparkles } from "lucide-react";
import Badge from "../shared/Badge";
import CheckoutButton from "./CheckoutButton";
import { getPlanPricing, PLAN_KEYS } from "@/lib/subscriptions";

type PlanCardsProps = {
  showIntroBadge?: boolean;
};

const allFeatures: Record<string, Array<{ label: string; tiers: string[] }>> = {
  matching: [
    { label: "Verified matches", tiers: ["SILVER", "GOLD", "PLATINUM"] },
    { label: "Curated recommendations", tiers: ["GOLD", "PLATINUM"] },
    { label: "Personal matchmaker", tiers: ["GOLD", "PLATINUM"] },
    { label: "Dedicated relationship advisor", tiers: ["PLATINUM"] },
  ],
  communication: [
    { label: "Direct chat access", tiers: ["SILVER", "GOLD", "PLATINUM"] },
    { label: "Unlimited interests", tiers: ["GOLD", "PLATINUM"] },
    { label: "Video verification", tiers: ["PLATINUM"] },
    { label: "Priority messaging", tiers: ["PLATINUM"] },
  ],
  support: [
    { label: "Basic support", tiers: ["SILVER"] },
    { label: "Priority support", tiers: ["GOLD", "PLATINUM"] },
    { label: "Family concierge", tiers: ["PLATINUM"] },
    { label: "Dedicated phone line", tiers: ["PLATINUM"] },
  ],
};

function featureGrid(key: string) {
  return allFeatures[key as keyof typeof allFeatures] ?? [];
}

export default function PlanCards({ showIntroBadge = true }: PlanCardsProps) {
  const plans = PLAN_KEYS.map((key) => getPlanPricing(key));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan, i) => {
        const isFeatured = i === 1;
        const isPremium = i === 2;
        return (
          <div
            key={plan.key}
            className={`relative flex flex-col rounded-3xl border-2 transition-all duration-300 ${
              isFeatured
                ? "z-10 scale-[1.03] border-brand-400 bg-white shadow-[0_20px_60px_-12px_rgba(160,20,77,0.25)] dark:bg-slate-900 dark:shadow-[0_20px_60px_-12px_rgba(160,20,77,0.4)]"
                : "border-slate-200 bg-white shadow-sm hover:shadow-md dark:border-white/10 dark:bg-slate-950"
            }`}
          >
            {isFeatured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-600 to-fuchsia-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                  <Sparkles className="h-3.5 w-3.5" />
                  Most popular
                </span>
              </div>
            )}

            <div className={`flex flex-col p-6 sm:p-8 ${isFeatured ? "pt-8" : ""}`}>
              {/* Plan name + badges */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-serif text-xl text-slate-900 dark:text-white sm:text-2xl">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {plan.name} membership
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {isPremium && <Badge label="Best value" tone="premium" />}
                  {showIntroBadge && (
                    <Badge label={`${plan.discountPercent}% off`} tone="verified" />
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="mt-5">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">
                    {plan.payablePrice}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">/year</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-slate-400 line-through">{plan.listPrice}/year</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    Save {plan.listPricePaise > 0
                      ? `${Math.round((1 - plan.payablePaise / plan.listPricePaise) * 100)}%`
                      : "25%"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Introductory price · billed yearly · cancel anytime
                </p>
              </div>

              {/* Savings highlight for non-featured */}
              {isPremium && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                  <span className="font-semibold">Best savings</span> — most features at the lowest
                  per‑day cost.
                </div>
              )}

              {/* Perks list with checkmarks */}
              <ul className="mt-6 space-y-3">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              {/* Feature grid */}
              <div className="mt-6 space-y-4">
                {Object.entries(allFeatures).map(([section, features]) => (
                  <div key={section}>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      {section}
                    </p>
                    <div className="space-y-1.5">
                      {features.map((f) => {
                        const included = f.tiers.includes(plan.key);
                        return (
                          <div
                            key={f.label}
                            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                              included
                                ? "text-slate-700 dark:text-slate-200"
                                : "text-slate-400 dark:text-slate-600"
                            }`}
                          >
                            {included ? (
                              <Check className="h-3 w-3 shrink-0 text-brand-500" />
                            ) : (
                              <span className="h-3 w-3 shrink-0 rounded-full border border-slate-300 dark:border-slate-600" />
                            )}
                            <span className={included ? "" : "line-through"}>{f.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-auto pt-6">
                <CheckoutButton
                  plan={plan.key}
                  planName={plan.name}
                  className={`w-full ${
                    isFeatured
                      ? "bg-gradient-to-r from-brand-600 to-fuchsia-600 text-white shadow-md hover:from-brand-700 hover:to-fuchsia-700"
                      : ""
                  }`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
