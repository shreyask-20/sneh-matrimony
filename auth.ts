import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { RoleName } from "@prisma/client";

const useSecureCookies =
  process.env.NODE_ENV === "production" ||
  process.env.NEXTAUTH_URL?.startsWith("https://") === true;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies,
  pages: {
    signIn: "/auth/login",
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

        try {
          const { prisma } = await import("@/lib/prisma");
          const user = await prisma.user.findFirst({
            where: {
              OR: [{ email: identifier }, { phone: identifier }],
              deletedAt: null, // block soft-deleted accounts from signing in
            },
          });

          if (!user || !user.password) return null;

          const isValid = await compare(password, user.password);
          if (!isValid) return null;

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
          };
        } catch {
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
        token.gender = (user as { gender?: string | null }).gender ?? undefined;
        token.termsAccepted = (user as { termsAccepted?: boolean }).termsAccepted ?? false;
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
      return session;
    },
  },
};
