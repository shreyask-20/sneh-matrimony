/**
 * Simple in-memory rate limiter.
 * Works per-process — sufficient for single-instance deployments.
 * For multi-instance (e.g. Vercel serverless), swap the Map for Redis.
 */

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

/**
 * Check whether a key has exceeded the allowed request count within the window.
 * @param key      Unique identifier (e.g. IP + route)
 * @param limit    Max requests allowed in the window
 * @param windowMs Window duration in milliseconds
 * @returns true if the request should be blocked
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) return true;

  entry.count += 1;
  return false;
}

/**
 * Extract the best available client IP from a Request.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}
