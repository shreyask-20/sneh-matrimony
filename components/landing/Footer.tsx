export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 py-10 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-400">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <img
            src="/profiles/footer-logo.jpg"
            alt="Sneh Matrimony footer logo"
            className="mb-4 h-20 w-auto rounded-2xl object-cover"
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
          <p>support@snehmatrimony.com</p>
          <p>+91 90000 12345</p>
          <p>Konkan · Marathwada · Vidarbha · Khandesh</p>
        </div>
      </div>
    </footer>
  );
}
