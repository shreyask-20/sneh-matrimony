import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

async function requireUser(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) return null;
  return token.id as string;
}

// GET /api/block — list all blocked user IDs
export async function GET(request: NextRequest) {
  const userId = await requireUser(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blocks = await prisma.block.findMany({
    where: { blockerId: userId },
    select: { blockedUserId: true },
  });

  return NextResponse.json({ blocked: blocks.map((b) => b.blockedUserId) });
}

// POST /api/block — block a user
export async function POST(request: NextRequest) {
  const userId = await requireUser(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { blockedUserId?: string; reason?: string };
  const blockedUserId = body.blockedUserId?.trim();

  if (!blockedUserId) {
    return NextResponse.json({ error: "blockedUserId is required" }, { status: 400 });
  }

  if (blockedUserId === userId) {
    return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: blockedUserId },
    select: { id: true },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const block = await prisma.block.upsert({
    where: { blockerId_blockedUserId: { blockerId: userId, blockedUserId } },
    create: { blockerId: userId, blockedUserId, reason: body.reason ?? null },
    update: {},
  });

  return NextResponse.json({ block }, { status: 201 });
}

// DELETE /api/block?blockedUserId=xxx — unblock a user
export async function DELETE(request: NextRequest) {
  const userId = await requireUser(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const blockedUserId = searchParams.get("blockedUserId");

  if (!blockedUserId) {
    return NextResponse.json({ error: "blockedUserId is required" }, { status: 400 });
  }

  await prisma.block.deleteMany({ where: { blockerId: userId, blockedUserId } });

  return NextResponse.json({ ok: true });
}
