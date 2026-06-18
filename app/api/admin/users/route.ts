import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { roleName: true },
  });
  if (!user || user.roleName !== "ADMIN") return null;
  return session;
}

const USER_SELECT = {
  id: true,
  name: true,
  firstName: true,
  lastName: true,
  email: true,
  emailVerified: true,
  phone: true,
  gender: true,
  profession: true,
  education: true,
  city: true,
  religion: true,
  bio: true,
  birthDate: true,
  maritalStatus: true,
  height: true,
  createdAt: true,
  deletedAt: true,
  isApproved: true,
  isPremium: true,
  premiumExpiresAt: true,
  profileVisible: true,
  roleName: true,
  photos: {
    select: {
      id: true,
      url: true,
      status: true,
      rejectionRemarks: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status   = searchParams.get("status");      // pending | all | deleted
  const search   = searchParams.get("search")?.trim() || null;
  const gender   = searchParams.get("gender")?.trim() || null;
  const city     = searchParams.get("city")?.trim() || null;
  const religion = searchParams.get("religion")?.trim() || null;

  // Build search conditions
  const searchConditions = search
    ? {
        OR: [
          { name:      { contains: search, mode: "insensitive" as const } },
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName:  { contains: search, mode: "insensitive" as const } },
          { email:     { contains: search, mode: "insensitive" as const } },
          { phone:     { contains: search, mode: "insensitive" as const } },
          { city:      { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const filterConditions = {
    ...(gender   ? { gender:   { equals: gender,   mode: "insensitive" as const } } : {}),
    ...(city     ? { city:     { contains: city,     mode: "insensitive" as const } } : {}),
    ...(religion ? { religion: { contains: religion, mode: "insensitive" as const } } : {}),
  };

  // Deleted users tab
  if (status === "deleted") {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: { not: null },
        ...searchConditions,
        ...filterConditions,
      },
      select: USER_SELECT,
      orderBy: { deletedAt: "desc" },
    });
    return NextResponse.json({ users });
  }

  // Pending queue — unapproved users with no rejection/block log
  if (status === "pending") {
    const rejectedUsers = await prisma.approvalLog.findMany({
      where: { decision: { in: ["REJECTED", "BLOCKED"] } },
      select: { userId: true },
      distinct: ["userId"],
    });
    const rejectedUserIds = rejectedUsers.map((log) => log.userId);

    const users = await prisma.user.findMany({
      where: {
        roleName: "USER",
        isApproved: false,
        deletedAt: null,
        id: { notIn: rejectedUserIds },
        ...searchConditions,
        ...filterConditions,
      },
      select: USER_SELECT,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  }

  // All active users (default)
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...searchConditions,
      ...filterConditions,
    },
    select: USER_SELECT,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
