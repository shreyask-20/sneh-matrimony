import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeHoroscopeChartInput } from "@/lib/horoscope";
import { sanitizeString, isValidBirthDate, VALIDATION, badRequest } from "@/lib/validation";

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
  try {
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
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdatePayload;

    const fullName = sanitizeString(body.fullName, VALIDATION.MAX_NAME_LENGTH);
    const bio = body.bio != null ? sanitizeString(body.bio, VALIDATION.MAX_BIO_LENGTH) : null;
    const city = sanitizeString(body.city, VALIDATION.MAX_CITY_LENGTH);
    const profession = sanitizeString(body.profession, VALIDATION.MAX_PROFESSION_LENGTH);
    const education = sanitizeString(body.education, VALIDATION.MAX_EDUCATION_LENGTH);
    const birthDate = body.birthDate?.trim() ?? "";

    if (body.birthDate?.trim() && !isValidBirthDate(birthDate)) {
      return badRequest("Please provide a valid birth date in the past.");
    }

    if (
      !fullName ||
      !body.gender?.trim() ||
      !body.birthDate?.trim() ||
      !body.maritalStatus?.trim() ||
      !body.height?.trim() ||
      !profession ||
      !education ||
      !city
    ) {
      return badRequest("All required fields must be filled.");
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

    const [firstName, ...rest] = fullName.split(/\s+/);
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
        name: fullName,
        firstName,
        lastName: lastName || null,
        gender: body.gender.trim(),
        birthDate: new Date(birthDate),
        maritalStatus: body.maritalStatus.trim(),
        height: body.height.trim(),
        profession,
        education,
        city,
        religion: body.religion.trim(),
        community: body.community.trim(),
        motherTongue: body.motherTongue.trim(),
        bio: bio || null,
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
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
