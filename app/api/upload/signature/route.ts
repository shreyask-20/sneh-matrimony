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
  try {
    // Rate limit: 20 requests per 10 minutes per IP
    // The signature is scoped to sneh-matrimony/profiles/ folder and expires quickly.
    // Unauthenticated access is intentional — registration uploads photos before a
    // session exists. The actual photo record creation (POST /api/photos) requires auth.
    const ip = getClientIp(request);
    if (await isRateLimited(`upload-sig:${ip}`, 20, 10 * 60 * 1000)) {
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
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
