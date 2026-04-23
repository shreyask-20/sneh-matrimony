import type React from "react";
import Link from "next/link";
import Button from "../shared/Button";

type HeroProps = {
  isAuthenticated?: boolean;
};

export default function Hero({ isAuthenticated = false }: HeroProps) {
  return (
    <section className="relative pb-20 pt-12 sm:pt-14">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { x: "8%", size: "14px", delay: "0s", duration: "14s", opacity: 0.25 },
          { x: "22%", size: "18px", delay: "2s", duration: "16s", opacity: 0.3 },
          { x: "36%", size: "12px", delay: "4s", duration: "13s", opacity: 0.22 },
          { x: "58%", size: "20px", delay: "1s", duration: "18s", opacity: 0.28 },
          { x: "72%", size: "16px", delay: "3s", duration: "15s", opacity: 0.26 },
          { x: "88%", size: "22px", delay: "5s", duration: "19s", opacity: 0.24 },
        ].map((heart, index) => (
          <span
            key={index}
            className="romantic-heart"
            style={
              {
                "--x": heart.x,
                "--size": heart.size,
                "--delay": heart.delay,
                "--duration": heart.duration,
                "--opacity": heart.opacity,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="relative z-10 grid w-full items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 xl:px-12">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-50">
            Trusted by modern families
          </p>
          <h1 className="font-serif text-4xl text-slate-0 sm:text-5xl">
            <span className="romantic-title">
              Find Your Perfect
              <span className="romantic-title">Life Partner</span>
            </span>
          </h1>
          <p className="text-base text-slate-700 dark:text-slate-300 sm:text-lg">
            Sneh Matrimony blends meaningful compatibility, privacy-first
            profiles, and curated matches to help you find a relationship that
            feels like home.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href={isAuthenticated ? "/profile" : "/auth/register"}>
                {isAuthenticated ? "View Profile" : "Create Profile"}
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/browse">Browse Matches</Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-900 dark:text-slate-400">
            <span>Verified profiles</span>
            <span>Secure chat</span>
          </div>
        </div>
        <form
          action="/browse"
          method="get"
          className="glass-card rounded-[32px] p-6"
        >
          <div className="space-y-4 rounded-[24px] bg-rose-dawn p-6 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-500">
              Quick search
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: "hero-age-range", name: "ageRange", label: "Age range" },
                { id: "hero-city", name: "city", label: "City" },
                { id: "hero-religion", name: "religion", label: "Religion" },
                { id: "hero-education", name: "education", label: "Education" },
                { id: "hero-profession", name: "profession", label: "Profession" },
                { id: "hero-caste", name: "caste", label: "Caste" },
              ].map((field) => (
                <label key={field.id} className="block">
                  <span className="sr-only">{field.label}</span>
                  <input
                    id={field.id}
                    name={field.name}
                    type="text"
                    placeholder={field.label}
                    className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:placeholder:text-slate-400"
                  />
                </label>
              ))}
            </div>
            <Button
              type="submit"
              className="w-full bg-slate-950 text-white hover:bg-slate-800"
            >
              Search Matches
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
