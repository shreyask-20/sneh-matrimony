import Badge from "../shared/Badge";
import CheckoutButton from "./CheckoutButton";
import { getPlanPricing, PLAN_KEYS } from "@/lib/subscriptions";

type PlanCardsProps = {
  showIntroBadge?: boolean;
};

export default function PlanCards({ showIntroBadge = true }: PlanCardsProps) {
  const plans = PLAN_KEYS.map((key) => getPlanPricing(key));

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.key}
          className={`rounded-3xl border p-6 ${
            plan.highlight
              ? "border-brand-200 bg-brand-50/70 shadow-soft dark:border-brand-500/30 dark:bg-white/5"
              : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-2xl text-slate-900 dark:text-white">
              {plan.name}
            </h3>
            <div className="flex flex-col items-end gap-1">
              {plan.highlight && <Badge label="Most loved" tone="premium" />}
              {showIntroBadge && (
                <Badge label={`${plan.discountPercent}% intro`} tone="verified" />
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-500 line-through dark:text-slate-400">
            {plan.listPrice}/year
          </p>
          <p className="text-3xl font-semibold text-brand-600">{plan.payablePrice}/year</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Introductory price · billed yearly
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {plan.perks.map((perk) => (
              <li key={perk}>• {perk}</li>
            ))}
          </ul>
          <CheckoutButton plan={plan.key} planName={plan.name} className="mt-6" />
        </div>
      ))}
    </div>
  );
}
