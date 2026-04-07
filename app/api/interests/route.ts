import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeConversationPair } from "@/lib/matchmaking";

type CreateInterestPayload = {
  toUserId?: string;
  message?: string;
};

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function GET() {
  const userId = await requireUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [received, sent, accepted] = await Promise.all([
    prisma.interest.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            city: true,
            profession: true,
            photos: {
              where: { status: "APPROVED" },
              select: { url: true },
              take: 1,
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.interest.findMany({
      where: { fromUserId: userId },
      include: {
        toUser: {
          select: {
            id: true,
            name: true,
            city: true,
            profession: true,
            photos: {
              where: { status: "APPROVED" },
              select: { url: true },
              take: 1,
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.interest.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            city: true,
            profession: true,
            photos: {
              where: { status: "APPROVED" },
              select: { url: true },
              take: 1,
              orderBy: { createdAt: "asc" },
            },
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            city: true,
            profession: true,
            photos: {
              where: { status: "APPROVED" },
              select: { url: true },
              take: 1,
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return NextResponse.json({ received, sent, accepted });
}

export async function POST(request: Request) {
  const userId = await requireUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateInterestPayload;
  const toUserId = body.toUserId?.trim();
  const message = body.message?.trim() || null;

  if (!toUserId) {
    return NextResponse.json({ error: "toUserId is required" }, { status: 400 });
  }

  if (toUserId === userId) {
    return NextResponse.json(
      { error: "You cannot send interest to your own profile." },
      { status: 400 }
    );
  }

  const [targetUser, blockedRecord, existingInterest, reciprocalInterest] =
    await Promise.all([
      prisma.user.findFirst({
        where: {
          id: toUserId,
          roleName: "USER",
          isApproved: true,
          profileVisible: true,
        },
        select: { id: true },
      }),
      prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedUserId: toUserId },
            { blockerId: toUserId, blockedUserId: userId },
          ],
        },
        select: { id: true },
      }),
      prisma.interest.findUnique({
        where: {
          fromUserId_toUserId: {
            fromUserId: userId,
            toUserId,
          },
        },
      }),
      prisma.interest.findUnique({
        where: {
          fromUserId_toUserId: {
            fromUserId: toUserId,
            toUserId: userId,
          },
        },
      }),
    ]);

  if (!targetUser) {
    return NextResponse.json({ error: "Profile not available." }, { status: 404 });
  }

  if (blockedRecord) {
    return NextResponse.json(
      { error: "This profile is not available for interaction." },
      { status: 403 }
    );
  }

  if (existingInterest?.status === "PENDING" || existingInterest?.status === "ACCEPTED") {
    return NextResponse.json(
      { error: "Interest already exists for this profile." },
      { status: 409 }
    );
  }

  if (reciprocalInterest?.status === "PENDING") {
    const conversationPair = normalizeConversationPair(userId, toUserId);

    const [interest, conversation] = await prisma.$transaction([
      prisma.interest.update({
        where: { id: reciprocalInterest.id },
        data: {
          status: "ACCEPTED",
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

    return NextResponse.json(
      {
        interest,
        conversation,
        acceptedExistingInterest: true,
      },
      { status: 200 }
    );
  }

  const interest = existingInterest
    ? await prisma.interest.update({
        where: { id: existingInterest.id },
        data: {
          status: "PENDING",
          message,
          respondedAt: null,
        },
      })
    : await prisma.interest.create({
        data: {
          fromUserId: userId,
          toUserId,
          message,
        },
      });

  return NextResponse.json({ interest }, { status: 201 });
}
