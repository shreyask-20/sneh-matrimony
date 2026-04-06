import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import Navbar from "../../../components/shared/Navbar";
import Badge from "../../../components/shared/Badge";
import Button from "../../../components/shared/Button";
import BackButton from "../../../components/shared/BackButton";
import ProfileTabs from "../../../components/profile/ProfileTabs";
import InterestActionButton from "../../../components/shared/InterestActionButton";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeConversationPair } from "@/lib/matchmaking";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? null;

  if (currentUserId && currentUserId === id) {
    redirect("/profile");
  }

  const user = await prisma.user.findFirst({
    where: {
      id,
      roleName: "USER",
      isApproved: true,
      profileVisible: true,
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      city: true,
      education: true,
      profession: true,
      religion: true,
      motherTongue: true,
      bio: true,
      height: true,
      isApproved: true,
      photos: {
        where: { status: "APPROVED" },
        select: { url: true },
        orderBy: { createdAt: "desc" },
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
          expectations: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const interestState =
    currentUserId
      ? await prisma.interest.findFirst({
          where: {
            OR: [
              { fromUserId: currentUserId, toUserId: user.id },
              { fromUserId: user.id, toUserId: currentUserId },
            ],
          },
          select: {
            status: true,
            fromUserId: true,
            toUserId: true,
          },
        })
      : null;

  const conversation =
    currentUserId
      ? await prisma.conversation.findUnique({
          where: {
            userOneId_userTwoId: normalizeConversationPair(currentUserId, user.id),
          },
          select: { id: true },
        })
      : null;

  const derivedInterestState:
    | "none"
    | "pending"
    | "incoming"
    | "accepted"
    | "declined"
    | "withdrawn" =
    !interestState
      ? "none"
      : interestState.status === "ACCEPTED"
        ? "accepted"
        : interestState.status === "DECLINED"
          ? "declined"
          : interestState.status === "WITHDRAWN"
            ? "withdrawn"
            : interestState.fromUserId === currentUserId
              ? "pending"
              : "incoming";

  const fullName =
    user.name ??
    (`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Profile");
  const age = user.birthDate
    ? Math.max(0, Math.floor((Date.now() - user.birthDate.getTime()) / 31557600000))
    : null;
  const photos = user.photos.length > 0 ? user.photos : [{ url: "/profiles/p1.jpg" }];
  const familySummary = user.familyDetails
    ? `Father: ${user.familyDetails.fatherName}, Mother: ${user.familyDetails.motherName}. Siblings: ${user.familyDetails.totalBrothers} brother(s), ${user.familyDetails.totalSisters} sister(s).`
    : "Family details have not been shared yet.";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-4">
          <BackButton fallbackHref="/browse" />
        </div>
        <div className="glass-card rounded-3xl p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <img
                src={photos[0].url}
                alt={fullName}
                className="h-72 w-full rounded-3xl object-cover"
              />
              {photos.length > 1 ? (
                <div className="grid grid-cols-4 gap-2">
                  {photos.slice(1, 5).map((photo) => (
                    <img
                      key={photo.url}
                      src={photo.url}
                      alt={fullName}
                      className="h-16 w-full rounded-2xl object-cover"
                    />
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Badge label="Verified" tone="verified" />
              </div>
              <div className="flex flex-wrap gap-3">
                <InterestActionButton
                  targetUserId={user.id}
                  signedIn={Boolean(currentUserId)}
                  initialState={derivedInterestState}
                />
                {conversation ? (
                  <Button asChild variant="secondary">
                    <Link href={`/chat?conversation=${conversation.id}`}>Chat</Link>
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    Chat
                  </Button>
                )}
                <Button variant="ghost">Shortlist</Button>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
                  {fullName}
                  {age ? `, ${age}` : ""}
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {[
                    user.profession,
                    user.city,
                    user.height,
                    user.religion,
                  ]
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
                  <p className="text-xs uppercase text-slate-400">Height</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {user.height ?? "Not shared"}
                  </p>
                </div>
              </div>
              <ProfileTabs
                about={
                  user.bio ??
                  "This member has not added a detailed bio yet, but their profile is ready for meaningful conversation."
                }
                family={familySummary}
                preferences={
                  user.preferences
                    ? {
                        preferredAgeRange: user.preferences.preferredAgeRange,
                        religionCommunity: user.preferences.religionCommunity,
                        locationPreference: user.preferences.locationPreference,
                        expectations: user.preferences.expectations,
                      }
                    : "Partner preferences have not been shared yet."
                }
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
