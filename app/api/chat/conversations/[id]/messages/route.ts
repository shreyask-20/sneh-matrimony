import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getConversationForUser } from "@/lib/chat";
import {
  MAX_MESSAGES_PER_USER_PER_CONVERSATION,
  MAX_MESSAGES_PREMIUM_PER_USER_PER_CONVERSATION,
} from "@/lib/chatConfig";
import { sanitizeString, VALIDATION, badRequest } from "@/lib/validation";

type SendMessagePayload = {
  body?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const conversationId = Number(id);
    if (Number.isNaN(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });
    }

    const body = (await request.json()) as SendMessagePayload;
    const messageBody = sanitizeString(body.body, VALIDATION.MAX_MESSAGE_LENGTH);
    if (!messageBody) {
      return badRequest("Message body is required.");
    }

    const conversation = await getConversationForUser(conversationId, session.user.id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    // Check if user has active premium
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true, premiumExpiresAt: true },
    });

    const isPremiumActive =
      currentUser?.isPremium &&
      (currentUser.premiumExpiresAt === null ||
        currentUser.premiumExpiresAt > new Date());

    const messageLimit = isPremiumActive
      ? MAX_MESSAGES_PREMIUM_PER_USER_PER_CONVERSATION
      : MAX_MESSAGES_PER_USER_PER_CONVERSATION;

    const message = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM "Conversation" WHERE id = ${conversationId} FOR UPDATE`;

      const sentMessageCount = await tx.message.count({
        where: {
          conversationId,
          senderId: session.user.id,
        },
      });

      if (sentMessageCount >= messageLimit) {
        return null;
      }

      const created = await tx.message.create({
        data: {
          conversationId,
          senderId: session.user.id,
          body: messageBody,
        },
        select: {
          id: true,
          body: true,
          senderId: true,
          createdAt: true,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: created.createdAt },
      });

      return created;
    });

    if (!message) {
      return NextResponse.json(
        {
          error: isPremiumActive
            ? `Premium members can send up to ${MAX_MESSAGES_PREMIUM_PER_USER_PER_CONVERSATION} messages per match.`
            : `Free members can send up to ${MAX_MESSAGES_PER_USER_PER_CONVERSATION} messages per match. Upgrade to Premium for more.`,
          limitReached: true,
          isPremium: isPremiumActive,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
