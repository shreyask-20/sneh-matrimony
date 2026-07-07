import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { generateDisplayId } from "@/lib/displayId";
import { sanitizeString, isValidEmail, isValidPhone, isValidPassword, VALIDATION, badRequest } from "@/lib/validation";

type RegisterPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  gender?: string;
  profession?: string;
  education?: string;
  city?: string;
  preferredAgeRange?: string;
  religionCommunity?: string;
  locationPreference?: string;
  bio?: string;
  photos?: Array<{ url: string; publicId?: string }>;
  termsAccepted?: boolean;
};

function isAllowedPhotoUrl(url: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.includes("/image/upload/") &&
      parsed.pathname.includes("/sneh-matrimony/profiles/")
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
  // Rate limit: 5 registrations per hour per IP
  const ip = getClientIp(request);
  if (await isRateLimited(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = (await request.json()) as RegisterPayload;

  const fullName = sanitizeString(body.fullName, VALIDATION.MAX_NAME_LENGTH) ?? "";
  const email = sanitizeString(body.email, VALIDATION.MAX_EMAIL_LENGTH)?.toLowerCase() ?? "";
  const phone = sanitizeString(body.phone, VALIDATION.MAX_PHONE_LENGTH) ?? "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!fullName || !email || !phone || !password || !body.gender?.trim()) {
    return badRequest("Full name, email, phone, password, and gender are required.");
  }

  if (!isValidEmail(email)) {
    return badRequest("Please provide a valid email address.");
  }

  if (!isValidPhone(phone)) {
    return badRequest("Enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
  }

  if (!isValidPassword(password)) {
    return badRequest("Password must be at least 8 characters.");
  }

  if (!body.termsAccepted) {
    return NextResponse.json(
      { error: "You must agree to the Terms & Conditions to register." },
      { status: 400 }
    );
  }

  if (!body.photos || body.photos.length === 0) {
    return NextResponse.json(
      { error: "At least one primary profile photo is required." },
      { status: 400 }
    );
  }

  if (!body.photos.every((photo) => isAllowedPhotoUrl(photo.url))) {
    return NextResponse.json(
      { error: "Profile photos must come from the approved upload flow." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Email or phone is already registered." },
      { status: 409 }
    );
  }

  const [firstName, ...rest] = fullName.split(/\s+/);
  const lastName = rest.join(" ");

  const hashedPassword = await hash(password, 12);
  const displayId = await generateDisplayId();

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      password: hashedPassword,
      name: fullName,
      firstName,
      lastName: lastName || null,
      displayId,
      roleName: "USER",
      gender: body.gender?.trim() || null,
      profession: body.profession?.trim() || null,
      education: body.education?.trim() || null,
      city: body.city?.trim() || null,
      bio: body.bio?.trim() || null,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      photos: {
        create: body.photos.map((photo) => ({
          url: photo.url,
          publicId: photo.publicId,
        })),
      },
      preferences: {
        create: {
          preferredAgeRange: body.preferredAgeRange?.trim() || null,
          religionCommunity: body.religionCommunity?.trim() || null,
          locationPreference: body.locationPreference?.trim() || null,
        },
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  // OTP is sent when the user clicks "Verify email" on the dashboard,
  // not at registration time — avoids duplicate emails on first login.

  return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
