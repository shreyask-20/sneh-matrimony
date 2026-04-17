import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "node:crypto";

export async function POST(request: NextRequest) {
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

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: user.email },
  });

  const newToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token: newToken,
      expires,
    },
  });

  await sendVerificationEmail(user.email, newToken);

  return NextResponse.json({ ok: true });
}
