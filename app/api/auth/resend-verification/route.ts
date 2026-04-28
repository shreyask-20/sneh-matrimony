import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "node:crypto";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  // Rate limit: 3 resend attempts per 15 minutes per IP
  const ip = getClientIp(request);
  if (isRateLimited(`resend-otp:${ip}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before requesting another code." },
      { status: 429 }
    );
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { email: true, emailVerified: true },
  });

  if (!user?.email) {
    return NextResponse.json({ error: "No email on account." }, { status: 400 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email is already verified." }, { status: 400 });
  }

  // Delete any existing OTPs for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: user.email },
  });

  const otp = String(10000 + crypto.randomInt(90000));
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token: otp,
      expires,
    },
  });

  await sendVerificationEmail(user.email, otp);

  return NextResponse.json({ ok: true });
}
