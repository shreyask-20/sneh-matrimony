import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as { otp?: string };
  const otp = body.otp?.trim();

  if (!otp || !/^\d{5}$/.test(otp)) {
    return NextResponse.json({ error: "Please enter a valid 5-digit code." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { email: true, emailVerified: true },
  });

  if (!user?.email) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email is already verified." }, { status: 400 });
  }

  const record = await prisma.verificationToken.findFirst({
    where: { identifier: user.email },
  });

  if (!record) {
    return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 });
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier: user.email } });
    return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
  }

  if (record.token !== otp) {
    return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
  }

  // Mark email as verified
  await prisma.user.update({
    where: { id: token.id as string },
    data: { emailVerified: new Date() },
  });

  // Clean up the OTP
  await prisma.verificationToken.deleteMany({ where: { identifier: user.email } });

  return NextResponse.json({ ok: true });
}
