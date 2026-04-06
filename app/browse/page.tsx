import Navbar from "../../components/shared/Navbar";
import Button from "../../components/shared/Button";
import { prisma } from "@/lib/prisma";
import { userToProfile } from "@/lib/profileAdapter";
import BrowseResults from "./BrowseResults";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export default async function BrowsePage() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? null;
  const currentUser = currentUserId
    ? await prisma.user.findUnique({
        where: { id: currentUserId },
        select: {
          isApproved: true,
          profileVisible: true,
        },
      })
    : null;

  const users = await prisma.user.findMany({
    where: {
      roleName: "USER",
      isApproved: true,
      profileVisible: true,
      ...(currentUserId ? { id: { not: currentUserId } } : {}),
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
  });

  const interests = currentUserId
    ? await prisma.interest.findMany({
        where: {
          OR: [{ fromUserId: currentUserId }, { toUserId: currentUserId }],
        },
        select: {
          fromUserId: true,
          toUserId: true,
          status: true,
        },
      })
    : [];

  const interestStateByUserId = new Map<
    string,
    "none" | "pending" | "incoming" | "accepted" | "declined" | "withdrawn"
  >();

  for (const interest of interests) {
    if (interest.fromUserId === currentUserId) {
      interestStateByUserId.set(
        interest.toUserId,
        interest.status === "PENDING"
          ? "pending"
          : interest.status === "ACCEPTED"
            ? "accepted"
            : interest.status === "DECLINED"
              ? "declined"
              : "withdrawn"
      );
    } else if (interest.toUserId === currentUserId) {
      interestStateByUserId.set(
        interest.fromUserId,
        interest.status === "PENDING"
          ? "incoming"
          : interest.status === "ACCEPTED"
            ? "accepted"
            : interest.status === "DECLINED"
              ? "declined"
              : "withdrawn"
      );
    }
  }

  const profiles = users.map((user) => ({
    profile: userToProfile(user),
    userId: user.id,
    interestState: interestStateByUserId.get(user.id) ?? "none",
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass-card h-fit rounded-3xl p-6">
          <h2 className="font-serif text-xl text-slate-900 dark:text-white">
            Filters
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            {[
              "Age",
              "Height",
              "Caste",
              "Education",
              "City",
              "Profession",
            ].map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                {label}
              </div>
            ))}
          </div>
          <Button className="mt-6 w-full">Apply filters</Button>
        </aside>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
                Browse matches
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {profiles.length} profiles available for you.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              Swipe mode
              <span className="h-2 w-2 rounded-full bg-brand-500" />
            </div>
          </div>
          <BrowseResults
            profiles={profiles}
            signedIn={Boolean(currentUserId)}
            emptyMessage={
              currentUser?.isApproved && currentUser?.profileVisible
                ? "Your profile is approved and live, but Browse does not show your own profile. Sign in with another user to verify it appears there."
                : undefined
            }
          />
        </section>
      </main>
    </div>
  );
}
