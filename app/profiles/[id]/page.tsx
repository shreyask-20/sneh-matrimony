import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import Navbar from "../../../components/shared/Navbar";
import Badge from "../../../components/shared/Badge";
import Button from "../../../components/shared/Button";
import BackButton from "../../../components/shared/BackButton";
import ProfileTabs from "../../../components/profile/ProfileTabs";
import ProfileGallery from "../../../components/profile/ProfileGallery";
import InterestActionButton from "../../../components/shared/InterestActionButton";
import ShortlistButton from "../../../components/shared/ShortlistButton";
import BlockButton from "../../../components/shared/BlockButton";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeConversationPair } from "@/lib/matchmaking";
import PageBackdrop from "../../../components/shared/PageBackdrop";
import { getOppositeGender } from "@/lib/gender";
import { buildVerificationSummary } from "@/lib/verification";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.roleName === "ADMIN") {
    redirect("/admin");
  }
  const currentUserId = session?.user?.id ?? null;

  if (currentUserId && currentUserId === id) {
    redirect("/profile");
  }

  let currentUserGender = session?.user?.gender ?? null;
  if (currentUserId && !currentUserGender) {
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { gender: true },
    });
    currentUserGender = currentUser?.gender ?? null;
  }

  const user = await prisma.user.findFirst({
    where: {
      id,
      roleName: "USER",
      isApproved: true,
      profileVisible: true,
      deletedAt: null,
    },
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
      gender: true,
      religion: true,
      community: true,
      motherTongue: true,
      bio: true,
      height: true,
      isApproved: true,
      photos: {
        where: { status: "APPROVED" },
        select: { url: true },
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
    notFound();
  }

  if (currentUserId) {
    const targetGender = getOppositeGender(currentUserGender);

    if (!targetGender || user.gender?.trim() !== targetGender) {
      notFound();
    }
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
          select: { status: true, fromUserId: true, toUserId: true },
        })
      : null;

  const [conversation, shortlistEntry, blockEntry] = await Promise.all([
    currentUserId
      ? prisma.conversation.findUnique({
          where: { userOneId_userTwoId: normalizeConversationPair(currentUserId, user.id) },
          select: { id: true },
        })
      : Promise.resolve(null),
    currentUserId
      ? prisma.shortlist.findUnique({
          where: { userId_profileUserId: { userId: currentUserId, profileUserId: user.id } },
          select: { id: true },
        })
      : Promise.resolve(null),
    currentUserId
      ? prisma.block.findUnique({
          where: { blockerId_blockedUserId: { blockerId: currentUserId, blockedUserId: user.id } },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  const isShortlisted = !!shortlistEntry;
  const isBlocked = !!blockEntry;

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
  const canRevealContact = derivedInterestState === "accepted";
  const contactEmail = canRevealContact
    ? user.email ?? "Not shared"
    : "Available after a mutual match";
  const contactPhone = canRevealContact
    ? user.phone ?? "Not shared"
    : "Available after a mutual match";
  const contactNote = canRevealContact
    ? "You’ve matched. Contact details are now visible."
    : "Contact details stay hidden until there is a mutual match.";

  const verification = buildVerificationSummary({
    isApproved: user.isApproved,
    emailVerified: user.emailVerified,
    approvedPhotoCount: user.photos.length,
  });

  return (
    <PageBackdrop>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-4">
          <BackButton fallbackHref="/browse" />
        </div>
        <div className="glass-card rounded-3xl p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <ProfileGallery photos={photos} alt={fullName} />
              <div className="flex flex-wrap gap-2">
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

              {/* Action buttons row */}
              {currentUserId && (
                <div className="flex flex-wrap gap-2">
                  <ShortlistButton profileUserId={user.id} initialSaved={isShortlisted} />
                  <BlockButton blockedUserId={user.id} initialBlocked={isBlocked} />
                  {derivedInterestState === "accepted" && (
                    <Button asChild variant="primary" className="flex-1 sm:flex-none">
                      <Link href={conversation ? `/chat?conversation=${conversation.id}` : "/chat"}>
                        Open Chat
                      </Link>
                    </Button>
                  )}
                </div>
              )}

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
                <div>
                  <p className="text-xs uppercase text-slate-400">Contact note</p>
                  <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                    {contactNote}
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

              {/* Primary match CTA — right below name where eyes land first */}
              {currentUserId && (
                <div className="rounded-2xl border border-brand-100/60 bg-gradient-to-r from-brand-50/80 to-fuchsia-50/60 p-4 dark:border-white/10 dark:from-white/[0.04] dark:to-white/[0.02]">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">
                    {derivedInterestState === "accepted"
                      ? "You are matched"
                      : derivedInterestState === "pending"
                        ? "Interest sent"
                        : derivedInterestState === "incoming"
                          ? "They like you"
                          : "Start a match"}
                  </p>
                  <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                    {derivedInterestState === "accepted"
                      ? "You and this member have matched. Start a conversation."
                      : derivedInterestState === "pending"
                        ? "Your interest has been sent. You'll be notified when they respond."
                        : derivedInterestState === "incoming"
                          ? "This person has expressed interest in you. Respond from your dashboard."
                          : `Send an interest to ${user.firstName ?? fullName.split(" ")[0]}. If they respond, you'll be connected.`}
                  </p>
                  {derivedInterestState === "accepted" ? (
                    <Button asChild className="w-full bg-brand-600 text-white hover:bg-brand-700">
                      <Link href={conversation ? `/chat?conversation=${conversation.id}` : "/chat"}>
                        Open Chat
                      </Link>
                    </Button>
                  ) : (
                    <InterestActionButton
                      targetUserId={user.id}
                      signedIn={Boolean(currentUserId)}
                      initialState={derivedInterestState}
                      fullWidth
                    />
                  )}
                </div>
              )}
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
              <ProfileTabs
                about={
                  user.bio ??
                  "This member has not added a detailed bio yet, but their profile is ready for meaningful conversation."
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
                    : "Partner preferences have not been shared yet."
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
                    : "Horoscope details have not been shared yet."
                }
              />
            </div>
          </div>
        </div>
      </main>
    </PageBackdrop>
  );
}
