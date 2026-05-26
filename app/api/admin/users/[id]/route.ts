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

const requiredProfileFields = [
  ["Name", "name"],
  ["Email", "email"],
  ["Phone", "phone"],
  ["Gender", "gender"],
  ["City", "city"],
  ["Date of birth", "birthDate"],
  ["Profession", "profession"],
  ["Education", "education"],
  ["Marital status", "maritalStatus"],
  ["Height", "height"],
  ["Bio", "bio"],
] as const;

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
    select: {
      roleName: true,
      isApproved: true,
      name: true,
      email: true,
      emailVerified: true,
      phone: true,
      gender: true,
      city: true,
      birthDate: true,
      profession: true,
      education: true,
      maritalStatus: true,
      height: true,
      bio: true,
    },
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

  const photos = await prisma.photo.findMany({
    where: { userId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      status: true,
    },
  });
  const primaryPhoto = photos[0] ?? null;
  const rejectedPhotoCount = photos.filter(
    (photo) => photo.status === "REJECTED"
  ).length;
  const missingRequiredFields = requiredProfileFields
    .filter(([, key]) => {
      const value = targetUser[key];
      return typeof value === "string" ? value.trim().length === 0 : !value;
    })
    .map(([label]) => label);

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
    if (body.profileVisible && missingRequiredFields.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot make the profile visible until required fields are complete: ${missingRequiredFields.join(", ")}.`,
        },
        { status: 400 }
      );
    }
    if (body.profileVisible && !targetUser.emailVerified) {
      return NextResponse.json(
        { error: "Cannot make the profile visible until email is verified." },
        { status: 400 }
      );
    }
    if (body.profileVisible && rejectedPhotoCount > 0) {
      return NextResponse.json(
        { error: "Cannot make the profile visible while photos are rejected." },
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
    if (missingRequiredFields.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot approve profile until required fields are complete: ${missingRequiredFields.join(", ")}.`,
        },
        { status: 400 }
      );
    }
    if (!targetUser.emailVerified) {
      return NextResponse.json(
        { error: "Cannot approve profile until email is verified." },
        { status: 400 }
      );
    }
    if (rejectedPhotoCount > 0) {
      return NextResponse.json(
        { error: "Cannot approve profile while photos are rejected." },
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
