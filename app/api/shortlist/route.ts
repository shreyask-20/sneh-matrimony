import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

async function requireUser(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) return null;
  return token.id as string;
}

// GET /api/shortlist — list all shortlisted profile IDs for the current user
export async function GET(request: NextRequest) {
  const userId = await requireUser(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shortlists = await prisma.shortlist.findMany({
    where: { userId },
    select: { profileUserId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ shortlisted: shortlists.map((s) => s.profileUserId) });
}

// POST /api/shortlist — add a profile to shortlist
export async function POST(request: NextRequest) {
  const userId = await requireUser(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { profileUserId?: string };
  const profileUserId = body.profileUserId?.trim();

  if (!profileUserId) {
    return NextResponse.json({ error: "profileUserId is required" }, { status: 400 });
  }

  if (profileUserId === userId) {
    return NextResponse.json({ error: "Cannot shortlist yourself" }, { status: 400 });
  }

  // Verify target user exists and is visible
  const target = await prisma.user.findFirst({
    where: { id: profileUserId, isApproved: true, profileVisible: true },
    select: { id: true },
  });

  if (!target) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const shortlist = await prisma.shortlist.upsert({
    where: { userId_profileUserId: { userId, profileUserId } },
    create: { userId, profileUserId },
    update: {},
  });

  return NextResponse.json({ shortlist }, { status: 201 });
}

// DELETE /api/shortlist?profileUserId=xxx — remove from shortlist
export async function DELETE(request: NextRequest) {
  const userId = await requireUser(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const profileUserId = searchParams.get("profileUserId");

  if (!profileUserId) {
    return NextResponse.json({ error: "profileUserId is required" }, { status: 400 });
  }

  await prisma.shortlist.deleteMany({ where: { userId, profileUserId } });

  return NextResponse.json({ ok: true });
}
