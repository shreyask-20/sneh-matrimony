"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

type Props = {
  profileUserId: string;
  initialSaved: boolean;
  className?: string;
};

export default function ShortlistButton({ profileUserId, initialSaved, className = "" }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (saved) {
        await fetch(`/api/shortlist?profileUserId=${profileUserId}`, { method: "DELETE" });
        setSaved(false);
      } else {
        await fetch("/api/shortlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileUserId }),
        });
        setSaved(true);
      }
    } catch {
      // silently fail — optimistic update already applied
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle();
      }}
      disabled={loading}
      aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
        saved
          ? "border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
          : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
      } ${className}`}
    >
      {saved ? (
        <BookmarkCheck className="h-3.5 w-3.5" />
      ) : (
        <Bookmark className="h-3.5 w-3.5" />
      )}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
