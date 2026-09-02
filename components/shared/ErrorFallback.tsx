"use client";

/**
 * Reusable client-side error fallback for per-segment Next.js error boundaries.
 * Each route segment's `error.tsx` renders this with a contextual label so a
 * failure in one section doesn't take down the whole portal with a generic page.
 */
export default function ErrorFallback({
  error,
  reset,
  context,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  context?: string;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md">
        <h1 className="mb-2 text-6xl font-bold text-[#A0144D]">500</h1>
        <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">
          Something went wrong{context ? ` loading ${context}` : ""}
        </h2>
        <p className="mb-8 text-slate-600 dark:text-slate-400">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-[#A0144D] px-6 py-3 text-white transition-colors hover:bg-[#A0144D]/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
