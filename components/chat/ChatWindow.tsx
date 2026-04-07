"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Button from "../shared/Button";
import { MAX_MESSAGES_PER_USER_PER_CONVERSATION } from "@/lib/chatConfig";
import { formatTimestamp } from "@/lib/formatTimestamp";

type ChatMessage = {
  id: number;
  body: string;
  senderId: string;
  createdAt: string;
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
  const canSend = remainingMessages > 0;

  useEffect(() => {
    setMessages(selectedConversation?.messages ?? []);
  }, [selectedConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversation?.id]);

  if (!selectedConversation) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center rounded-3xl border border-white/30 bg-white/80 p-8 text-center text-sm text-slate-500 backdrop-blur dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300">
        Select a match to start chatting.
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
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Failed to send message.");
      }

      const data = (await response.json()) as {
        message: {
          id: number;
          body: string;
          senderId: string;
          createdAt: string;
        };
      };

      setMessages((current) => [...current, data.message]);
      setDraft("");
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-[520px] flex-col rounded-3xl border border-white/30 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
      <div className="flex items-center justify-between border-b border-white/20 px-5 py-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={selectedConversation.profile.photoUrl ?? "/profiles/p1.jpg"}
            alt={selectedConversation.profile.name}
            className="h-12 w-12 rounded-2xl object-cover"
          />
          <div>
            <p className="font-serif text-lg text-slate-900 dark:text-white">
              {selectedConversation.profile.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {[selectedConversation.profile.city, selectedConversation.profile.profession]
                .filter(Boolean)
                .join(" • ") || "Matched conversation"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:bg-white/10 dark:text-white">
            {remainingMessages}/{MAX_MESSAGES_PER_USER_PER_CONVERSATION} messages left
          </span>
          <Button size="sm" variant="secondary">
            Matched
          </Button>
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 text-sm">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Start the conversation with a thoughtful hello.
          </p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  isMine
                    ? "ml-auto bg-brand-500 text-white"
                    : "bg-white text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-200"
                }`}
              >
                <p>{message.body}</p>
                <p
                  className={`mt-2 text-[11px] ${
                    isMine ? "text-white/80" : "text-slate-400"
                  }`}
                >
                  {formatTimestamp(message.createdAt)}
                </p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-white/20 px-5 py-4 dark:border-white/10">
        {canSend ? (
          <div className="flex gap-3">
            <input
              className="flex-1 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Write a message..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />
            <Button onClick={() => void handleSend()} disabled={sending || !draft.trim()}>
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
            You have reached the message limit for this match.
          </div>
        )}
      </div>
    </div>
  );
}
