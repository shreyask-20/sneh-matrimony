import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileEditForm from "./profile-edit-form";

export default async function ProfileEditPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  if (session.user.roleName === "ADMIN") {
    redirect("/admin");
  }

const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
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
      photos: {
        select: {
          id: true,
          url: true,
          status: true,
          isPrimary: true,
        },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      familyDetails: {
        select: {
          fatherName: true,
          motherName: true,
          totalBrothers: true,
          totalSisters: true,
          marriedBrothers: true,
          marriedSisters: true,
        },
      },
      horoscope: {
        select: {
          horoscopeAvailable: true,
          manglik: true,
          nakshatra: true,
          rashi: true,
          gotra: true,
          gan: true,
          nadi: true,
          charan: true,
          chart: true,
        },
      },
      preferences: {
        select: {
          preferredAgeRange: true,
          religionCommunity: true,
          locationPreference: true,
          castePreference: true,
          subCastePreference: true,
          expectations: true,
        },
      },
    },
  });

  return <ProfileEditForm initialValues={user} />;
}
