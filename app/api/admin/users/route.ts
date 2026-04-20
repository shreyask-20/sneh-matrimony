import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Prisma } from "@prisma/client";
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

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  // For pending status, get users with isApproved: false AND no rejection/block in approval log
  if (status === "pending") {
    const rejectedUsers = await prisma.approvalLog.findMany({
      where: {
        decision: {
          in: ["REJECTED", "BLOCKED"],
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    const rejectedUserIds = rejectedUsers.map((log) => log.userId);

    const users = await prisma.user.findMany({
      where: {
        roleName: "USER",
        isApproved: false,
        id: {
          notIn: rejectedUserIds,
        },
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        gender: true,
        profession: true,
        education: true,
        city: true,
        bio: true,
        birthDate: true,
        maritalStatus: true,
        height: true,
        createdAt: true,
        isApproved: true,
        profileVisible: true,
        roleName: true,
        photos: {
          select: {
            id: true,
            url: true,
            status: true,
            rejectionRemarks: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  }

  // For all status, return all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      gender: true,
      profession: true,
      education: true,
      city: true,
      bio: true,
      birthDate: true,
      maritalStatus: true,
      height: true,
      createdAt: true,
      isApproved: true,
      profileVisible: true,
      roleName: true,
      photos: {
        select: {
          id: true,
          url: true,
          status: true,
          rejectionRemarks: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
