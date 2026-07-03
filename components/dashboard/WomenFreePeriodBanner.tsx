"use client";

import { useEffect, useState } from "react";

const FREE_PERIOD_DAYS = 60;

function getDaysRemaining(createdAt: Date): number {
  const now = new Date();
  const end = new Date(createdAt.getTime() + FREE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

type Props = {
  createdAt: string;
};

export default function WomenFreePeriodBanner({ createdAt }: Props) {
  const [visible, setVisible] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("freePeriodBannerDismissed");
    if (dismissed === "1") return;

    const created = new Date(createdAt);
    const days = getDaysRemaining(created);
    if (days <= 0) return;

    setDaysLeft(days);
    setProgress(((FREE_PERIOD_DAYS - days) / FREE_PERIOD_DAYS) * 100);

    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, [createdAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      const created = new Date(createdAt);
      const days = getDaysRemaining(created);
      setDaysLeft(days);
      setProgress(((FREE_PERIOD_DAYS - days) / FREE_PERIOD_DAYS) * 100);
    }, 60000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("freePeriodBannerDismissed", "1");
  };

  if (!visible || daysLeft <= 0) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-200/70 bg-gradient-to-r from-brand-50/90 via-fuchsia-50/60 to-brand-50/90 p-5 dark:border-brand-500/20 dark:from-brand-500/10 dark:via-fuchsia-500/10 dark:to-brand-500/10 animate-in slide-in-from-top-4 fade-in duration-500">
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-white/60 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-300"
        aria-label="Dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
              Free Access for Women
            </p>
          </div>
          <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">
            Congratulations! You have <span className="font-bold text-brand-600 dark:text-brand-400">{daysLeft} day{daysLeft !== 1 ? "s" : ""}</span> of free access remaining. Enjoy browsing, chatting, and connecting!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-brand-600 dark:text-brand-400 font-mono tabular-nums">
              {daysLeft}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              days left
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-100 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-fuchsia-400 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
