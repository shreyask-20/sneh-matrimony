type Props = {
  value: number;
};

export default function Progress({ value }: Props) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
      <div
        className="h-full rounded-full bg-brand-500 transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
