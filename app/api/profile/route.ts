import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type UpdatePayload = {
  fullName?: string;
  gender?: string;
  birthDate?: string;
  maritalStatus?: string;
  height?: string;
  profession?: string;
  education?: string;
  city?: string;
  bio?: string;
};

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as UpdatePayload;

  if (
    !body.fullName?.trim() ||
    !body.gender?.trim() ||
    !body.birthDate?.trim() ||
    !body.maritalStatus?.trim() ||
    !body.height?.trim() ||
    !body.profession?.trim() ||
    !body.education?.trim() ||
    !body.city?.trim()
  ) {
    return NextResponse.json(
      { error: "All required fields must be filled." },
      { status: 400 }
    );
  }

  const [firstName, ...rest] = body.fullName.trim().split(/\s+/);
  const lastName = rest.join(" ");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: body.fullName.trim(),
      firstName,
      lastName: lastName || null,
      gender: body.gender.trim(),
      birthDate: new Date(body.birthDate),
      maritalStatus: body.maritalStatus.trim(),
      height: body.height.trim(),
      profession: body.profession.trim(),
      education: body.education.trim(),
      city: body.city.trim(),
      bio: body.bio?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true });
}
