import Button from "./Button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-white/50 via-white/30 to-transparent backdrop-blur-2xl shadow-[0_12px_40px_rgba(194,24,91,0.12)] dark:from-slate-950/70 dark:via-slate-950/40 dark:to-transparent">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
        <a className="flex items-center" href="/">
          <img
            src="/profiles/nav-logo.png"
            alt="Sneh Matrimony"
            className="h-20 w-auto object-contain"
          />
        </a>
        <div className="hidden items-center gap-6 text-sm text-slate-600 dark:text-slate-300 md:flex">
          <a className="transition hover:text-brand-600" href="/browse">
            Browse
          </a>
          <a className="transition hover:text-brand-600" href="/dashboard">
            Dashboard
          </a>
          <a className="transition hover:text-brand-600" href="/chat">
            Messages
          </a>
          <a className="transition hover:text-brand-600" href="/admin">
            Admin
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost">Log in</Button>
          <Button>Create Profile</Button>
        </div>
      </nav>
    </header>
  );
}
