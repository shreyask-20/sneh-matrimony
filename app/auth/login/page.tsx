import Button from "../../../components/shared/Button";
import Navbar from "../../../components/shared/Navbar";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-16 sm:px-6">
        <div className="glass-card w-full max-w-md rounded-3xl p-8">
          <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Log in to continue your matchmaking journey.
          </p>
          <form className="mt-6 space-y-4">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Email or phone number"
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Password"
              type="password"
            />
            <Button className="w-full">Log in</Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            New here?{" "}
            <a className="font-semibold text-brand-500" href="/auth/register">
              Create a profile
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
