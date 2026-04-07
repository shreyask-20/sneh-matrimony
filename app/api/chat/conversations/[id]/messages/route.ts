import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getConversationForUser,
} from "@/lib/chat";
import { MAX_MESSAGES_PER_USER_PER_CONVERSATION } from "@/lib/chatConfig";

type SendMessagePayload = {
  body?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const messageBody = body.body?.trim();
  if (!messageBody) {
    return NextResponse.json({ error: "Message body is required." }, { status: 400 });
  }

  const conversation = await getConversationForUser(
    conversationId,
    session.user.id
  );

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const message = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT 1 FROM "Conversation" WHERE id = ${conversationId} FOR UPDATE`;

    const sentMessageCount = await tx.message.count({
      where: {
        conversationId,
        senderId: session.user.id,
      },
    });

    if (sentMessageCount >= MAX_MESSAGES_PER_USER_PER_CONVERSATION) {
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
      data: {
        lastMessageAt: created.createdAt,
      },
    });

    return created;
  });

  if (!message) {
    return NextResponse.json(
      {
        error: `You can send at most ${MAX_MESSAGES_PER_USER_PER_CONVERSATION} messages in this match.`,
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ message }, { status: 201 });
}
