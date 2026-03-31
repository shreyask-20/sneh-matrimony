import Navbar from "../../components/shared/Navbar";
import ProfileCard from "../../components/shared/ProfileCard";
import Button from "../../components/shared/Button";
import { prisma } from "@/lib/prisma";
import { userToProfile } from "@/lib/profileAdapter";

export default async function BrowsePage() {
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
  });

  const profiles = users.map(userToProfile);

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
          <div className="grid gap-6 md:grid-cols-2">
            {profiles.length === 0 ? (
              <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No profiles are visible yet. Please check back soon.
              </div>
            ) : (
              profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  actionLabel="Express Interest"
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
