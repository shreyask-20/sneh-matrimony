import Navbar from "../../components/shared/Navbar";
import ChatWindow from "../../components/chat/ChatWindow";

const conversations = [
  { name: "Raghav Mehta", last: "Call this weekend?" },
  { name: "Priya Desai", last: "Looking forward to chat." },
  { name: "Arjun Nair", last: "Shared family details." },
];

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[320px_1fr]">
        <aside className="glass-card h-fit rounded-3xl p-5">
          <h2 className="font-serif text-xl text-slate-900 dark:text-white">
            Conversations
          </h2>
          <div className="mt-4 space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.name}
                className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-sm text-slate-600 transition hover:border-brand-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                <p className="font-semibold text-slate-900 dark:text-white">
                  {conversation.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {conversation.last}
                </p>
              </div>
            ))}
          </div>
        </aside>
        <div className="min-h-[520px]">
          <ChatWindow />
        </div>
      </main>
    </div>
  );
}
