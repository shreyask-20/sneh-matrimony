import Link from "next/link";
import { Sparkles, MessageCircle, ShieldCheck, Crown, ArrowRight } from "lucide-react";

const planHighlights = [
  { name: "Silver", price: "₹1,500", perks: "Verified matches, chat access, basic support" },
  { name: "Gold", price: "₹2,250", perks: "Personal matchmaker, priority support, unlimited interests" },
  { name: "Platinum", price: "₹3,000", perks: "Dedicated advisor, video verification, family concierge" },
];

const benefits = [
  { icon: Sparkles, text: "Curated matches based on your preferences" },
  { icon: MessageCircle, text: "Direct chat with verified members" },
  { icon: ShieldCheck, text: "Privacy-first & family-friendly platform" },
  { icon: Crown, text: "Dedicated support across all plans" },
];

export default function Subscriptions() {
  return (
    <section className="w-full px-4 pb-20 sm:px-6 lg:px-8 xl:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="section-heading">Premium memberships</h2>
          <p className="section-subtitle mx-auto mt-2 max-w-2xl">
            Unlock the full experience with a plan that fits your journey.{" "}
            <span className="font-medium text-brand-600">25% introductory discount</span>{" "}
            applied at checkout.
          </p>
        </div>

        {/* Plan glimpse cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {planHighlights.map((plan, i) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-5 text-center transition hover:shadow-md ${
                i === 2
                  ? "border-brand-200 bg-brand-50/70 dark:border-brand-500/30 dark:bg-white/5"
                  : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950"
              }`}
            >
              <p className="text-xs uppercase tracking-wider text-slate-400">{plan.name}</p>
              <p className="mt-1 font-serif text-2xl text-brand-600">
                {plan.price}<span className="text-sm text-slate-400">/yr</span>
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{plan.perks}</p>
            </div>
          ))}
        </div>

        {/* Benefits strip */}
        <div className="mb-8 grid gap-3 sm:grid-cols-4">
          {benefits.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3 rounded-xl bg-brand-50/50 p-4 dark:bg-white/[0.04]">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span className="text-xs text-slate-600 dark:text-slate-300">{text}</span>
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
