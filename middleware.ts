import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthToken } from "@/lib/auth-token";

const PROTECTED_PATHS = [
  "/browse",
  "/dashboard",
  "/chat",
  "/profile",
  "/preferred-matches",
  "/revive-account",
];

const TERMS_EXEMPT_PATHS = [
  "/terms",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/revive-account",
];

const DELETION_EXEMPT_PATHS = [
  "/revive-account",
  "/terms",
  "/login",
  "/api/profile/cancel-deletion",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let token;
  try {
    token = await getAuthToken(request);
  } catch {
    token = null;
  }

  const roleName = token?.roleName as "ADMIN" | "USER" | undefined;

  // ── Admin routes ────────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token || roleName !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── Terms acceptance check ──────────────────────────────────────────────────
  const isTermsExempt = TERMS_EXEMPT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (token && !isTermsExempt && !token.termsAccepted) {
    if (pathname === "/terms") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/terms", request.url));
  }

  // ── Pending deletion check ──────────────────────────────────────────────────
  const isDeletionExempt = DELETION_EXEMPT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (token?.deletionRequestedAt && !isDeletionExempt && pathname !== "/revive-account") {
    return NextResponse.redirect(new URL("/revive-account", request.url));
  }

  // ── Auto-redirect admins away from non-admin pages ──────────────────────────
  if (token && roleName === "ADMIN" && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // ── Protected user routes ───────────────────────────────────────────────────
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
