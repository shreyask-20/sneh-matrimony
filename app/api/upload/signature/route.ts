import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

const MAX_FILE_SIZE = 1024 * 1024;

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export async function POST(request: NextRequest) {
  // Rate limit: 20 requests per 10 minutes per IP
  // The signature itself is scoped to a specific folder and expires quickly,
  // so even if obtained, it can only upload to sneh-matrimony/profiles/
  const ip = getClientIp(request);
  if (isRateLimited(`upload-sig:${ip}`, 20, 10 * 60 * 1000)) {
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
    maxFileSize: MAX_FILE_SIZE,
  });
}
