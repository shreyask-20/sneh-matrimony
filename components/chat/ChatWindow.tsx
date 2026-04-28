"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Send, Heart, ArrowLeft } from "lucide-react";
import { MAX_MESSAGES_PER_USER_PER_CONVERSATION } from "@/lib/chatConfig";
import { formatTimestamp } from "@/lib/formatTimestamp";
import Link from "next/link";

type ChatMessage = {
  id: number;
  body: string;
  senderId: string;
  createdAt: string;
  readAt?: string | null;
};

type SelectedConversation = {
  id: number;
  profile: {
    id: string;
    name: string;
    city: string | null;
    profession: string | null;
    photoUrl: string | null;
  };
  messages: ChatMessage[];
};

export default function ChatWindow({
  currentUserId,
  selectedConversation,
  remainingMessages,
}: {
  currentUserId: string;
  selectedConversation: SelectedConversation | null;
  remainingMessages: number;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState(selectedConversation?.messages ?? []);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canSend = remainingMessages > 0;
  const limitPercent = Math.round(
    (remainingMessages / MAX_MESSAGES_PER_USER_PER_CONVERSATION) * 100
  );

  useEffect(() => {
    setMessages(selectedConversation?.messages ?? []);
    setDraft("");
  }, [selectedConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversation?.id]);

  /* ── Empty state ── */
  if (!selectedConversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-gradient-to-br from-brand-50/40 via-white/60 to-fuchsia-50/30 p-8 text-center backdrop-blur-xl dark:from-white/[0.02] dark:via-slate-950/60 dark:to-white/[0.02]">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-100 to-fuchsia-100 shadow-[0_8px_24px_rgba(155,28,74,0.15)] dark:from-white/10 dark:to-white/5">
            <Heart className="h-9 w-9 text-brand-500" />
          </div>
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white shadow">
            ✦
          </span>
        </div>
        <div>
          <p className="font-serif text-2xl text-slate-900 dark:text-white">
            Your conversations
          </p>
          <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Select a match from the sidebar to start a meaningful conversation.
          </p>
        </div>
        <div className="mt-2 rounded-2xl border border-brand-100/60 bg-white/80 px-5 py-3 text-xs text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          All conversations are private and secure.
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const response = await fetch(
        `/api/chat/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: trimmed }),
        }
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Failed to send message.");
      }

      const data = (await response.json()) as {
        message: { id: number; body: string; senderId: string; createdAt: string };
      };

      setMessages((current) => [...current, data.message]);
      setDraft("");
      router.refresh();
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-white/70 to-white/50 backdrop-blur-xl dark:from-slate-950/70 dark:to-slate-950/50">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-white/30 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
        <div className="flex items-center gap-3">
          {/* Back button on mobile */}
          <Link
            href="/chat"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-brand-50 hover:text-brand-600 lg:hidden dark:hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="relative">
            <img
              src={selectedConversation.profile.photoUrl ?? "/profiles/p1.jpg"}
              alt={selectedConversation.profile.name}
              className="h-11 w-11 rounded-2xl object-cover shadow-sm"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-950" />
          </div>
          <div>
            <p className="font-serif text-base font-semibold text-slate-900 dark:text-white">
              {selectedConversation.profile.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {[selectedConversation.profile.city, selectedConversation.profile.profession]
                .filter(Boolean)
                .join(" · ") || "Matched"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Message limit pill */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className={`h-full rounded-full transition-all ${
                  limitPercent > 50
                    ? "bg-emerald-400"
                    : limitPercent > 20
                      ? "bg-amber-400"
                      : "bg-red-400"
                }`}
                style={{ width: `${limitPercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {remainingMessages} left
            </span>
          </div>
          <Link
            href={`/profiles/${selectedConversation.profile.id}`}
            className="rounded-xl border border-brand-100/70 bg-white px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-brand-300"
          >
            View profile
          </Link>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-50 dark:bg-white/5">
              <Heart className="h-6 w-6 text-brand-400" />
            </div>
            <p className="font-medium text-slate-700 dark:text-slate-200">
              Say hello to {selectedConversation.profile.name.split(" ")[0]}
            </p>
            <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
              This is the beginning of your conversation. Start with something thoughtful.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => {
              const isMine = message.senderId === currentUserId;
              const prevMessage = messages[index - 1];
              const isFirstInGroup =
                !prevMessage || prevMessage.senderId !== message.senderId;
              const nextMessage = messages[index + 1];
              const isLastInGroup =
                !nextMessage || nextMessage.senderId !== message.senderId;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"} ${
                    isFirstInGroup ? "mt-4" : "mt-0.5"
                  }`}
                >
                  {/* Avatar for other person, only on last in group */}
                  {!isMine && (
                    <div className="mr-2 mt-auto shrink-0">
                      {isLastInGroup ? (
                        <img
                          src={selectedConversation.profile.photoUrl ?? "/profiles/p1.jpg"}
                          alt={selectedConversation.profile.name}
                          className="h-7 w-7 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="h-7 w-7" />
                      )}
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[65%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                    <div
                      className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        isMine
                          ? `bg-gradient-to-br from-brand-500 to-brand-600 text-white ${
                              isFirstInGroup ? "rounded-t-2xl" : "rounded-t-lg"
                            } ${isLastInGroup ? "rounded-bl-2xl rounded-br-sm" : "rounded-b-lg"}`
                          : `bg-white text-slate-700 dark:bg-white/10 dark:text-slate-200 ${
                              isFirstInGroup ? "rounded-t-2xl" : "rounded-t-lg"
                            } ${isLastInGroup ? "rounded-br-2xl rounded-bl-sm" : "rounded-b-lg"}`
                      }`}
                    >
                      {message.body}
                    </div>
                    {isLastInGroup && (
                      <p className={`mt-1 px-1 text-[10px] text-slate-400 ${isMine ? "text-right" : "text-left"}`}>
                        {formatTimestamp(message.createdAt)}
                        {isMine && (
                          <span className="ml-1.5">
                            {(message as ChatMessage & { readAt?: string | null }).readAt
                              ? <span className="text-brand-400">✓✓</span>
                              : <span className="text-slate-300">✓</span>
                            }
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="border-t border-white/30 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
        {/* Mobile message limit */}
        <div className="mb-2 flex items-center gap-2 sm:hidden">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className={`h-full rounded-full ${
                limitPercent > 50 ? "bg-emerald-400" : limitPercent > 20 ? "bg-amber-400" : "bg-red-400"
              }`}
              style={{ width: `${limitPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">{remainingMessages}/{MAX_MESSAGES_PER_USER_PER_CONVERSATION}</span>
        </div>

        {canSend ? (
          <div className="flex items-end gap-2">
            <input
              ref={inputRef}
              className="flex-1 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              placeholder={`Message ${selectedConversation.profile.name.split(" ")[0]}…`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={sending || !draft.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm transition hover:from-brand-600 hover:to-brand-700 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-400/20 dark:bg-amber-400/10">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Message limit reached
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-300">
                You've used all {MAX_MESSAGES_PER_USER_PER_CONVERSATION} messages for this conversation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
