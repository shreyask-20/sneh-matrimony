import { NextResponse } from "next/server";
import crypto from "node:crypto";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 20;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  return (
    forwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    cfConnectingIp?.trim() ||
    "anonymous"
  );
}

function isSameSiteRequest(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (origin && origin !== requestOrigin) return false;

  if (referer) {
    try {
      if (new URL(referer).origin !== requestOrigin) return false;
    } catch {
      return false;
    }
  }

  if (
    secFetchSite &&
    secFetchSite !== "same-origin" &&
    secFetchSite !== "same-site"
  ) {
    return false;
  }

  return Boolean(origin || referer || secFetchSite);
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = requestCounts.get(key);

  if (!current || current.resetAt <= now) {
    requestCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (current.count >= MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  return false;
}

export async function POST(request: Request) {
  if (!isSameSiteRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "Too many signature requests. Please try again later." },
      { status: 429 }
    );
  }

  const cloudName = getEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = getEnv("CLOUDINARY_API_KEY");
  const apiSecret = getEnv("CLOUDINARY_API_SECRET");

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "sneh-matrimony/profiles";

  const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto
    .createHash("sha1")
    .update(signatureBase)
    .digest("hex");

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
  });
}
