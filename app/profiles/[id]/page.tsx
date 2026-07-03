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
import BlockButton from "../../../components/shared/BlockButton";
import AgeDisplay from "../../../components/shared/AgeDisplay";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeConversationPair } from "@/lib/matchmaking";
import PageBackdrop from "../../../components/shared/PageBackdrop";
import { getOppositeGender } from "@/lib/gender";
import { buildVerificationSummary } from "@/lib/verification";
import { getActiveSubscription } from "@/lib/subscription-status";
import { isFemaleInFreePeriod } from "@/lib/promo";
import SubscriptionOverlay from "../../../components/subscription/SubscriptionOverlay";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findFirst({
    where: {
      id,
      roleName: "USER",
      isApproved: true,
      profileVisible: true,
      deletedAt: null,
    },
    select: {
      name: true,
      firstName: true,
      lastName: true,
      city: true,
      profession: true,
      photos: {
        where: { status: "APPROVED" },
        select: { url: true },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        take: 1,
      },
    },
  });

  if (!user) {
    return { title: "Profile Not Found | Sneh Matrimony" };
  }

  const fullName =
    user.name ??
    (`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Member");
  const photoUrl = user.photos[0]?.url;

  return {
    title: fullName,
    description: `View ${fullName}'s profile on Sneh Matrimony${user.city ? ` from ${user.city}` : ""}${user.profession ? ` — ${user.profession}` : ""}. Connect through a trusted matrimony platform.`,
    openGraph: {
      title: `${fullName} | Sneh Matrimony`,
      description: `View ${fullName}'s matrimony profile${user.city ? ` from ${user.city}` : ""}.`,
      images: photoUrl ? [{ url: photoUrl, width: 800, height: 800, alt: fullName }] : undefined,
    },
    twitter: {
      title: `${fullName} | Sneh Matrimony`,
      description: `View ${fullName}'s matrimony profile${user.city ? ` from ${user.city}` : ""}.`,
      images: photoUrl ? [photoUrl] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

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
  let viewerApproved = false;
  let viewerFirstName: string | null = null;
  let viewerCreatedAt: Date | null = null;
  if (currentUserId) {
    const viewer = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { gender: true, firstName: true, isApproved: true, createdAt: true },
    });
    currentUserGender ??= viewer?.gender ?? null;
    viewerApproved = viewer?.isApproved ?? false;
    viewerFirstName = viewer?.firstName ?? null;
    viewerCreatedAt = viewer?.createdAt ?? null;
  }

  let needsSubscription = false;
  if (currentUserId) {
    const subscription = await getActiveSubscription(currentUserId);
    const hasSubscription = subscription !== null;
    const isFemale = currentUserGender?.trim().toLowerCase() === "female";
    const isFreePeriod = isFemale && viewerCreatedAt
      ? isFemaleInFreePeriod(viewerCreatedAt)
      : false;
    needsSubscription = !hasSubscription && !isFreePeriod;
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
      isPremium: true,
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

  const subscription = user.isPremium
    ? await prisma.subscription.findFirst({
        where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: new Date() } },
        select: { plan: true },
        orderBy: { expiresAt: "desc" },
      })
    : null;

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

  const [conversation, blockEntry] = await Promise.all([
    currentUserId
      ? prisma.conversation.findUnique({
          where: { userOneId_userTwoId: normalizeConversationPair(currentUserId, user.id) },
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
  // age is now calculated client-side via AgeDisplay component
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
      <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-4">
          <BackButton fallbackHref="/browse" />
        </div>
        <div className="glass-card rounded-3xl p-4 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
            <div className="space-y-4">
              <ProfileGallery photos={photos} alt={fullName} />
              <div className="flex flex-wrap gap-2">
                {subscription && <Badge label={subscription.plan.charAt(0) + subscription.plan.slice(1).toLowerCase()} tone="premium" />}
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
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <BlockButton blockedUserId={user.id} initialBlocked={isBlocked} isApproved={viewerApproved} />
                  {derivedInterestState === "accepted" && (
                    <Button asChild variant="primary" className="w-full sm:w-auto">
                      <Link href={conversation ? `/chat?conversation=${conversation.id}` : "/chat"}>
                        Open Chat
                      </Link>
                    </Button>
                  )}
                </div>
              )}

              <div className="grid gap-4 rounded-3xl border border-white/40 bg-white/75 p-4 text-sm text-slate-600 shadow-[0_18px_40px_rgba(127,16,62,0.05)] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:grid-cols-2 sm:p-5">
                <div>
                  <p className="text-xs uppercase text-slate-400">Email</p>
                  <p className="mt-2 break-words font-semibold text-slate-800 dark:text-slate-100">
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
              <div className="min-w-0">
                <h1 className="break-words font-serif text-2xl text-slate-900 dark:text-white sm:text-3xl">
                  {fullName}
                  {user.birthDate && (
                    <>, <AgeDisplay birthDate={user.birthDate} /></>
                  )}
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
                      isApproved={viewerApproved}
                    />
                  )}
                </div>
              )}
              <div className="grid gap-4 rounded-3xl border border-white/40 bg-white/70 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:grid-cols-2 sm:p-5">
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
      {needsSubscription && (
        <SubscriptionOverlay userName={viewerFirstName ?? undefined} />
      )}
    </PageBackdrop>
  );
}
