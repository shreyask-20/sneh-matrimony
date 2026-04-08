import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const currentOrigin = request.nextUrl.origin;

  const resolveCurrentRole = async () => {
    const response = await fetch(new URL("/api/admin/session", currentOrigin), {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { roleName?: string | null };
    return data.roleName ?? null;
  };

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const tokenRoleName = token?.roleName;

  if (pathname.startsWith("/admin")) {
    if (!token || tokenRoleName !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const currentRole = await resolveCurrentRole();
    if (currentRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (tokenRoleName === "ADMIN") {
    const currentRole = await resolveCurrentRole();
    if (currentRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
