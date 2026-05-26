"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  userId: string;
  shouldShow: boolean;
  unreadMessageCount: number;
  unreadConversationCount: number;
};

export default function UnreadMessageToast({
  userId,
  shouldShow,
  unreadMessageCount,
  unreadConversationCount,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shouldShow) {
      return;
    }

    window.history.replaceState({}, "", "/dashboard");

    if (unreadMessageCount <= 0 || unreadConversationCount <= 0) {
      return;
    }

    const storageKey = [
      "sneh-unread-message-toast",
      userId,
      unreadMessageCount,
      unreadConversationCount,
    ].join(":");

    if (window.sessionStorage.getItem(storageKey) === "seen") {
      return;
    }

    window.sessionStorage.setItem(storageKey, "seen");
    setVisible(true);

    const timer = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(timer);
  }, [shouldShow, unreadMessageCount, unreadConversationCount, userId]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-3xl border border-brand-100/70 bg-white px-4 py-4 shadow-[0_18px_40px_rgba(127,16,62,0.12)] dark:border-white/10 dark:bg-slate-950 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-brand-400">
        New messages
      </p>
      <p className="mt-2 font-serif text-lg text-slate-900 dark:text-white">
        You have {unreadMessageCount} unread message
        {unreadMessageCount === 1 ? "" : "s"} from {unreadConversationCount} match
        {unreadConversationCount === 1 ? "" : "es"}.
      </p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Open messages to reply before this notice disappears.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/chat"
          className="rounded-2xl bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          Open Messages
        </Link>
        <button
          type="button"
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
          onClick={() => setVisible(false)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
