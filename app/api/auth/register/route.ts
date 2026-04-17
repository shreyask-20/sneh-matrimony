import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "node:crypto";

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
  const body = (await request.json()) as RegisterPayload;

  const fullName = body.fullName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const phone = body.phone?.trim() ?? "";
  const password = body.password ?? "";

  if (!fullName || !email || !phone || !password || !body.gender?.trim()) {
    return NextResponse.json(
      { error: "Full name, email, phone, password, and gender are required." },
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

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      password: hashedPassword,
      name: fullName,
      firstName,
      lastName: lastName || null,
      roleName: "USER",
      gender: body.gender?.trim() || null,
      profession: body.profession?.trim() || null,
      education: body.education?.trim() || null,
      city: body.city?.trim() || null,
      bio: body.bio?.trim() || null,
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

  // Send email verification (best-effort — don't fail registration if email fails)
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    await sendVerificationEmail(email, token);
  } catch {
    // Non-fatal: user is created, verification can be resent later
  }

  return NextResponse.json({ user }, { status: 201 });
}
