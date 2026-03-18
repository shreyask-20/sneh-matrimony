import Button from "../shared/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-14">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-500">
            Trusted by modern families
          </p>
          <h1 className="font-serif text-4xl text-slate-900 dark:text-white sm:text-5xl">
            Find Your Perfect Life Partner
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Sneh Matrimony blends meaningful compatibility, privacy-first
            profiles, and curated matches to help you find a relationship that
            feels like home.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">Create Profile</Button>
            <Button size="lg" variant="secondary">
              Browse Matches
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span>Verified profiles</span>
            <span>Secure chat</span>
          </div>
        </div>
        <div className="glass-card rounded-[32px] p-6">
          <div className="space-y-4 rounded-[24px] bg-rose-dawn p-6 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-500">
              Quick search
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Age range",
                "City",
                "Religion",
                "Education",
                "Profession",
                "Caste",
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
                >
                  {label}
                </div>
              ))}
            </div>
            <Button className="w-full">Search Matches</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
