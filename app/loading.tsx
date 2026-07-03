export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#A0144D] border-t-transparent" />
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
