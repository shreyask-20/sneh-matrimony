"use client";

import { useState } from "react";

const tabs = ["About", "Family", "Preferences"] as const;

export default function ProfileTabs() {
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
            Thoughtful and grounded, with a love for art, travel, and meaningful
            conversations. Looking for a partner who values kindness and growth.
          </p>
        )}
        {active === "Family" && (
          <p>
            Close-knit family of four with strong values and an open-minded
            outlook. Parents are based in Mumbai.
          </p>
        )}
        {active === "Preferences" && (
          <p>
            Seeking a partner aged 26-32, ideally from a similar cultural
            background, with a passion for learning and an active lifestyle.
          </p>
        )}
      </div>
    </div>
  );
}
