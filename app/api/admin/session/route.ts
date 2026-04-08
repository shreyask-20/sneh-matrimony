import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ roleName: null }, { status: 200 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { roleName: true },
  });

  return NextResponse.json({
    roleName: user?.roleName ?? null,
  });
}
