import Navbar from "../../components/shared/Navbar";
import Badge from "../../components/shared/Badge";

const users = [
  { name: "Aanya Sharma", status: "Verified", plan: "Platinum" },
  { name: "Raghav Mehta", status: "Pending", plan: "Gold" },
  { name: "Sara Khan", status: "Verified", plan: "Gold" },
  { name: "Arjun Nair", status: "Review", plan: "Free" },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
            Admin overview
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Verify profiles, review reports, and monitor subscriptions.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-serif text-2xl text-slate-900 dark:text-white">
              User list
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              {users.map((user) => (
                <div
                  key={user.name}
                  className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Plan: {user.plan}
                    </p>
                  </div>
                  <Badge
                    label={user.status}
                    tone={user.status === "Verified" ? "verified" : "neutral"}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6">
              <h3 className="font-serif text-xl text-slate-900 dark:text-white">
                Verification queue
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                12 profiles pending video verification this week.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-6">
              <h3 className="font-serif text-xl text-slate-900 dark:text-white">
                Reports & safety
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                4 new reports flagged. Review within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
