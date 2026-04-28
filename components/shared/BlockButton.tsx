"use client";

import { useState } from "react";
import { ShieldOff, ShieldCheck } from "lucide-react";

type Props = {
  blockedUserId: string;
  initialBlocked: boolean;
  className?: string;
};

export default function BlockButton({ blockedUserId, initialBlocked, className = "" }: Props) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (blocked) {
      void unblock();
    } else {
      setConfirming(true);
    }
  };

  const unblock = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch(`/api/block?blockedUserId=${blockedUserId}`, { method: "DELETE" });
      setBlocked(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmBlock = async () => {
    if (loading) return;
    setLoading(true);
    setConfirming(false);
    try {
      await fetch("/api/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedUserId }),
      });
      setBlocked(true);
    } finally {
      setLoading(false);
    }
  };

  if (confirming) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs text-slate-600 dark:text-slate-300">Block this user?</span>
        <button
          type="button"
          onClick={() => void confirmBlock()}
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          Yes, block
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={blocked ? "Unblock user" : "Block user"}
      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
        blocked
          ? "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
          : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
      } ${className}`}
    >
      {blocked ? (
        <ShieldCheck className="h-3.5 w-3.5" />
      ) : (
        <ShieldOff className="h-3.5 w-3.5" />
      )}
      {blocked ? "Unblock" : "Block"}
    </button>
  );
}
