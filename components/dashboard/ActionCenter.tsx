"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

type ActionCenterItem = {
  title: string;
  detail: string;
  href: string;
  cta: string;
};

type Props = {
  items: ActionCenterItem[];
  matchProgress: string;
};

export default function ActionCenter({ items, matchProgress }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const pendingCount = useMemo(
    () => items.filter((item) => item.cta !== "All clear").length,
    [items]
  );

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-serif text-xl text-slate-900 dark:text-white">
            Action Center
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isOpen
              ? "The most important next actions for your account right now."
              : pendingCount > 0
                ? `${pendingCount} item${pendingCount === 1 ? "" : "s"} need attention.`
                : "Everything looks clear. Expand anytime for account details."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-100/70 bg-white px-3 py-2 text-sm font-semibold text-brand-600 transition hover:border-brand-200 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-brand-200 dark:hover:bg-white/10 sm:w-auto"
          aria-expanded={isOpen}
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {isOpen ? "Collapse" : "Expand"}
        </button>
      </div>

      {!isOpen ? (
        <div className="mt-5 rounded-2xl border border-brand-100/70 bg-brand-50/50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
          <p className="font-medium text-slate-900 dark:text-white">
            Quick view
          </p>
          <p className="mt-1">
            {pendingCount > 0
              ? `${pendingCount} pending item${pendingCount === 1 ? "" : "s"} in this section.`
              : "No immediate actions right now."}{" "}
            {matchProgress}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/40 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <p className="font-semibold text-slate-900 dark:text-white">
                {item.title}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {item.detail}
              </p>
              <Link
                href={item.href}
                className="mt-4 inline-flex text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-200"
              >
                {item.cta}
              </Link>
            </div>
          ))}
          <div className="rounded-2xl border border-brand-100/70 bg-brand-50/50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="font-semibold text-slate-900 dark:text-white">
              Match progress
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {matchProgress}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
