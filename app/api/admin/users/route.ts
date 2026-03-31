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

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where =
    status === "pending"
      ? { roleName: "USER", isApproved: false }
      : { roleName: "USER" };

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      gender: true,
      city: true,
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
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
