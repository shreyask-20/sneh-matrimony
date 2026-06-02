import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `Sneh Matrimony <${process.env.EMAIL_FROM ?? "noreply@snehmatrimony.com"}>`;
const ADMIN_EMAIL = "snehmatrimonyindia@gmail.com";

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron (or an authorized caller)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Delete expired OTP verification tokens
  const deletedTokens = await prisma.verificationToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });

  // 2. Gather daily stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    newUsersToday,
    pendingApprovals,
    pendingPhotos,
    totalInterests,
    acceptedInterests,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null, roleName: "USER" } }),
    prisma.user.count({ where: { createdAt: { gte: today }, roleName: "USER" } }),
    prisma.user.count({ where: { isApproved: false, deletedAt: null, roleName: "USER" } }),
    prisma.photo.count({ where: { status: "PENDING" } }),
    prisma.interest.count(),
    prisma.interest.count({ where: { status: "ACCEPTED" } }),
  ]);

  // 3. Send summary email to admin
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Sneh Matrimony – Daily Report ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:16px;">
        <h2 style="font-size:22px;color:#9b1c4a;margin-bottom:4px;">Daily Summary</h2>
        <p style="color:#94a3b8;font-size:13px;margin-bottom:28px;">
          ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>

        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#fdf2f6;">
            <td style="padding:12px 16px;font-size:14px;color:#475569;border-radius:8px 0 0 8px;">Total Members</td>
            <td style="padding:12px 16px;font-size:18px;font-weight:700;color:#1e0a14;text-align:right;border-radius:0 8px 8px 0;">${totalUsers}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:14px;color:#475569;">New Registrations Today</td>
            <td style="padding:12px 16px;font-size:18px;font-weight:700;color:#9b1c4a;text-align:right;">${newUsersToday}</td>
          </tr>
          <tr style="background:#fdf2f6;">
            <td style="padding:12px 16px;font-size:14px;color:#475569;border-radius:8px 0 0 8px;">Pending Approvals</td>
            <td style="padding:12px 16px;font-size:18px;font-weight:700;color:${pendingApprovals > 0 ? "#d97706" : "#1e0a14"};text-align:right;border-radius:0 8px 8px 0;">${pendingApprovals}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:14px;color:#475569;">Photos Awaiting Review</td>
            <td style="padding:12px 16px;font-size:18px;font-weight:700;color:${pendingPhotos > 0 ? "#d97706" : "#1e0a14"};text-align:right;">${pendingPhotos}</td>
          </tr>
          <tr style="background:#fdf2f6;">
            <td style="padding:12px 16px;font-size:14px;color:#475569;border-radius:8px 0 0 8px;">Total Interests Sent</td>
            <td style="padding:12px 16px;font-size:18px;font-weight:700;color:#1e0a14;text-align:right;border-radius:0 8px 8px 0;">${totalInterests}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:14px;color:#475569;">Accepted Matches</td>
            <td style="padding:12px 16px;font-size:18px;font-weight:700;color:#059669;text-align:right;">${acceptedInterests}</td>
          </tr>
          <tr style="background:#fdf2f6;">
            <td style="padding:12px 16px;font-size:14px;color:#475569;border-radius:8px 0 0 8px;">Expired OTPs Cleaned</td>
            <td style="padding:12px 16px;font-size:18px;font-weight:700;color:#1e0a14;text-align:right;border-radius:0 8px 8px 0;">${deletedTokens.count}</td>
          </tr>
        </table>

        ${pendingApprovals > 0 ? `
        <div style="margin-top:24px;padding:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;">
          <p style="margin:0;font-size:14px;color:#92400e;">
            ⚠️ <strong>${pendingApprovals} member${pendingApprovals === 1 ? "" : "s"}</strong> waiting for approval.
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sneh-matrimony.vercel.app"}/admin" style="color:#9b1c4a;font-weight:600;">Review now →</a>
          </p>
        </div>
        ` : ""}

        <p style="margin-top:28px;color:#94a3b8;font-size:12px;text-align:center;">
          This is an automated daily report from Sneh Matrimony.
        </p>
      </div>
    `,
  });

  return NextResponse.json({
    ok: true,
    deletedExpiredTokens: deletedTokens.count,
    stats: { totalUsers, newUsersToday, pendingApprovals, pendingPhotos, totalInterests, acceptedInterests },
  });
}
