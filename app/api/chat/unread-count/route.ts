import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

    // Single bounded aggregation — one row per conversation with an unread
    // message, instead of pulling every unread message into memory (which grows
    // unbounded with message volume). Returns both counts from one query.
    const unreadGroups = await prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        readAt: null,
        senderId: { not: userId },
        conversation: {
          OR: [{ userOneId: userId }, { userTwoId: userId }],
        },
      },
      _count: { _all: true },
    });

    const unreadConversationCount = unreadGroups.length;
    const unreadMessageCount = unreadGroups.reduce(
      (sum, group) => sum + group._count._all,
      0
    );

    return NextResponse.json({ unreadConversationCount, unreadMessageCount });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
