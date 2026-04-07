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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    status?: "APPROVED" | "REJECTED";
    remarks?: string;
  };
  if (!body.status) {
    return NextResponse.json(
      { error: "status is required" },
      { status: 400 }
    );
  }

  const photoId = Number(id);
  const existingPhoto = await prisma.photo.findUnique({
    where: { id: photoId },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!existingPhoto) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  if (body.status === "REJECTED") {
    await prisma.$transaction(async (tx) => {
      await tx.photo.delete({
        where: { id: photoId },
      });

      const [updatedUser, primaryPhoto] = await Promise.all([
        tx.user.findUnique({
          where: { id: existingPhoto.userId },
          select: { isApproved: true },
        }),
        tx.photo.findFirst({
          where: { userId: existingPhoto.userId },
          orderBy: { createdAt: "asc" },
          select: { status: true },
        }),
      ]);

      await tx.user.update({
        where: { id: existingPhoto.userId },
        data: {
          profileVisible:
            Boolean(updatedUser?.isApproved) &&
            primaryPhoto?.status === "APPROVED",
        },
      });
    });

    return NextResponse.json({ ok: true, removed: true });
  }

  const photo = await prisma.photo.update({
    where: { id: photoId },
    data: {
      status: "APPROVED",
      rejectionRemarks: null,
    },
  });

  const [updatedUser, primaryPhoto] = await prisma.$transaction([
    prisma.user.findUnique({
      where: { id: existingPhoto.userId },
      select: { isApproved: true },
    }),
    prisma.photo.findFirst({
      where: { userId: existingPhoto.userId },
      orderBy: { createdAt: "asc" },
      select: { status: true },
    }),
  ]);

  await prisma.user.update({
    where: { id: existingPhoto.userId },
    data: {
      profileVisible:
        Boolean(updatedUser?.isApproved) &&
        primaryPhoto?.status === "APPROVED",
    },
  });

  return NextResponse.json({ photo });
}
