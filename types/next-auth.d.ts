import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleName?: "ADMIN" | "USER";
      gender?: string | null;
      termsAccepted?: boolean;
      deletionRequestedAt?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    roleName?: "ADMIN" | "USER";
    gender?: string | null;
    termsAccepted?: boolean;
    deletionRequestedAt?: string | null;
    _lastDeletionCheck?: number;
  }
}
