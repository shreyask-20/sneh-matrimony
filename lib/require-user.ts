import type { NextRequest } from "next/server";
import { getAuthToken } from "@/lib/auth-token";

export async function requireUserId(request: NextRequest): Promise<string | null> {
  const token = await getAuthToken(request);
  return token?.id ? (token.id as string) : null;
}
