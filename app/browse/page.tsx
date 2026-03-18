import Navbar from "../../components/shared/Navbar";
import ProfileCard from "../../components/shared/ProfileCard";
import Button from "../../components/shared/Button";
import { profiles } from "../../data/profiles";

export default function BrowsePage() {
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
                2400+ profiles across India and global communities.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              Swipe mode
              <span className="h-2 w-2 rounded-full bg-brand-500" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {profiles.concat(profiles).slice(0, 6).map((profile, index) => (
              <ProfileCard
                key={`${profile.id}-${index}`}
                profile={profile}
                actionLabel="Express Interest"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
