import Button from "../shared/Button";
import Badge from "../shared/Badge";

const plans = [
  {
    name: "Silver",
    price: "₹2,999",
    perks: ["Verified matches", "Direct chat access", "Basic support"],
  },
  {
    name: "Gold",
    price: "₹4,999",
    perks: ["Personal matchmaker", "Priority support", "Unlimited interests"],
  },
  {
    name: "Platinum",
    price: "₹9,999",
    perks: ["Dedicated advisor", "Video verification", "Family concierge"],
    highlight: true,
  },
];

export default function Subscriptions() {
  return (
    <section className="w-full px-4 pb-20 sm:px-6 lg:px-8 xl:px-12">
      <div className="mb-8">
        <h2 className="section-heading">Premium memberships</h2>
        <p className="section-subtitle mt-2">
          Choose a plan that suits your journey. Billed yearly. Upgrade any time.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl border p-6 ${
              plan.highlight
                ? "border-brand-200 bg-brand-50/70 shadow-soft dark:border-brand-500/30 dark:bg-white/5"
                : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl text-slate-900 dark:text-white">
                {plan.name}
              </h3>
              {plan.highlight && <Badge label="Most loved" tone="premium" />}
            </div>
            <p className="mt-2 text-3xl font-semibold text-brand-600">
              {plan.price}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {plan.perks.map((perk) => (
                <li key={perk}>• {perk}</li>
              ))}
            </ul>
            <Button className="mt-6 w-full">Choose {plan.name}</Button>
          </div>
        ))}
      </div>
    </section>
  );
}
