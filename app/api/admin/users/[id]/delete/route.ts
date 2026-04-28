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

// POST /api/admin/users/[id]/delete — soft delete a user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { roleName: true, deletedAt: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.roleName === "ADMIN") {
    return NextResponse.json(
      { error: "Cannot delete admin accounts" },
      { status: 400 }
    );
  }

  if (targetUser.deletedAt) {
    return NextResponse.json(
      { error: "User is already deleted" },
      { status: 400 }
    );
  }

  // Soft delete — set deletedAt timestamp, hide profile
  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      profileVisible: false,
      isApproved: false,
    },
  });

  // Log the deletion
  await prisma.approvalLog.create({
    data: {
      adminId: session.user.id,
      userId: id,
      decision: "BLOCKED", // use BLOCKED as the closest semantic match for deletion
      remarks: "Account soft-deleted by admin",
    },
  });

  return NextResponse.json({ ok: true, deleted: true });
}

// DELETE /api/admin/users/[id]/delete — restore a soft-deleted user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { deletedAt: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!targetUser.deletedAt) {
    return NextResponse.json(
      { error: "User is not deleted" },
      { status: 400 }
    );
  }

  // Restore — clear deletedAt
  await prisma.user.update({
    where: { id },
    data: { deletedAt: null },
  });

  return NextResponse.json({ ok: true, restored: true });
}
