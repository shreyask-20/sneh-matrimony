export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 py-10 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-400">
      <div className="grid w-full gap-6 px-4 sm:px-6 lg:px-8 xl:px-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <img
            src="/profiles/footer-logo.jpg"
            alt="Sneh Matrimony footer logo"
            className="h-24 w-auto rounded-2xl object-cover"
          />
          <p className="mt-2 max-w-sm">
            A modern, heart-led platform for families seeking meaningful
            partnerships.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Explore
          </p>
          <p>About us</p>
          <p>Success stories</p>
          <p>Safety & privacy</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Contact
          </p>
          <p>Location - Nashik, Maharashtra</p>
          <p>Email ID - snehmatrimonyindia@gmail.com</p>
          <p>Mobile - 9922641116</p>
        </div>
      </div>
    </footer>
  );
}
