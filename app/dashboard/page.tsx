import type { Metadata } from "next";
import Navbar from "../../components/shared/Navbar";
import Progress from "../../components/shared/Progress";
import Badge from "../../components/shared/Badge";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import InterestBoard from "./InterestBoard";
import { normalizeConversationPair } from "@/lib/matchmaking";
import Button from "../../components/shared/Button";
import UnreadMessageToast from "../../components/shared/UnreadMessageToast";
import ActionCenter from "../../components/dashboard/ActionCenter";
import VerifyEmailBanner from "@/components/dashboard/VerifyEmailBanner";
import PageBackdrop from "../../components/shared/PageBackdrop";
import { getActiveSubscription } from "@/lib/subscription-status";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your Sneh Matrimony profile, respond to interests, and stay updated on your matches.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ login?: string; subscribed?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const shouldShowLoginNotice = resolvedSearchParams?.login === "1";
  const shouldShowSubscribedNotice = resolvedSearchParams?.subscribed === "1";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <PageBackdrop>
        <Navbar />
        <main className="w-full px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="glass-card rounded-3xl p-4 text-center sm:p-8">
            <h1 className="font-serif text-2xl text-slate-900 dark:text-white">
              Please sign in to view your dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Your matches and profile status will appear here after login.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          </div>
        </main>
      </PageBackdrop>
    );
  }
  if (session.user.roleName === "ADMIN") {
    redirect("/admin");
  }

  const activeSubscriptionPromise = getActiveSubscription(session.user.id);

  const currentUserPromise = prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      name: true,
      gender: true,
      birthDate: true,
      maritalStatus: true,
      height: true,
      profession: true,
      education: true,
      city: true,
      bio: true,
      isApproved: true,
      profileVisible: true,
      emailVerified: true,
      photos: {
        select: { id: true, status: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const interestsPromise = Promise.all([
    prisma.interest.findMany({
      where: {
        toUserId: session.user.id,
        status: "PENDING",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        message: true,
        fromUser: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            city: true,
            profession: true,
            photos: {
              where: { status: "APPROVED" },
              select: { url: true },
              take: 1,
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.interest.findMany({
      where: {
        fromUserId: session.user.id,
        status: "PENDING",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        message: true,
        toUser: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            city: true,
            profession: true,
            photos: {
              where: { status: "APPROVED" },
              select: { url: true },
              take: 1,
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.interest.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ fromUserId: session.user.id }, { toUserId: session.user.id }],
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        message: true,
        fromUserId: true,
        fromUser: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            city: true,
            profession: true,
            photos: {
              where: { status: "APPROVED" },
              select: { url: true },
              take: 1,
              orderBy: { createdAt: "asc" },
            },
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            city: true,
            profession: true,
            photos: {
              where: { status: "APPROVED" },
              select: { url: true },
              take: 1,
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const unreadMessagePromise = shouldShowLoginNotice
    ? prisma.message.findMany({
        where: {
          readAt: null,
          senderId: { not: session.user.id },
          conversation: {
            OR: [{ userOneId: session.user.id }, { userTwoId: session.user.id }],
          },
        },
        select: {
          conversationId: true,
        },
      })
    : Promise.resolve([]);

  const [
    currentUser,
    [receivedInterests, sentInterests, acceptedInterests],
    unreadMessageRows,
    activeSubscription,
  ] = await Promise.all([
    currentUserPromise,
    interestsPromise,
    unreadMessagePromise,
    activeSubscriptionPromise,
  ]);

  const requiredFields = [
    currentUser?.name,
    currentUser?.birthDate,
    currentUser?.maritalStatus,
    currentUser?.height,
    currentUser?.profession,
    currentUser?.education,
    currentUser?.city,
  ];
  const completedRequired = requiredFields.filter(Boolean).length;
  const approvedPhotoCount =
    currentUser?.photos.filter((photo) => photo.status === "APPROVED").length ?? 0;
  const pendingPhotoCount =
    currentUser?.photos.filter((photo) => photo.status === "PENDING").length ?? 0;
  const rejectedPhotoCount =
    currentUser?.photos.filter((photo) => photo.status === "REJECTED").length ?? 0;
  const primaryPhoto = currentUser?.photos[0];
  const primaryPhotoApproved = primaryPhoto?.status === "APPROVED";
  const photosComplete = primaryPhotoApproved ? 1 : 0;
  const totalRequired = requiredFields.length + 1;
  const completed = completedRequired + photosComplete;
  const completionPercent = Math.round((completed / totalRequired) * 100);
  const isComplete = completionPercent === 100;
  const displayName =
    currentUser?.firstName ??
    currentUser?.name?.split(" ")[0] ??
    session.user.name?.split(" ")[0] ??
    "there";
  const approvalLabel = currentUser?.isApproved ? "Approved" : "Pending review";
  const visibilityLabel = currentUser?.profileVisible ? "Visible in browse" : "Hidden from browse";
  const profileHealthLabel = isComplete ? "Profile complete" : "Needs attention";
  let nextStepMessage = "Complete the missing profile details so your account can move to review.";
  if (currentUser?.isApproved) {
    nextStepMessage = currentUser?.profileVisible
      ? "Your profile is live and ready for new interests."
      : primaryPhoto
        ? "Your profile is approved, but your primary photo still needs approval before it can go live."
        : "Your profile is approved, but you still need a primary photo before it can go live.";
  } else if (isComplete) {
    nextStepMessage = "Your profile is complete. The admin team can review it next.";
  }

  const unreadMessageCount = unreadMessageRows.length;
  const unreadConversationCount = new Set(
    unreadMessageRows.map((row) => row.conversationId)
  ).size;

  const acceptedConversationPairs = acceptedInterests
    .filter((item) => item.toUser != null)
    .map((item) =>
      normalizeConversationPair(item.fromUserId, item.toUser.id)
    );

  const conversationsForAccepted = acceptedConversationPairs.length
    ? await prisma.conversation.findMany({
        where: {
          OR: acceptedConversationPairs,
        },
        select: {
          id: true,
          userOneId: true,
          userTwoId: true,
        },
      })
    : [];

  const conversationIdByPair = new Map(
    conversationsForAccepted.map((conversation) => [
      `${conversation.userOneId}:${conversation.userTwoId}`,
      conversation.id,
    ])
  );

  const toInterestItem = (
    item: {
      id: number;
      status: "PENDING" | "ACCEPTED" | "DECLINED" | "WITHDRAWN";
      createdAt: Date;
      message: string | null;
      profile: {
        id: string;
        name: string | null;
        firstName: string | null;
        lastName: string | null;
        city: string | null;
        profession: string | null;
        photos: Array<{ url: string }>;
      };
    }
  ) => ({
    id: item.id,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    message: item.message,
    profile: {
      id: item.profile.id,
      name:
        item.profile.name ??
        (`${item.profile.firstName ?? ""} ${item.profile.lastName ?? ""}`.trim() ||
          "Profile"),
      city: item.profile.city,
      profession: item.profile.profession,
      photoUrl: item.profile.photos[0]?.url ?? null,
    },
  });

  const interestBoardData = {
    received: receivedInterests.map((item) =>
      toInterestItem({
        ...item,
        profile: item.fromUser,
      })
    ),
    sent: sentInterests.map((item) =>
      toInterestItem({
        ...item,
        profile: item.toUser,
      })
    ),
    accepted: acceptedInterests
      .filter((item) => item.toUser != null && item.fromUser != null)
      .map((item) =>
      ({
        ...toInterestItem({
          ...item,
          profile:
            item.fromUserId === session.user.id ? item.toUser : item.fromUser,
        }),
        conversationId:
          conversationIdByPair.get(
            `${normalizeConversationPair(item.fromUserId, item.toUser.id).userOneId}:${normalizeConversationPair(item.fromUserId, item.toUser.id).userTwoId}`
          ) ?? null,
      })
    ),
  };
  const topAcceptedMatches = interestBoardData.accepted.slice(0, 3);

  const actionCenterItems = [
    {
      title: "Respond to interests",
      detail:
        interestBoardData.received.length > 0
          ? `${interestBoardData.received.length} member${interestBoardData.received.length === 1 ? "" : "s"} waiting for your reply.`
          : "No pending replies right now.",
      href: "#interest-board",
      cta: interestBoardData.received.length > 0 ? "Review now" : "All clear",
    },
    {
      title: "Profile visibility",
      detail: currentUser?.profileVisible
        ? "Your profile is currently visible in browse."
        : "Your profile is hidden from browse until approval and an approved primary photo.",
      href: currentUser?.profileVisible ? "/profile" : "/profile/edit",
      cta: currentUser?.profileVisible ? "View profile" : "Fix profile",
    },
    {
      title: "Photo moderation",
      detail:
        rejectedPhotoCount > 0
          ? `${rejectedPhotoCount} photo${rejectedPhotoCount === 1 ? "" : "s"} need replacement after rejection.`
          : pendingPhotoCount > 0
            ? `${pendingPhotoCount} photo${pendingPhotoCount === 1 ? "" : "s"} still waiting for review.`
            : `${approvedPhotoCount} approved photo${approvedPhotoCount === 1 ? "" : "s"} on your account.`,
      href: "/profile/edit",
      cta:
        rejectedPhotoCount > 0
          ? "Replace photos"
          : pendingPhotoCount > 0
            ? "Check status"
            : "Manage photos",
    },
  ];

  const sidebarLinks = [
    {
      label: "Profile overview",
      href: "/profile",
      note: currentUser?.isApproved ? "Live member card" : "Complete before review",
    },
    {
      label: "Edit profile",
      href: "/profile/edit",
      note: isComplete ? "Keep details fresh" : `${completionPercent}% complete`,
    },
    {
      label: "Browse matches",
      href: "/browse",
      note: currentUser?.isApproved ? "Ready to explore" : "Unlock after approval",
    },
    {
      label: "Messages",
      href: "/chat",
      note:
        interestBoardData.accepted.length > 0
          ? `${interestBoardData.accepted.length} active match${interestBoardData.accepted.length === 1 ? "" : "es"}`
          : "No active chat yet",
    },
  ];

  let moderationGuidance = "Upload at least one strong profile photo so your account can appear confidently in browse.";
  if (rejectedPhotoCount > 0) {
    moderationGuidance =
      "Some of your photos were rejected by admin. Replace them with clearer, guideline-friendly images to become visible again.";
  } else if (!primaryPhoto) {
    moderationGuidance =
      "Upload at least one strong primary profile photo so your account can appear confidently in browse.";
  } else if (!primaryPhotoApproved) {
    moderationGuidance =
      "Your primary photo is still waiting for approval. It must be approved before your profile can appear in browse.";
  } else if (pendingPhotoCount > 0) {
    moderationGuidance =
      "Your latest uploaded photos are still under review. Visibility updates automatically after the primary photo is approved.";
  } else if (approvedPhotoCount > 0) {
    moderationGuidance =
      "Your approved photos are helping your profile stay visible in browse and match suggestions.";
  }

  return (
    <PageBackdrop>
      <Navbar />
      <UnreadMessageToast
        userId={session.user.id}
        shouldShow={shouldShowLoginNotice}
        unreadMessageCount={unreadMessageCount}
        unreadConversationCount={unreadConversationCount}
      />
      <main className="grid w-full gap-4 px-3 py-6 sm:gap-6 sm:px-6 sm:py-10 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="glass-card h-fit rounded-3xl p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-500">
            Dashboard
          </p>
          <nav className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {sidebarLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-2xl border border-transparent px-3 py-3 transition hover:border-brand-100 hover:bg-brand-50/50 dark:hover:border-white/10 dark:hover:bg-white/5"
              >
                <p className="font-semibold text-slate-900 dark:text-white">
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.note}
                </p>
              </Link>
            ))}
          </nav>
          <div className="mt-6 rounded-2xl border border-brand-100/60 bg-brand-50/50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-500">
              Membership
            </p>
            {activeSubscription ? (
              <>
                <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                  {activeSubscription.planName}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Until{" "}
                  {new Date(activeSubscription.expiresAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <Link
                  href="/subscribe"
                  className="mt-3 inline-block text-xs font-semibold text-brand-600 hover:underline"
                >
                  Upgrade plan
                </Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  No active plan. Unlock premium features with yearly membership.
                </p>
                <Link
                  href="/subscribe"
                  className="mt-3 inline-flex rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  View plans
                </Link>
              </>
            )}
          </div>
          <div className="mt-4 rounded-2xl border border-brand-100/60 bg-brand-50/50 p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            {moderationGuidance}
          </div>
        </aside>
        <section className="min-w-0 space-y-6">
          {shouldShowSubscribedNotice && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              Payment successful. Your membership is now active.
            </div>
          )}
          {!currentUser?.emailVerified && <VerifyEmailBanner />}
          {!isComplete ? (
            <div className="rounded-3xl border border-brand-100/60 bg-brand-50/60 p-4 text-sm text-slate-700 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-400">
                    Profile Completion
                  </p>
                  <h2 className="mt-2 font-serif text-2xl text-slate-900">
                    Complete your profile to get approved
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    You are {completionPercent}% done. Add missing details and
                    an approved photo to appear in matches.
                  </p>
                </div>
                <Link
                  href="/profile/edit"
                  className="rounded-2xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white"
                >
                  Complete Profile
                </Link>
              </div>
            </div>
          ) : null}
          <div className="glass-card rounded-3xl p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="font-serif text-2xl text-slate-900 dark:text-white sm:text-3xl">
                  Welcome back, {displayName}
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {nextStepMessage}
                </p>
              </div>
              <div className="flex flex-col items-start gap-1.5 sm:items-end sm:pl-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    label={approvalLabel}
                    tone={currentUser?.isApproved ? "verified" : "neutral"}
                  />
                  <Badge
                    label={visibilityLabel}
                    tone={currentUser?.profileVisible ? "premium" : "neutral"}
                  />
                </div>
                {currentUser?.emailVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:border-emerald-500/30 dark:bg-transparent dark:text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Email verified
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-6 rounded-3xl border border-brand-100/60 bg-brand-50/40 p-4 dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-400">
                    Accepted Matches
                  </p>
                  <h2 className="mt-2 font-serif text-2xl text-slate-900 dark:text-white">
                    Your active matches
                  </h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {interestBoardData.accepted.length} active match
                  {interestBoardData.accepted.length === 1 ? "" : "es"}
                </p>
              </div>
              <div className="mt-5">
                {topAcceptedMatches.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {topAcceptedMatches.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-3xl border border-white/60 bg-white/85 p-4 shadow-[0_12px_28px_rgba(127,16,62,0.05)] dark:border-white/10 dark:bg-slate-950/40"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={item.profile.photoUrl ?? "/profiles/p1.jpg"}
                            alt={item.profile.name}
                            className="face-focus h-16 w-16 shrink-0 rounded-2xl"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {item.profile.name}
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  {[item.profile.city, item.profile.profession]
                                    .filter(Boolean)
                                    .join(" - ") || "Active match"}
                                </p>
                              </div>
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                Matched
                              </span>
                            </div>
                            <div className="mt-4">
                              <Button
                                size="sm"
                                variant="secondary"
                                asChild
                                className="w-full"
                              >
                                <Link
                                  href={
                                    item.conversationId
                                      ? `/chat?conversation=${item.conversationId}`
                                      : "/chat"
                                  }
                                >
                                  Open Chat
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-brand-100/70 bg-white/70 p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    No accepted matches yet. They will show up here once someone
                    accepts your interest.
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Profile completion</span>
                <span>{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/profile/edit"
                className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Update Profile
              </Link>
              <Link
                href="/browse"
                className="rounded-2xl border border-brand-100/70 bg-white px-5 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                Browse Profiles
              </Link>
              <Link
                href="/chat"
                className="rounded-2xl border border-brand-100/70 bg-white px-5 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                Open Messages
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-brand-100/60 bg-white p-5 shadow-[0_10px_24px_rgba(127,16,62,0.06)] dark:border-white/10 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-400">
                Incoming Interests
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                {interestBoardData.received.length}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Members waiting for your response.
              </p>
            </div>
            <div className="rounded-3xl border border-brand-100/60 bg-white p-5 shadow-[0_10px_24px_rgba(127,16,62,0.06)] dark:border-white/10 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-400">
                Sent Interests
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                {interestBoardData.sent.length}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Profiles you are waiting to hear back from.
              </p>
            </div>
            <div className="rounded-3xl border border-brand-100/60 bg-white p-5 shadow-[0_10px_24px_rgba(127,16,62,0.06)] dark:border-white/10 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-400">
                Accepted Matches
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                {interestBoardData.accepted.length}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Mutual matches ready for conversation.
              </p>
            </div>
          </div>
          <InterestBoard
            received={interestBoardData.received}
            sent={interestBoardData.sent}
          />
          <div id="interest-board" className="space-y-6">
            <ActionCenter
              items={actionCenterItems}
              matchProgress={`${interestBoardData.accepted.length} accepted match${
                interestBoardData.accepted.length === 1 ? "" : "es"
              }, ${interestBoardData.sent.length} outgoing interest${
                interestBoardData.sent.length === 1 ? "" : "s"
              }, and ${interestBoardData.received.length} incoming request${
                interestBoardData.received.length === 1 ? "" : "s"
              }.`}
            />
          </div>
        </section>
      </main>
    </PageBackdrop>
  );
}
