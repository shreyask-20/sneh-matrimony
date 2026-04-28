import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import Navbar from "../../components/shared/Navbar";
import Badge from "../../components/shared/Badge";
import Button from "../../components/shared/Button";
import BackButton from "../../components/shared/BackButton";
import ProfileTabs from "../../components/profile/ProfileTabs";
import ProfileGallery from "../../components/profile/ProfileGallery";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import PageBackdrop from "../../components/shared/PageBackdrop";
import { buildVerificationSummary } from "@/lib/verification";

export default async function ProfilePage() {
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
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      city: true,
      email: true,
      emailVerified: true,
      phone: true,
      maritalStatus: true,
      education: true,
      profession: true,
      religion: true,
      community: true,
      motherTongue: true,
      bio: true,
      height: true,
      isApproved: true,
      profileVisible: true,
      photos: {
        where: { status: { in: ["APPROVED", "PENDING"] } },
        select: { url: true, status: true },
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
    },
  });

  if (!user) {
    redirect("/profile/edit");
  }

  const fullName =
    user.name ??
    (`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Your profile");
  const age = user.birthDate
    ? Math.max(0, Math.floor((Date.now() - user.birthDate.getTime()) / 31557600000))
    : null;
  const photos = user.photos.length > 0 ? user.photos : [{ url: "/profiles/p1.jpg", status: "APPROVED" as const }];
  const familySummary = user.familyDetails
    ? `Father: ${user.familyDetails.fatherName}, Mother: ${user.familyDetails.motherName}. Siblings: ${user.familyDetails.totalBrothers} brother(s), ${user.familyDetails.totalSisters} sister(s).`
    : "Family details have not been shared yet.";
  const contactEmail = user.email ?? "Not shared";
  const contactPhone = user.phone ?? "Not shared";
  const visibilityLabel = user.profileVisible ? "Visible in browse" : "Hidden from browse";
  const approvalLabel = user.isApproved ? "Approved" : "Pending review";
  const verification = buildVerificationSummary({
    isApproved: user.isApproved,
    emailVerified: user.emailVerified,
    approvedPhotoCount: user.photos.filter(p => p.status === "APPROVED").length,
  });

  return (
    <PageBackdrop>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <BackButton fallbackHref="/dashboard" />
          <Button
            asChild
            variant="secondary"
            className="h-10 rounded-20 px-4 transition hover:bg-gradient-to-r hover:from-pink-100 hover:to-fuchsia-100 hover:text-slate-900"
          >
            <Link href="/profile/edit">Edit profile</Link>
          </Button>
        </div>
        <div className="glass-card rounded-3xl p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <ProfileGallery photos={photos} alt={fullName} />
              <div className="flex flex-wrap gap-2">
                <Badge label={approvalLabel} tone={user.isApproved ? "verified" : "neutral"} />
                <Badge label={visibilityLabel} tone={user.profileVisible ? "premium" : "neutral"} />
                <Badge
                  label={verification.tierLabel}
                  tone={verification.badges.length > 0 ? "verified" : "neutral"}
                />
              </div>
              {verification.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
                  {verification.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-white/60 bg-white/80 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="primary"
                  className="bg-slate-950 text-white hover:bg-slate-700"
                >
                  <Link href="/browse">Browse matches</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/chat">Messages</Link>
                </Button>
              </div>
              <div className="grid gap-4 rounded-3xl border border-white/40 bg-white/75 p-5 text-sm text-slate-600 shadow-[0_18px_40px_rgba(127,16,62,0.05)] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-slate-400">Email</p>
                  <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                    {contactEmail}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Phone</p>
                  <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                    {contactPhone}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Marital status</p>
                  <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                    {user.maritalStatus ?? "Not shared"}
                  </p>
                </div>

              </div>
            </div>
            <div className="space-y-5">
              <div>
                <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
                  {fullName}
                  {age ? `, ${age}` : ""}
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {[user.profession, user.city, user.height, user.religion]
                    .filter(Boolean)
                    .join(" · ") || "Member profile"}
                </p>
              </div>
              <div className="grid gap-4 rounded-3xl border border-white/40 bg-white/70 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-slate-400">Education</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {user.education ?? "Not shared"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Profession</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {user.profession ?? "Not shared"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Mother tongue</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {user.motherTongue ?? "Not shared"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Community</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {user.community ?? "Not shared"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Height</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {user.height ?? "Not shared"}
                  </p>
                </div>
              </div>
              <div className="lg:mt-6">
                <ProfileTabs
                  about={
                    user.bio ??
                    "This profile is ready for meaningful conversations, and you can keep improving it from the edit page."
                  }
                  family={
                    user.familyDetails
                      ? {
                          fatherName: user.familyDetails.fatherName,
                          motherName: user.familyDetails.motherName,
                          totalBrothers: user.familyDetails.totalBrothers,
                          totalSisters: user.familyDetails.totalSisters,
                          marriedBrothers: user.familyDetails.marriedBrothers,
                          marriedSisters: user.familyDetails.marriedSisters,
                        }
                      : familySummary
                  }
                  preferences={
                    user.preferences
                      ? {
                          preferredAgeRange: user.preferences.preferredAgeRange,
                          religionCommunity: user.preferences.religionCommunity,
                          locationPreference: user.preferences.locationPreference,
                          castePreference: user.preferences.castePreference,
                          subCastePreference: user.preferences.subCastePreference,
                          expectations: user.preferences.expectations,
                        }
                      : "Partner preferences have not been added yet."
                  }
                  horoscope={
                    user.horoscope
                      ? {
                          horoscopeAvailable: user.horoscope.horoscopeAvailable,
                          manglik: user.horoscope.manglik,
                          nakshatra: user.horoscope.nakshatra,
                          rashi: user.horoscope.rashi,
                          gotra: user.horoscope.gotra,
                          gan: user.horoscope.gan,
                          nadi: user.horoscope.nadi,
                          charan: user.horoscope.charan,
                          chart: user.horoscope.chart,
                        }
                      : "Horoscope details are not available."
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageBackdrop>
  );
}
