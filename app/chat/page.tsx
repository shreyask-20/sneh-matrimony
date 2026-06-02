import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import Navbar from "../../components/shared/Navbar";
import ChatWindow from "../../components/chat/ChatWindow";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOtherUserId } from "@/lib/chat";
import { MAX_MESSAGES_PER_USER_PER_CONVERSATION } from "@/lib/chatConfig";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Messages",
  description: "Chat with your matched connections on Sneh Matrimony.",
  robots: { index: false, follow: false },
};

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
  if (session.user.roleName === "ADMIN") {
    redirect("/admin");
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
          readAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
  });

  const otherUserIds = Array.from(
    new Set(conversations.map((c) => getOtherUserId(c, session.user.id)))
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
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
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

      const unreadCount = conversation.messages.filter(
        (m) => m.senderId !== session.user.id && !m.readAt
      ).length;

      return {
        id: conversation.id,
        profile,
        lastMessage: conversation.messages[conversation.messages.length - 1] ?? null,
        unreadCount,
        messages: conversation.messages.map((m) => ({
          id: m.id,
          body: m.body,
          senderId: m.senderId,
          createdAt: m.createdAt.toISOString(),
        })),
      };
    })
    .filter(Boolean) as Array<{
    id: number;
    profile: { id: string; name: string; city: string | null; profession: string | null; photoUrl: string | null };
    lastMessage: { id: number; body: string; senderId: string; createdAt: Date } | null;
    unreadCount: number;
    messages: Array<{ id: number; body: string; senderId: string; createdAt: string }>;
  }>;

  const selectedConversationId = resolvedSearchParams?.conversation
    ? Number(resolvedSearchParams.conversation)
    : conversationItems[0]?.id;

  const selectedConversation =
    conversationItems.find((item) => item.id === selectedConversationId) ?? null;

  const selectedConversationMessageCount =
    selectedConversation?.messages.filter((m) => m.senderId === session.user.id).length ?? 0;
  const remainingMessages = Math.max(
    0,
    MAX_MESSAGES_PER_USER_PER_CONVERSATION - selectedConversationMessageCount
  );

  if (selectedConversation) {
    await prisma.message.updateMany({
      where: {
        conversationId: selectedConversation.id,
        senderId: { not: session.user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Navbar />
      <main className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[340px_1fr]">
        {/* ── Sidebar ── */}
        <aside
          className={`flex flex-col border-r border-white/30 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 ${
            selectedConversation ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Sidebar header */}
          <div className="border-b border-white/30 bg-gradient-to-br from-brand-50/80 to-white/60 px-5 py-5 dark:border-white/10 dark:from-white/5 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 shadow-sm">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-slate-900 dark:text-white">
                    Messages
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {conversationItems.length} conversation{conversationItems.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {conversationItems.some((c) => c.unreadCount > 0) && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                  {conversationItems.reduce((sum, c) => sum + c.unreadCount, 0)}
                </span>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {conversationItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 dark:bg-white/5">
                  <MessageCircle className="h-7 w-7 text-brand-400" />
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-200">No conversations yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Once an interest is accepted, your chat will appear here.
                </p>
                <Link
                  href="/browse"
                  className="mt-2 rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Browse matches
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/20 dark:divide-white/5">
                {conversationItems.map((conversation) => {
                  const isActive = selectedConversation?.id === conversation.id;
                  return (
                    <Link
                      key={conversation.id}
                      href={`/chat?conversation=${conversation.id}`}
                      className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                        isActive
                          ? "bg-brand-50/90 dark:bg-white/10"
                          : "hover:bg-white/60 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conversation.profile.photoUrl ?? "/profiles/p1.jpg"}
                          alt={conversation.profile.name}
                          className="h-12 w-12 rounded-2xl object-cover shadow-sm"
                        />
                        {/* Online dot placeholder */}
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-950" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`truncate text-sm font-semibold ${isActive ? "text-brand-700 dark:text-white" : "text-slate-900 dark:text-white"}`}>
                            {conversation.profile.name}
                          </p>
                          {conversation.lastMessage && (
                            <span className="shrink-0 text-[10px] text-slate-400">
                              {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {conversation.lastMessage?.body ?? "Start your conversation"}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ── Chat window ── */}
        <div className={`${selectedConversation ? "flex" : "hidden lg:flex"} min-h-0 flex-col`}>
          <ChatWindow
            currentUserId={session.user.id}
            selectedConversation={selectedConversation}
            remainingMessages={remainingMessages}
          />
        </div>
      </main>
    </div>
  );
}
