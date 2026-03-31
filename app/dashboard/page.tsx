import Navbar from "../../components/shared/Navbar";
import Progress from "../../components/shared/Progress";
import ProfileCard from "../../components/shared/ProfileCard";
import Badge from "../../components/shared/Badge";
import { prisma } from "@/lib/prisma";
import { userToProfile } from "@/lib/profileAdapter";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar />
        <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
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
      </div>
    );
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
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
      photos: {
        where: { status: "APPROVED" },
        select: { id: true },
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
  const photosComplete = currentUser?.photos.length ? 1 : 0;
  const totalRequired = requiredFields.length + 1;
  const completed = completedRequired + photosComplete;
  const completionPercent = Math.round((completed / totalRequired) * 100);
  const isComplete = completionPercent === 100;

  const users = await prisma.user.findMany({
    where: {
      roleName: "USER",
      isApproved: true,
      profileVisible: true,
      gender: { not: null },
      birthDate: { not: null },
      maritalStatus: { not: null },
      height: { not: null },
      profession: { not: null },
      education: { not: null },
      city: { not: null },
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      city: true,
      education: true,
      bio: true,
      isApproved: true,
      profileVisible: true,
      photos: {
        where: { status: "APPROVED" },
        select: { url: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const profiles = users.map(userToProfile);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="glass-card h-fit rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-500">
            Dashboard
          </p>
          <nav className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">
              Profile
            </p>
            <p>Matches</p>
            <p>Messages</p>
            <p>Settings</p>
          </nav>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
                  Good afternoon
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {isComplete
                    ? "Your profile is complete and ready for matches."
                    : "Complete your profile to unlock better recommendations."}
                </p>
              </div>
              <Badge label={currentUser?.isApproved ? "Verified" : "Pending"} tone="verified" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Profile completion</span>
                <span>{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} />
            </div>
          </div>
          <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="flex items-center justify-between lg:col-span-2">
              <h2 className="font-serif text-2xl text-slate-900 dark:text-white">
                Recommended matches
              </h2>
              <span className="text-sm text-brand-500">
                AI match score 92%
              </span>
            </div>
            <div>
              <div className="grid gap-6 md:grid-cols-2">
                {profiles.length === 0 ? (
                  <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    No approved profiles are visible yet.
                  </div>
                ) : (
                  profiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      actionLabel="View Profile"
                    />
                  ))
                )}
              </div>
            </div>
            <div className="glass-card rounded-3xl p-6">
              <h3 className="font-serif text-xl text-slate-900 dark:text-white">
                Notifications
              </h3>
              <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="rounded-2xl border border-white/40 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                  3 new profile views today.
                </div>
                <div className="rounded-2xl border border-white/40 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                  Raghav expressed interest in your profile.
                </div>
                <div className="rounded-2xl border border-white/40 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                  Complete your family details for better matches.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
