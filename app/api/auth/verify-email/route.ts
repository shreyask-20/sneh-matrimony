import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=missing", request.url)
    );
  }

  const record = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!record) {
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=invalid", request.url)
    );
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: record.identifier, token } },
    });
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=expired", request.url)
    );
  }

  // Mark email as verified on the user
  await prisma.user.updateMany({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  // Clean up the token
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token } },
  });

  return NextResponse.redirect(
    new URL("/auth/verify-email?success=1", request.url)
  );
}
