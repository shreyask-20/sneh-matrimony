import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.roleName === "ADMIN") {
    return NextResponse.json({
      unreadConversationCount: 0,
      unreadMessageCount: 0,
    });
  }

  const userId = session.user.id;

  // Single query — group by conversationId to get both counts at once
  const unreadMessages = await prisma.message.findMany({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: {
        OR: [{ userOneId: userId }, { userTwoId: userId }],
      },
    },
    select: { conversationId: true },
  });

  const unreadMessageCount = unreadMessages.length;
  const unreadConversationCount = new Set(
    unreadMessages.map((m) => m.conversationId)
  ).size;

  return NextResponse.json({ unreadConversationCount, unreadMessageCount });
}
