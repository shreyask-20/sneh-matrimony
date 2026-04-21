import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const roleName = token?.roleName as string | undefined;

  // Protect /admin — only ADMIN role allowed
  if (pathname.startsWith("/admin")) {
    if (!token || roleName !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Redirect already-verified users away from the verify-email page
  if (pathname === "/auth/verify-email" && token?.id) {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { emailVerified: true },
    });
    if (user?.emailVerified) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Auto-redirect admins to /admin when they land on non-admin pages
  if (token && roleName === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
