import Link from "next/link";
import { ArrowRight } from "lucide-react";

const planHighlights = [
  { name: "Silver", price: "₹1,500", perks: "Verified matches, chat access, basic support" },
  { name: "Gold", price: "₹2,250", perks: "Personal matchmaker, priority support, unlimited interests" },
  { name: "Platinum", price: "₹3,000", perks: "Dedicated advisor, video verification, family concierge" },
];

export default function Subscriptions() {
  return (
    <section className="w-full px-4 pb-20 sm:px-6 lg:px-8 xl:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="section-heading">Premium memberships</h2>
          <p className="section-subtitle mx-auto mt-2 max-w-2xl">
            Unlock the full experience with a plan that fits your journey.{" "}
            <span className="font-medium text-brand-600">25% introductory discount</span>{" "}
            applied at checkout.
          </p>
        </div>

        {/* Plan glimpse cards */}
        <div className="mb-10 grid gap-5 sm:grid-cols-3">
          {planHighlights.map((plan, i) => (
            <div
              key={plan.name}
              className={`rounded-3xl border-2 px-6 py-8 text-center shadow-lg shadow-brand-950/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:shadow-black/20 sm:px-8 sm:py-10 ${
                i === 2
                  ? "border-brand-300 bg-brand-50/80 dark:border-brand-500/40 dark:bg-brand-500/10"
                  : "border-brand-100 bg-white dark:border-white/10 dark:bg-slate-950"
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                {plan.name}
              </p>
              <p className="mt-3 font-serif text-4xl font-semibold text-brand-600">
                {plan.price}<span className="text-base text-slate-400">/yr</span>
              </p>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">
                {plan.perks}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            View full plans & pricing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
