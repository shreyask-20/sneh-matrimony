import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(`reset-password:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
      { status: 429 }
    );
  }

  const body = (await request.json()) as { email?: string; otp?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const otp = body.otp?.trim();
  const password = body.password;

  if (!email || !otp) {
    return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
  }

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email, token: otp },
  });

  if (!record) {
    return NextResponse.json(
      { error: "Invalid or expired code. Please request a new one." },
      { status: 400 }
    );
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    return NextResponse.json(
      { error: "Code has expired. Please request a new one." },
      { status: 400 }
    );
  }

  const hashedPassword = await hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    }),
    prisma.verificationToken.deleteMany({
      where: { identifier: email },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
