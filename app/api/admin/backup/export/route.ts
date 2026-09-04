import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, roleName: true },
  });
  if (!user || user.roleName !== "ADMIN") return null;
  return user;
}

const PAGE_SIZE = 1000;

async function fetchAll<T>(
  findMany: (args: { skip: number; take: number }) => Promise<T[]>
): Promise<T[]> {
  const rows: T[] = [];
  let skip = 0;
  for (;;) {
    const batch = await findMany({ skip, take: PAGE_SIZE });
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }
  return rows;
}

/**
 * Admin-only full-database export as a single JSON file.
 * - Includes User.password hashes (needed for lossless restore).
 * - Hashes are only ever sent as a file download, never rendered in UI.
 * - Writes a BackupLog row so the admin panel can show "last backup".
 */
export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate-limit manual exports: 5 per day per admin (fail-open if Redis down).
    if (await isRateLimited(`admin-backup:${admin.id}`, 5, 24 * 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many backup requests. Try again later." },
        { status: 429 }
      );
    }
    void getClientIp(request);

    const [users, familyDetails, horoscopes, preferences, approvalLogs, photos,
      interests, conversations, messages, shortlists, blocks, accounts,
      payments, subscriptions, verificationTokens] = await Promise.all([
      fetchAll((p) => prisma.user.findMany({ ...p, orderBy: { createdAt: "asc" } })),
      fetchAll((p) => prisma.familyDetails.findMany({ ...p, orderBy: { id: "asc" } })),
      fetchAll((p) => prisma.horoscope.findMany({ ...p, orderBy: { id: "asc" } })),
      fetchAll((p) => prisma.preferences.findMany({ ...p, orderBy: { id: "asc" } })),
      fetchAll((p) => prisma.approvalLog.findMany({ ...p, orderBy: { id: "asc" } })),
      fetchAll((p) => prisma.photo.findMany({ ...p, orderBy: { id: "asc" } })),
      fetchAll((p) => prisma.interest.findMany({ ...p, orderBy: { id: "asc" } })),
      fetchAll((p) => prisma.conversation.findMany({ ...p, orderBy: { id: "asc" } })),
      fetchAll((p) => prisma.message.findMany({ ...p, orderBy: { id: "asc" } })),
      fetchAll((p) => prisma.shortlist.findMany({ ...p, orderBy: { id: "asc" } })),
      fetchAll((p) => prisma.block.findMany({ ...p, orderBy: { id: "asc" } })),
      fetchAll((p) => prisma.account.findMany({ ...p, orderBy: { id: "asc" } })),
      fetchAll((p) => prisma.payment.findMany({ ...p, orderBy: { createdAt: "asc" } })),
      fetchAll((p) => prisma.subscription.findMany({ ...p, orderBy: { createdAt: "asc" } })),
      fetchAll((p) => prisma.verificationToken.findMany({ ...p, orderBy: { expires: "asc" } })),
    ]);

    const tables = {
      users, familyDetails, horoscopes, preferences, approvalLogs, photos,
      interests, conversations, messages, shortlists, blocks, accounts,
      payments, subscriptions, verificationTokens,
    };
    const counts = Object.fromEntries(
      Object.entries(tables).map(([k, v]) => [k, (v as unknown[]).length])
    );
    const exportedAt = new Date();
    const fileName = `sneh-backup-${exportedAt.toISOString().slice(0, 10)}.json`;
    const payload = JSON.stringify(
      { meta: { exportedAt, fileName, version: 1, counts }, tables },
      null,
      0
    );
    const fileSizeBytes = Buffer.byteLength(payload, "utf8");

    await prisma.backupLog.create({
      data: {
        adminId: admin.id,
        exportedAt,
        fileName,
        userCount: users.length,
        counts,
        fileSizeBytes,
        status: "SUCCESS",
      },
    });

    return new NextResponse(payload, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Backup-Exported-At": exportedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin backup export failed:", error);
    return NextResponse.json(
      { error: "Backup export failed. Please try again." },
      { status: 500 }
    );
  }
}
