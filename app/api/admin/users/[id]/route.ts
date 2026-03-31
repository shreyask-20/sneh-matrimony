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

type UpdatePayload = {
  decision?: "APPROVED" | "REJECTED" | "BLOCKED";
  remarks?: string;
  profileVisible?: boolean;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as UpdatePayload;

  const updates: Record<string, unknown> = {};
  if (typeof body.profileVisible === "boolean") {
    updates.profileVisible = body.profileVisible;
  }
  if (body.decision === "APPROVED") {
    const rejectedPhoto = await prisma.photo.findFirst({
      where: { userId: params.id, status: "REJECTED" },
      select: { id: true },
    });
    if (rejectedPhoto) {
      return NextResponse.json(
        { error: "Cannot approve profile with rejected photos." },
        { status: 400 }
      );
    }
    updates.isApproved = true;
    updates.profileVisible = true;
  }
  if (body.decision === "REJECTED" || body.decision === "BLOCKED") {
    updates.isApproved = false;
    updates.profileVisible = false;
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({
      where: { id },
      data: updates,
    });
  }

  if (body.decision) {
    await prisma.approvalLog.create({
      data: {
        adminId: session.user.id,
        userId: id,
        decision: body.decision,
        remarks: body.remarks ?? null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
