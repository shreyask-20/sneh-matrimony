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

      const approvedPhotoCount = await tx.photo.count({
        where: {
          userId: existingPhoto.userId,
          status: "APPROVED",
        },
      });

      if (approvedPhotoCount === 0) {
        await tx.user.update({
          where: { id: existingPhoto.userId },
          data: {
            profileVisible: false,
          },
        });
      }
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

  return NextResponse.json({ photo });
}
