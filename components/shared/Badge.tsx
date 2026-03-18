type Props = {
  label: string;
  tone?: "verified" | "premium" | "neutral";
};

const toneStyles: Record<NonNullable<Props["tone"]>, string> = {
  verified:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30",
  premium:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30",
  neutral:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/10",
};

export default function Badge({ label, tone = "neutral" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneStyles[tone]}`}
    >
      {label}
    </span>
  );
}
