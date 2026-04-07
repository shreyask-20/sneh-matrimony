const steps = [
  {
    title: "Create your profile",
    description:
      "Tell us about your values, lifestyle, and what you seek in a partner.",
  },
  {
    title: "Get curated matches",
    description:
      "Our AI-led compatibility engine and counselors shortlist the best fits.",
  },
  {
    title: "Connect securely",
    description:
      "Express interest, chat safely, and plan meaningful first meetings.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full px-4 pb-16 sm:px-6 lg:px-8 xl:px-12">
      <div className="mb-8">
        <h2 className="section-heading">How it works</h2>
        <p className="section-subtitle mt-2">
          A guided journey that keeps families informed and partners aligned.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="glass-card rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="mb-4 h-10 w-10 rounded-full bg-brand-500/90 text-center text-sm font-semibold leading-10 text-white">
              {index + 1}
            </div>
            <h3 className="font-serif text-xl text-slate-900 dark:text-white">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
