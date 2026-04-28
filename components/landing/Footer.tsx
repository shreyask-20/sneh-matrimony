export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 py-10 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-400">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">

        {/* Logo + tagline */}
        <div className="space-y-3">
          <img
            src="/profiles/footer-logo.jpg"
            alt="Sneh Matrimony"
            className="h-20 w-auto object-contain"
          />
          <p className="text-xs leading-relaxed">
            A modern, heart-led platform for families seeking meaningful partnerships.
          </p>
        </div>

        {/* Explore */}
        <div className="space-y-3">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Explore</p>
          <ul className="space-y-2">
            <li><a href="/#about" className="transition-colors hover:text-brand-600">About us</a></li>
            <li><a href="/#testimonials" className="transition-colors hover:text-brand-600">Success stories</a></li>
            <li><a href="/auth/register" className="transition-colors hover:text-brand-600">Safety &amp; privacy</a></li>
          </ul>
        </div>

        {/* Trust */}
        <div className="space-y-3">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Trust</p>
          <ul className="space-y-2">
            <li><a href="/auth/register" className="transition-colors hover:text-brand-600">Privacy-first</a></li>
            <li><a href="/browse" className="transition-colors hover:text-brand-600">Verified profiles</a></li>
            <li><a href="/chat" className="transition-colors hover:text-brand-600">Secure chat</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Contact</p>
          <ul className="space-y-2">
            <li>Nashik, Maharashtra</li>
            <li>snehmatrimonyindia@gmail.com</li>
            <li>9922641116</li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
