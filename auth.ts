import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { RoleName } from "@prisma/client";

const useSecureCookies =
  process.env.NODE_ENV === "production" ||
  process.env.NEXTAUTH_URL?.startsWith("https://") === true;

// ── In-memory brute-force protection for login attempts ───────────────────────
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isLoginBlocked(identifier: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  if (!record || now > record.resetAt) {
    loginAttempts.delete(identifier);
    return false;
  }
  return record.count >= MAX_LOGIN_ATTEMPTS;
}

function recordLoginAttempt(identifier: string): void {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  if (!record || now > record.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    record.count++;
  }
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts) {
    if (now > record.resetAt) loginAttempts.delete(key);
  }
}, 5 * 60 * 1000);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: {
          label: "Email or Phone",
          type: "text",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier?.toString().trim() ?? "";
        const password = credentials?.password?.toString() ?? "";

        if (!identifier || !password) return null;

        // Brute-force protection
        if (isLoginBlocked(identifier)) {
          throw new Error(
            "Too many login attempts. Please try again in 15 minutes."
          );
        }

        try {
          const { prisma } = await import("@/lib/prisma");
          const user = await prisma.user.findFirst({
            where: {
              OR: [{ email: identifier }, { phone: identifier }],
              deletedAt: null,
            },
          });

          if (!user || !user.password) {
            recordLoginAttempt(identifier);
            return null;
          }

          const isValid = await compare(password, user.password);
          if (!isValid) {
            recordLoginAttempt(identifier);
            return null;
          }

          // Successful login — clear attempts
          loginAttempts.delete(identifier);

          return {
            id: user.id,
            email: user.email,
            name:
              user.name ??
              `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
            image: user.image ?? undefined,
            roleName: user.roleName,
            gender: user.gender ?? undefined,
            termsAccepted: user.termsAccepted,
            deletionRequestedAt: user.deletionRequestedAt?.toISOString() ?? null,
          };
        } catch (error) {
          console.error("Auth authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roleName = (user as { roleName?: RoleName }).roleName;
        token.gender =
          (user as { gender?: string | null }).gender ?? undefined;
        token.termsAccepted =
          (user as { termsAccepted?: boolean }).termsAccepted ?? false;
        token.deletionRequestedAt =
          (user as { deletionRequestedAt?: string | null }).deletionRequestedAt ?? null;
        token._lastDeletionCheck = Date.now();
      } else {
        // Refresh deletionRequestedAt from DB every 5 seconds
        const now = Date.now();
        const lastCheck = token._lastDeletionCheck as number | undefined;
        if (!lastCheck || now - lastCheck > 5_000) {
          try {
            const { prisma } = await import("@/lib/prisma");
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { deletionRequestedAt: true },
            });
            token.deletionRequestedAt = dbUser?.deletionRequestedAt?.toISOString() ?? null;
            token._lastDeletionCheck = now;
          } catch {
            // Silently ignore — don't block auth if DB is temporarily down
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      if (session.user && token?.roleName) {
        session.user.roleName = token.roleName as "ADMIN" | "USER";
      }
      if (session.user && token?.gender) {
        session.user.gender = token.gender as string;
      }
      if (session.user && token?.termsAccepted !== undefined) {
        session.user.termsAccepted = token.termsAccepted as boolean;
      }
      if (session.user && token?.deletionRequestedAt !== undefined) {
        session.user.deletionRequestedAt = token.deletionRequestedAt as string | null;
      }
      return session;
    },
  },
};
