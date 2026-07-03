import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthToken } from "@/lib/auth-token";

// Routes that require a signed-in user (any role)
const PROTECTED_PATHS = [
  "/browse",
  "/dashboard",
  "/chat",
  "/profile",
  "/preferred-matches",
];

// Routes that should be accessible even without terms acceptance
const TERMS_EXEMPT_PATHS = ["/terms", "/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getAuthToken(request);

  const roleName = token?.roleName as string | undefined;

  // ── Admin routes ────────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token || roleName !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── Auto-redirect admins away from non-admin pages ──────────────────────────
  if (token && roleName === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // ── Protected user routes ───────────────────────────────────────────────────
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    // Preserve the intended destination so we can redirect back after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Terms acceptance check ──────────────────────────────────────────────────
  // If logged in but hasn't accepted terms, redirect to /terms
  const isTermsExempt = TERMS_EXEMPT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (token && !isTermsExempt && token.termsAccepted === false) {
    return NextResponse.redirect(new URL("/terms", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
