"use client";

import Button from "../shared/Button";

const messages = [
  { id: 1, from: "them", text: "Hello! I loved your profile." },
  { id: 2, from: "me", text: "Hi! Thank you, I enjoyed reading yours too." },
  { id: 3, from: "them", text: "Would you like to plan a call this weekend?" },
];

export default function ChatWindow() {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/30 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
      <div className="flex items-center justify-between border-b border-white/20 px-5 py-4 dark:border-white/10">
        <div>
          <p className="font-serif text-lg text-slate-900 dark:text-white">
            Raghav Mehta
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Online · Verified
          </p>
        </div>
        <Button size="sm" variant="secondary">
          View profile
        </Button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 text-sm">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
              message.from === "me"
                ? "ml-auto bg-brand-500 text-white"
                : "bg-white text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-200"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="border-t border-white/20 px-5 py-4 dark:border-white/10">
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
            placeholder="Write a message..."
          />
          <Button>Send</Button>
        </div>
      </div>
    </div>
  );
}
