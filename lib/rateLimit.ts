import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
}

function getRatelimit(limit: number, windowMs: number): Ratelimit {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    analytics: false,
  });
}

/**
 * Check whether a key has exceeded the allowed request count within the window.
 * Uses Upstash Redis for distributed rate limiting on Vercel serverless.
 * Falls back to allowing requests when Redis is unavailable (fail-open).
 * @param key      Unique identifier (e.g. IP + route)
 * @param limit    Max requests allowed in the window
 * @param windowMs Window duration in milliseconds
 * @returns true if the request should be blocked
 */
export async function isRateLimited(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  // Explicit test/development hook — when set, rate limiting is bypassed so
  // integration suites are not throttled by the distributed limiter. This
  // never applies unless the operator opts in via the environment.
  if (process.env.DISABLE_RATE_LIMIT === "1") {
    return false;
  }
  try {
    const ratelimit = getRatelimit(limit, windowMs);
    const { success } = await ratelimit.limit(key);
    return !success;
  } catch (error) {
    // Fail-open: allow requests when Redis is unavailable
    // This ensures availability but disables rate limiting
    console.warn(
      "Rate limit check failed — falling back to allow. Redis may be unavailable:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
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
