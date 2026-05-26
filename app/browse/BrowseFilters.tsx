"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Button from "@/components/shared/Button";
import { SlidersHorizontal, X } from "lucide-react";

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
  const [open, setOpen] = useState(false);

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
    setOpen(false);
  };

  const clear = () => {
    setValues({ ageRange: "", city: "", religion: "", education: "", profession: "", caste: "" });
    router.push("/browse");
    setOpen(false);
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

  const filterForm = (
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
            className="w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500"
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

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-brand-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 sm:w-auto"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasAnyValue && (
            <span className="ml-1 rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {Object.values(values).filter((v) => v.trim()).length}
            </span>
          )}
        </button>

        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 backdrop-blur-sm">
            <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-xl text-slate-900 dark:text-white">Filters</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {filterForm}
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar filters */}
      <div className="hidden lg:block">{filterForm}</div>
    </>
  );
}
