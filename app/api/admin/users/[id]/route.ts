import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { revalidateTag } from "next/cache";
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
  roleName?: "ADMIN" | "USER";
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
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { roleName: true, isApproved: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (body.decision && targetUser.roleName === "ADMIN") {
    return NextResponse.json(
      { error: "Admin accounts are not part of the approval workflow." },
      { status: 400 }
    );
  }

  const primaryPhoto = await prisma.photo.findFirst({
    where: { userId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      status: true,
    },
  });

  const updates: Record<string, unknown> = {};
  if (typeof body.profileVisible === "boolean") {
    if (body.profileVisible && !targetUser.isApproved) {
      return NextResponse.json(
        { error: "Cannot make the profile visible until the member is approved." },
        { status: 400 }
      );
    }
    if (
      body.profileVisible &&
      (!primaryPhoto || primaryPhoto.status !== "APPROVED")
    ) {
      return NextResponse.json(
        { error: "Cannot make the profile visible until the primary photo is approved." },
        { status: 400 }
      );
    }
    updates.profileVisible = body.profileVisible;
  }
  if (body.roleName === "ADMIN" || body.roleName === "USER") {
    updates.roleName = body.roleName;
  }
  if (body.decision === "APPROVED") {
    if (!primaryPhoto || primaryPhoto.status !== "APPROVED") {
      return NextResponse.json(
        {
          error:
            "Cannot approve profile until the primary photo is approved.",
        },
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
    // Bust the featured profiles cache so the landing page reflects changes immediately
    if ("isApproved" in updates || "profileVisible" in updates) {
      revalidateTag("featured-profiles");
    }
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
