"use client";

import { useState } from "react";
import HoroscopeChart from "./HoroscopeChart";
import { normalizeHoroscopeChartInput } from "@/lib/horoscope";

const tabs = ["About", "Family", "Preferences", "Horoscope"] as const;

type FamilyDetails = {
  fatherName: string;
  motherName: string;
  totalBrothers: number;
  totalSisters: number;
  marriedBrothers: number;
  marriedSisters: number;
};

function FieldCard({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-2 font-semibold text-slate-800 dark:text-slate-100 ${
          compact ? "text-sm leading-6" : "text-base"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function ProfileTabs({
  about,
  family,
  preferences,
  horoscope,
}: {
  about?: string;
  family?: string | FamilyDetails;
  preferences?:
    | string
    | {
        preferredAgeRange?: string | null;
        religionCommunity?: string | null;
        locationPreference?: string | null;
        castePreference?: string | null;
        subCastePreference?: string | null;
        expectations?: string | null;
      };
  horoscope?:
    | string
    | {
        horoscopeAvailable?: boolean | null;
        manglik?: boolean | null;
        nakshatra?: string | null;
        rashi?: string | null;
        gotra?: string | null;
        gan?: string | null;
        nadi?: string | null;
        charan?: string | null;
        chart?: unknown;
      };
}) {
  const [active, setActive] = useState<(typeof tabs)[number]>("About");

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
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
      <div className="mt-6 rounded-3xl border border-white/40 bg-white/80 p-6 text-sm text-slate-600 shadow-[0_20px_40px_rgba(127,16,62,0.05)] dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
        {active === "About" && (
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-brand-100/60 bg-brand-50/50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-500">
                About
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-200">
                {about ??
              "Thoughtful and grounded, with a love for art, travel, and meaningful conversations. Looking for a partner who values kindness and growth."}
              </p>
            </div>
            <div className="grid gap-4">
              <FieldCard
                label="What this tells you"
                value="A quick read on personality, interests, and the kind of conversation this member may enjoy."
                compact
              />
              <FieldCard
                label="Profile note"
                value="Use this section as the opening context before moving into preferences and family details."
                compact
              />
            </div>
          </div>
        )}
        {active === "Family" && (
          typeof family === "string" || !family ? (
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-brand-100/60 bg-brand-50/50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-xs uppercase tracking-[0.18em] text-brand-500">
                  Family
                </p>
                <p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-200">
                  {family ??
                    "Close-knit family of four with strong values and an open-minded outlook. Parents are based in Mumbai."}
                </p>
              </div>
              <div className="grid gap-4">
                <FieldCard
                  label="Family note"
                  value="A concise snapshot to help you understand the household and background."
                  compact
                />
                <FieldCard
                  label="Conversation cue"
                  value="Good family details often make introductions easier and more natural."
                  compact
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldCard label="Father" value={family.fatherName} />
              <FieldCard label="Mother" value={family.motherName} />
              <FieldCard
                label="Brothers"
                value={`${family.totalBrothers} total, ${family.marriedBrothers} married`}
              />
              <FieldCard
                label="Sisters"
                value={`${family.totalSisters} total, ${family.marriedSisters} married`}
              />
            </div>
          )
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
                <div className="rounded-2xl bg-brand-50/50 px-4 py-3 dark:bg-white/[0.04]">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Caste preference
                  </p>
                  <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                    {preferences.castePreference ?? "Open"}
                  </p>
                </div>
                <div className="rounded-2xl bg-brand-50/50 px-4 py-3 dark:bg-white/[0.04]">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Sub-caste preference
                  </p>
                  <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                    {preferences.subCastePreference ?? "Open"}
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
        {active === "Horoscope" && (
          typeof horoscope === "string" || !horoscope ? (
            <p>
              {horoscope ??
                "Horoscope details have not been added yet."}
            </p>
          ) : (
            <div className="space-y-4">
              <HoroscopeChart chart={normalizeHoroscopeChartInput(horoscope.chart)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldCard
                  label="Horoscope available"
                  value={horoscope.horoscopeAvailable ? "Yes" : "No"}
                />
                <FieldCard
                  label="Manglik"
                  value={horoscope.manglik ? "Yes" : "No"}
                />
                <FieldCard
                  label="Nakshatra"
                  value={horoscope.nakshatra ?? "Not shared"}
                />
                <FieldCard label="Rashi" value={horoscope.rashi ?? "Not shared"} />
                <FieldCard label="Gotra" value={horoscope.gotra ?? "Not shared"} />
                <FieldCard label="Gan" value={horoscope.gan ?? "Not shared"} />
                <FieldCard label="Nadi" value={horoscope.nadi ?? "Not shared"} />
                <FieldCard label="Charan" value={horoscope.charan ?? "Not shared"} />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
