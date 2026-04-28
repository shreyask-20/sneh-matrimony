import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeHoroscopeChartInput } from "@/lib/horoscope";

type UpdatePayload = {
  fullName?: string;
  gender?: string;
  birthDate?: string;
  maritalStatus?: string;
  height?: string;
  profession?: string;
  education?: string;
  city?: string;
  religion?: string;
  community?: string;
  motherTongue?: string;
  bio?: string;
  horoscopeEnabled?: boolean;
  familyDetails?: {
    fatherName?: string;
    motherName?: string;
    totalBrothers?: number;
    totalSisters?: number;
    marriedBrothers?: number;
    marriedSisters?: number;
  };
  horoscope?: {
    horoscopeAvailable?: boolean;
    manglik?: boolean;
    nakshatra?: string;
    rashi?: string;
    gotra?: string;
    gan?: string;
    nadi?: string;
    charan?: string;
    chart?: unknown;
  };
  preferences?: {
    preferredAgeRange?: string;
    religionCommunity?: string;
    locationPreference?: string;
    castePreference?: string;
    subCastePreference?: string;
    expectations?: string;
  };
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      gender: true,
      birthDate: true,
      maritalStatus: true,
      height: true,
      profession: true,
      education: true,
      city: true,
      religion: true,
      community: true,
      motherTongue: true,
      bio: true,
      isApproved: true,
      profileVisible: true,
      createdAt: true,
      familyDetails: true,
      horoscope: true,
      preferences: true,
      photos: {
        select: { id: true, url: true, status: true, isPrimary: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

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

  const familyDetails = body.familyDetails;
  const horoscope = body.horoscope;
  const preferences = body.preferences;
  const horoscopeEnabled = body.horoscopeEnabled ?? horoscope !== undefined;
  const normalizedChart = horoscopeEnabled
    ? normalizeHoroscopeChartInput(horoscope?.chart)
    : null;
  const chartValue = normalizedChart ?? Prisma.JsonNull;

  const horoscopeMissing =
    horoscopeEnabled &&
    (horoscope?.horoscopeAvailable === undefined ||
      horoscope?.manglik === undefined ||
      !horoscope?.nakshatra?.trim() ||
      !horoscope?.rashi?.trim() ||
      !horoscope?.gotra?.trim());

  if (
    !body.religion?.trim() ||
    !body.community?.trim() ||
    !body.motherTongue?.trim() ||
    !familyDetails?.fatherName?.trim() ||
    !familyDetails?.motherName?.trim() ||
    familyDetails.totalBrothers === undefined ||
    familyDetails.totalSisters === undefined ||
    familyDetails.marriedBrothers === undefined ||
    familyDetails.marriedSisters === undefined ||
    horoscopeMissing ||
    !preferences?.preferredAgeRange?.trim() ||
    !preferences?.religionCommunity?.trim() ||
    !preferences?.locationPreference?.trim() ||
    !preferences?.castePreference?.trim() ||
    !preferences?.subCastePreference?.trim() ||
    !preferences?.expectations?.trim()
  ) {
    return NextResponse.json(
      { error: "Please complete all matrimonial profile fields." },
      { status: 400 }
    );
  }

  const siblingCounts = [
    familyDetails.totalBrothers,
    familyDetails.totalSisters,
    familyDetails.marriedBrothers,
    familyDetails.marriedSisters,
  ];

  if (siblingCounts.some((value) => !Number.isInteger(value) || value < 0)) {
    return NextResponse.json(
      { error: "Sibling counts must be whole numbers starting from 0." },
      { status: 400 }
    );
  }

  if (
    familyDetails.marriedBrothers > familyDetails.totalBrothers ||
    familyDetails.marriedSisters > familyDetails.totalSisters
  ) {
    return NextResponse.json(
      { error: "Married sibling counts cannot exceed total siblings." },
      { status: 400 }
    );
  }

  const [firstName, ...rest] = body.fullName.trim().split(/\s+/);
  const lastName = rest.join(" ");

  const horoscopeUpsert = horoscopeEnabled
    ? {
        horoscope: {
          upsert: {
            create: {
              horoscopeAvailable: horoscope!.horoscopeAvailable!,
              manglik: horoscope!.manglik!,
              nakshatra: horoscope!.nakshatra!.trim(),
              rashi: horoscope!.rashi!.trim(),
              gotra: horoscope!.gotra!.trim(),
              gan: horoscope!.gan?.trim() || null,
              nadi: horoscope!.nadi?.trim() || null,
              charan: horoscope!.charan?.trim() || null,
              chart: chartValue,
            },
            update: {
              horoscopeAvailable: horoscope!.horoscopeAvailable!,
              manglik: horoscope!.manglik!,
              nakshatra: horoscope!.nakshatra!.trim(),
              rashi: horoscope!.rashi!.trim(),
              gotra: horoscope!.gotra!.trim(),
              gan: horoscope!.gan?.trim() || null,
              nadi: horoscope!.nadi?.trim() || null,
              charan: horoscope!.charan?.trim() || null,
              chart: chartValue,
            },
          },
        },
      }
    : {};

  // If horoscope was disabled, delete any existing horoscope record
  if (!horoscopeEnabled) {
    await prisma.horoscope.deleteMany({
      where: { userId: session.user.id },
    });
  }

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
      religion: body.religion.trim(),
      community: body.community.trim(),
      motherTongue: body.motherTongue.trim(),
      bio: body.bio?.trim() || null,
      familyDetails: {
        upsert: {
          create: {
            fatherName: familyDetails.fatherName.trim(),
            motherName: familyDetails.motherName.trim(),
            totalBrothers: familyDetails.totalBrothers,
            totalSisters: familyDetails.totalSisters,
            marriedBrothers: familyDetails.marriedBrothers,
            marriedSisters: familyDetails.marriedSisters,
          },
          update: {
            fatherName: familyDetails.fatherName.trim(),
            motherName: familyDetails.motherName.trim(),
            totalBrothers: familyDetails.totalBrothers,
            totalSisters: familyDetails.totalSisters,
            marriedBrothers: familyDetails.marriedBrothers,
            marriedSisters: familyDetails.marriedSisters,
          },
        },
      },
      preferences: {
        upsert: {
          create: {
            preferredAgeRange: preferences.preferredAgeRange.trim(),
            religionCommunity: preferences.religionCommunity.trim(),
            locationPreference: preferences.locationPreference.trim(),
            castePreference: preferences.castePreference.trim(),
            subCastePreference: preferences.subCastePreference.trim(),
            expectations: preferences.expectations.trim(),
          },
          update: {
            preferredAgeRange: preferences.preferredAgeRange.trim(),
            religionCommunity: preferences.religionCommunity.trim(),
            locationPreference: preferences.locationPreference.trim(),
            castePreference: preferences.castePreference.trim(),
            subCastePreference: preferences.subCastePreference.trim(),
            expectations: preferences.expectations.trim(),
          },
        },
      },
      ...horoscopeUpsert,
    },
  });

  return NextResponse.json({ ok: true });
}
