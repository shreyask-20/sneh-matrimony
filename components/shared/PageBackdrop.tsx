import type { ReactNode } from "react";

type PageBackdropProps = {
  children: ReactNode;
  className?: string;
};

export default function PageBackdrop({
  children,
  className = "",
}: PageBackdropProps) {
  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-white dark:bg-slate-950 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-gradient-to-b from-brand-500/20 via-brand-200/15 to-transparent dark:from-brand-500/10 dark:via-brand-500/5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-brand-200/20 blur-3xl dark:bg-brand-500/10"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
