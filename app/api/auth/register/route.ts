import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
      photos: body.photos?.length
        ? {
            create: body.photos.map((photo) => ({
              url: photo.url,
              publicId: photo.publicId,
            })),
          }
        : undefined,
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

  return NextResponse.json({ user }, { status: 201 });
}
