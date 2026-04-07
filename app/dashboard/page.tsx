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
import PageBackdrop from "../../components/shared/PageBackdrop";
import BrowseResults from "../browse/BrowseResults";
import { getCandidateProfiles } from "@/lib/candidateProfiles";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ login?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const shouldShowLoginNotice = resolvedSearchParams?.login === "1";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <PageBackdrop>
        <Navbar />
        <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
          <div className="glass-card rounded-3xl p-8 text-center">
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

  const currentUser = await prisma.user.findUnique({
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
      photos: {
        select: { id: true, status: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const requiredFields = [
    currentUser?.name,
    currentUser?.gender,
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
  const profiles = await getCandidateProfiles({
    prisma,
    currentUserId: session.user.id,
    currentUserGender: currentUser?.gender,
    limit: 4,
  });

  const [receivedInterests, sentInterests, acceptedInterests] = await Promise.all([
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

  const unreadMessageRows = shouldShowLoginNotice
    ? await prisma.message.findMany({
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
    : [];
  const unreadMessageCount = unreadMessageRows.length;
  const unreadConversationCount = new Set(
    unreadMessageRows.map((row) => row.conversationId)
  ).size;

  const acceptedConversationPairs = acceptedInterests.map((item) =>
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
    accepted: acceptedInterests.map((item) =>
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

  const recommendationHeadline = currentUser?.isApproved
    ? profiles.length > 0
      ? "Recommended matches for you"
      : "Recommendations will appear soon"
    : "Complete approval to unlock recommendations";

  const recommendationSubcopy = currentUser?.isApproved
    ? profiles.length > 0
      ? "These approved profiles are currently visible and ready for meaningful introductions."
      : "We don't have any visible profiles to suggest right now. Check back after more members are approved."
    : "Once your profile is approved, your recommendations will become much more relevant and active.";

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
      note: currentUser?.isApproved ? `${profiles.length} visible now` : "Unlock after approval",
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
      <main className="grid w-full gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="glass-card h-fit rounded-3xl p-5">
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
          <div className="mt-6 rounded-2xl border border-brand-100/60 bg-brand-50/50 p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            {moderationGuidance}
          </div>
        </aside>
        <section className="space-y-6">
          {!isComplete ? (
            <div className="rounded-3xl border border-brand-100/60 bg-brand-50/60 p-6 text-sm text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
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
                  className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
                >
                  Complete Profile
                </Link>
              </div>
            </div>
          ) : null}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
                  Welcome back, {displayName}
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {nextStepMessage}
                </p>
              </div>
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
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-brand-100/60 bg-brand-50/40 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-xs uppercase tracking-[0.18em] text-brand-400">
                  Membership Status
                </p>
                <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                  {approvalLabel}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {currentUser?.isApproved
                    ? "You can now appear to other members and receive interest requests."
                    : "Your profile is waiting for admin review before it goes live."}
                </p>
              </div>
              <div className="rounded-3xl border border-brand-100/60 bg-brand-50/40 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-xs uppercase tracking-[0.18em] text-brand-400">
                  Profile Health
                </p>
                <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                  {profileHealthLabel}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {completed}/{totalRequired} core requirements completed, including an approved primary photo.
                </p>
              </div>
              <div className="rounded-3xl border border-brand-100/60 bg-brand-50/40 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-xs uppercase tracking-[0.18em] text-brand-400">
                  Primary Photo
                </p>
                <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                  {primaryPhotoApproved ? "Approved" : "Waiting for approval"}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {approvedPhotoCount} approved, {pendingPhotoCount} pending, {rejectedPhotoCount} rejected.
                </p>
                {rejectedPhotoCount > 0 ? (
                  <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
                    Replace rejected photos from your profile editor to restore visibility.
                  </p>
                ) : null}
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
            accepted={interestBoardData.accepted}
          />
          <div
            id="interest-board"
            className="grid items-start gap-6 lg:grid-cols-[1.35fr_0.65fr]"
          >
            <div className="flex items-center justify-between lg:col-span-2">
              <div>
                <h2 className="font-serif text-2xl text-slate-900 dark:text-white">
                  {recommendationHeadline}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {recommendationSubcopy}
                </p>
              </div>
              <span className="text-sm text-brand-500">
                {profiles.length} live recommendation
                {profiles.length === 1 ? "" : "s"}
              </span>
            </div>
            <BrowseResults
              profiles={profiles}
              signedIn={Boolean(session.user.id)}
              emptyMessage={
                currentUser?.isApproved
                  ? "No approved profiles are visible yet. New matches will show up here as more members go live."
                  : "Recommendations are paused until your own profile clears approval."
              }
            />
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
