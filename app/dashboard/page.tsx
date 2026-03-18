import Navbar from "../../components/shared/Navbar";
import Progress from "../../components/shared/Progress";
import ProfileCard from "../../components/shared/ProfileCard";
import Badge from "../../components/shared/Badge";
import { profiles } from "../../data/profiles";

export default function DashboardPage() {
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
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
                  Good afternoon, Aanya
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Complete your profile to unlock better recommendations.
                </p>
              </div>
              <Badge label="Verified" tone="verified" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Profile completion</span>
                <span>78%</span>
              </div>
              <Progress value={78} />
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
                {profiles.slice(0, 4).map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    actionLabel="View Profile"
                  />
                ))}
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
