"use client";

import { useState } from "react";

const tabs = ["About", "Family", "Preferences"] as const;

export default function ProfileTabs({
  about,
  family,
  preferences,
}: {
  about?: string;
  family?: string;
  preferences?:
    | string
    | {
        preferredAgeRange?: string | null;
        religionCommunity?: string | null;
        locationPreference?: string | null;
        expectations?: string | null;
      };
}) {
  const [active, setActive] = useState<(typeof tabs)[number]>("About");

  return (
    <div>
      <div className="flex gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              active === tab
                ? "bg-brand-500 text-white"
                : "bg-white/70 text-slate-600 hover:text-brand-600 dark:bg-white/5 dark:text-slate-300"
            }`}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-3xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
        {active === "About" && (
          <p>
            {about ??
              "Thoughtful and grounded, with a love for art, travel, and meaningful conversations. Looking for a partner who values kindness and growth."}
          </p>
        )}
        {active === "Family" && (
          <p>
            {family ??
              "Close-knit family of four with strong values and an open-minded outlook. Parents are based in Mumbai."}
          </p>
        )}
        {active === "Preferences" && (
          typeof preferences === "string" || !preferences ? (
            <p>
              {preferences ??
                "Seeking a partner aged 26-32, ideally from a similar cultural background, with a passion for learning and an active lifestyle."}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-brand-50/50 px-4 py-3 dark:bg-white/[0.04]">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Preferred age range
                  </p>
                  <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                    {preferences.preferredAgeRange ?? "Not specified"}
                  </p>
                </div>
                <div className="rounded-2xl bg-brand-50/50 px-4 py-3 dark:bg-white/[0.04]">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Community preference
                  </p>
                  <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                    {preferences.religionCommunity ?? "Open"}
                  </p>
                </div>
                <div className="rounded-2xl bg-brand-50/50 px-4 py-3 dark:bg-white/[0.04] sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Location preference
                  </p>
                  <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                    {preferences.locationPreference ?? "Flexible"}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/40 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-slate-950/40">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Expectations
                </p>
                <p className="mt-2 leading-6 text-slate-700 dark:text-slate-200">
                  {preferences.expectations ??
                    "This member is open to meaningful conversations and a compatible long-term match."}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
