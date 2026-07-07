import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** Production (HTTPS) uses the __Secure- prefixed session cookie. */
const useSecureSessionCookie =
  process.env.NODE_ENV === "production" ||
  process.env.NEXTAUTH_URL?.startsWith("https://") === true;

const sessionCookieName = useSecureSessionCookie
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

export async function getAuthToken(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "NEXTAUTH_SECRET is not set. Authentication is disabled. " +
        "Please set the NEXTAUTH_SECRET environment variable."
    );
  }

  return getToken({
    req,
    secret,
    secureCookie: useSecureSessionCookie,
    cookieName: sessionCookieName,
  });
}
