"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-slate-950">
          <div className="max-w-md">
            <h1 className="mb-2 text-6xl font-bold text-[#A0144D]">500</h1>
            <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">
              Critical error
            </h2>
            <p className="mb-8 text-slate-600 dark:text-slate-400">
              A critical error occurred. Please refresh the page.
            </p>
            <button
              onClick={reset}
              className="rounded-lg bg-[#A0144D] px-6 py-3 text-white transition-colors hover:bg-[#A0144D]/90"
            >
              Refresh
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
