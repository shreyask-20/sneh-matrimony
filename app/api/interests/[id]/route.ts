import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isInterestActionAllowed,
  normalizeConversationPair,
} from "@/lib/matchmaking";

type UpdateInterestPayload = {
  action?: "accept" | "decline" | "withdraw";
};

const actionStatusMap = {
  accept: "ACCEPTED",
  decline: "DECLINED",
  withdraw: "WITHDRAWN",
} as const;

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const actor = await prisma.user.findUnique({
      where: { id: userId },
      select: { isApproved: true },
    });

    if (!actor?.isApproved) {
      return NextResponse.json(
        { error: "Your account is pending admin approval." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const interestId = Number(id);
    if (isNaN(interestId)) {
      return NextResponse.json({ error: "Invalid ID." }, { status: 400 });
    }

    const body = (await request.json()) as UpdateInterestPayload;
    const action = body.action;

    if (!action || !(action in actionStatusMap)) {
      return NextResponse.json({ error: "Valid action is required." }, { status: 400 });
    }

    const interest = await prisma.interest.findUnique({
      where: { id: interestId },
    });

    if (!interest) {
      return NextResponse.json({ error: "Interest not found." }, { status: 404 });
    }

    if (action === "withdraw") {
      if (interest.fromUserId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (interest.toUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const nextStatus = actionStatusMap[action];
    if (!isInterestActionAllowed(interest.status, nextStatus)) {
      return NextResponse.json(
        { error: `Interest cannot be ${action}ed from ${interest.status.toLowerCase()} state.` },
        { status: 400 }
      );
    }

    if (nextStatus === "ACCEPTED") {
      const conversationPair = normalizeConversationPair(
        interest.fromUserId,
        interest.toUserId
      );

      const [updatedInterest, conversation] = await prisma.$transaction([
        prisma.interest.update({
          where: { id: interest.id },
          data: {
            status: nextStatus,
            respondedAt: new Date(),
          },
        }),
        prisma.conversation.upsert({
          where: {
            userOneId_userTwoId: conversationPair,
          },
          create: conversationPair,
          update: {},
        }),
      ]);

      return NextResponse.json({ interest: updatedInterest, conversation });
    }

    const updatedInterest = await prisma.interest.update({
      where: { id: interest.id },
      data: {
        status: nextStatus,
        respondedAt: action === "decline" ? new Date() : interest.respondedAt,
      },
    });

    return NextResponse.json({ interest: updatedInterest });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
