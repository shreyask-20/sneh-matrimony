import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import Navbar from "../../components/shared/Navbar";
import ChatWindow from "../../components/chat/ChatWindow";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOtherUserId } from "@/lib/chat";

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: Promise<{ conversation?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ userOneId: session.user.id }, { userTwoId: session.user.id }],
    },
    select: {
      id: true,
      userOneId: true,
      userTwoId: true,
      lastMessageAt: true,
      messages: {
        select: {
          id: true,
          body: true,
          senderId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
  });

  const otherUserIds = Array.from(
    new Set(conversations.map((conversation) => getOtherUserId(conversation, session.user.id)))
  );

  const otherUsers = otherUserIds.length
    ? await prisma.user.findMany({
        where: { id: { in: otherUserIds } },
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          city: true,
          profession: true,
          photos: {
            where: { status: "APPROVED" },
            select: { url: true },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      })
    : [];

  const userMap = new Map(
    otherUsers.map((user) => [
      user.id,
      {
        id: user.id,
        name:
          user.name ??
          (`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Profile"),
        city: user.city,
        profession: user.profession,
        photoUrl: user.photos[0]?.url ?? null,
      },
    ])
  );

  const conversationItems = conversations
    .map((conversation) => {
      const otherUserId = getOtherUserId(conversation, session.user.id);
      const profile = userMap.get(otherUserId);
      if (!profile) return null;

      return {
        id: conversation.id,
        profile,
        lastMessage: conversation.messages[conversation.messages.length - 1] ?? null,
        messages: conversation.messages.map((message) => ({
          id: message.id,
          body: message.body,
          senderId: message.senderId,
          createdAt: message.createdAt.toISOString(),
        })),
      };
    })
    .filter(Boolean) as Array<{
    id: number;
    profile: {
      id: string;
      name: string;
      city: string | null;
      profession: string | null;
      photoUrl: string | null;
    };
    lastMessage: {
      id: number;
      body: string;
      senderId: string;
      createdAt: Date;
    } | null;
    messages: Array<{
      id: number;
      body: string;
      senderId: string;
      createdAt: string;
    }>;
  }>;

  const selectedConversationId = resolvedSearchParams?.conversation
    ? Number(resolvedSearchParams.conversation)
    : conversationItems[0]?.id;

  const selectedConversation =
    conversationItems.find((item) => item.id === selectedConversationId) ?? null;

  if (selectedConversation) {
    await prisma.message.updateMany({
      where: {
        conversationId: selectedConversation.id,
        senderId: { not: session.user.id },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[320px_1fr]">
        <aside className="glass-card h-fit rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl text-slate-900 dark:text-white">
                Conversations
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Chat with accepted matches.
              </p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:bg-white/10 dark:text-white">
              {conversationItems.length}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {conversationItems.length === 0 ? (
              <div className="rounded-2xl border border-white/40 bg-white/70 px-4 py-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No accepted matches yet. Once an interest is accepted, chat will appear here.
              </div>
            ) : (
              conversationItems.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/chat?conversation=${conversation.id}`}
                  className={`block rounded-2xl border px-4 py-3 text-sm transition ${
                    selectedConversation?.id === conversation.id
                      ? "border-brand-300 bg-brand-50/80 text-brand-700 dark:border-white/20 dark:bg-white/10 dark:text-white"
                      : "border-white/40 bg-white/70 text-slate-600 hover:border-brand-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={conversation.profile.photoUrl ?? "/profiles/p1.jpg"}
                      alt={conversation.profile.name}
                      className="h-12 w-12 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">
                        {conversation.profile.name}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {conversation.lastMessage?.body ?? "Start your conversation"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </aside>
        <ChatWindow
          currentUserId={session.user.id}
          selectedConversation={selectedConversation}
        />
      </main>
    </div>
  );
}
