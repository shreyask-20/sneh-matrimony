import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "node:crypto";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
  const ip = getClientIp(request);
  if (await isRateLimited(`forgot-password:${ip}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 }
    );
  }

  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Please enter your email address." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  // Don't reveal whether the email exists — always return ok
  if (!user?.email) {
    return NextResponse.json({ ok: true });
  }

  await prisma.verificationToken.deleteMany({
    where: { identifier: user.email },
  });

  const otp = String(10000 + crypto.randomInt(90000));
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token: otp,
      expires,
    },
  });

  await sendPasswordResetEmail(user.email, otp);

  return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
