import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

const DELETE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.roleName === "ADMIN") {
      return NextResponse.json({ error: "Admins cannot delete their account." }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { deletionRequestedAt: true, deletedAt: true, lastCanceledDeletionAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.deletedAt) {
      return NextResponse.json({ error: "Account is already deleted." }, { status: 400 });
    }

    if (user.deletionRequestedAt) {
      return NextResponse.json(
        { error: "Deletion is already in progress. Log in again to revive your account." },
        { status: 400 }
      );
    }

    if (user.lastCanceledDeletionAt) {
      const cooldownExpiresAt = new Date(user.lastCanceledDeletionAt.getTime() + DELETE_COOLDOWN_MS);
      if (cooldownExpiresAt > new Date()) {
        const remainingDays = Math.ceil(
          (cooldownExpiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        );
        return NextResponse.json(
          {
            error: `You recently revived your account. Please wait ${remainingDays} more day${remainingDays === 1 ? "" : "s"} before requesting deletion again. (Available after ${cooldownExpiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })})`,
          },
          { status: 400 }
        );
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        deletionRequestedAt: new Date(),
        profileVisible: false,
        isApproved: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
