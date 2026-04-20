"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Button from "@/components/shared/Button";

type FilterValues = {
  ageRange: string;
  city: string;
  religion: string;
  education: string;
  profession: string;
  caste: string;
};

export default function BrowseFilters({
  defaults,
}: {
  defaults: Partial<FilterValues>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [values, setValues] = useState<FilterValues>({
    ageRange: searchParams.get("ageRange") ?? defaults.ageRange ?? "",
    city: searchParams.get("city") ?? defaults.city ?? "",
    religion: searchParams.get("religion") ?? defaults.religion ?? "",
    education: searchParams.get("education") ?? defaults.education ?? "",
    profession: searchParams.get("profession") ?? defaults.profession ?? "",
    caste: searchParams.get("caste") ?? defaults.caste ?? "",
  });

  const set = (key: keyof FilterValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const apply = () => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value.trim()) params.set(key, value.trim());
    }
    router.push(`/browse?${params.toString()}`);
  };

  const clear = () => {
    setValues({ ageRange: "", city: "", religion: "", education: "", profession: "", caste: "" });
    router.push("/browse");
  };

  const hasAnyValue = Object.values(values).some((v) => v.trim());

  const fields: { label: string; key: keyof FilterValues; placeholder: string }[] = [
    { label: "Age range", key: "ageRange", placeholder: "e.g. 25-30" },
    { label: "City", key: "city", placeholder: "e.g. Mumbai" },
    { label: "Religion", key: "religion", placeholder: "e.g. Hindu" },
    { label: "Caste / Community", key: "caste", placeholder: "e.g. Brahmin" },
    { label: "Education", key: "education", placeholder: "e.g. B.Tech" },
    { label: "Profession", key: "profession", placeholder: "e.g. Engineer" },
  ];

  return (
    <div className="space-y-4">
      {fields.map(({ label, key, placeholder }) => (
        <div key={key}>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </label>
          <input
            type="text"
            value={values[key]}
            onChange={set(key)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
      ))}
      <Button className="mt-2 w-full" onClick={apply}>
        Apply filters
      </Button>
      {hasAnyValue && (
        <button
          type="button"
          onClick={clear}
          className="w-full text-center text-xs text-slate-400 underline underline-offset-2 hover:text-brand-500"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
