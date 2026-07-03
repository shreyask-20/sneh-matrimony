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

export default function WelcomeFreePeriodToast({ createdAt }: Props) {
  const [visible, setVisible] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const shown = sessionStorage.getItem("freePeriodWelcomeShown");
    if (shown === "1") return;

    const created = new Date(createdAt);
    const days = getDaysRemaining(created);
    if (days <= 0) return;

    setDaysLeft(days);
    sessionStorage.setItem("freePeriodWelcomeShown", "1");

    const showTimer = setTimeout(() => setVisible(true), 800);
    const hideTimer = setTimeout(() => setVisible(false), 8000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [createdAt]);

  if (!visible || daysLeft <= 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm animate-in slide-in-from-left-8 fade-in duration-500 sm:bottom-6 sm:left-6">
      <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-white p-4 shadow-lg dark:border-brand-500/30 dark:bg-slate-900">
        {/* Glow effect */}
        <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-brand-400/20 blur-2xl" />

        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Welcome to Sneh Matrimony!
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              You have <span className="font-semibold text-brand-600 dark:text-brand-400">{daysLeft} days</span> of free access. Browse, chat, and find your perfect match!
            </p>
          </div>
        </div>

        {/* Animated dismiss bar */}
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-brand-100 dark:bg-white/10">
          <div
            className="h-full bg-brand-400"
            style={{
              animation: "shrink 8s linear forwards",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
