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

  const unreadMessages = await prisma.message.findMany({
    where: {
      readAt: null,
      senderId: { not: session.user.id },
      conversation: {
        OR: [{ userOneId: session.user.id }, { userTwoId: session.user.id }],
      },
    },
    select: {
      conversationId: true,
    },
    distinct: ["conversationId"],
  });

  const unreadConversationCount = unreadMessages.length;

  const unreadMessageCount = await prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: session.user.id },
      conversation: {
        OR: [{ userOneId: session.user.id }, { userTwoId: session.user.id }],
      },
    },
  });

  return NextResponse.json({
    unreadConversationCount,
    unreadMessageCount,
  });
}
