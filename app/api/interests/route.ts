import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeConversationPair } from "@/lib/matchmaking";
import { sanitizeString, VALIDATION, badRequest } from "@/lib/validation";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

type CreateInterestPayload = {
  toUserId?: string;
  message?: string;
};

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function GET(request: Request) {
  try {
    const userId = await requireUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Bound each list so a large interest history can't be returned in one
    // response. Default 100, capped at 200 per list.
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      200,
      Math.max(1, Number(searchParams.get("limit")) || 100)
    );

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
        take: limit,
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
        take: limit,
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
        take: limit,
      }),
    ]);

    return NextResponse.json({ received, sent, accepted });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (await isRateLimited(`interests:${ip}`, 20, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before trying again." },
        { status: 429 }
      );
    }

    const userId = await requireUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { isApproved: true },
    });

    if (!sender?.isApproved) {
      return NextResponse.json(
        { error: "Your account is pending admin approval." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as CreateInterestPayload;
    const toUserId = sanitizeString(body.toUserId);
    const message = sanitizeString(body.message, VALIDATION.MAX_MESSAGE_LENGTH);

    if (!toUserId) {
      return badRequest("toUserId is required");
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
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
