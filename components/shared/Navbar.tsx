import Button from "./Button";
import AnimatedGradientButton from "./AnimatedGradientButton";

type NavbarProps = {
  className?: string;
};

export default function Navbar({ className = "" }: NavbarProps) {
  return (
    <header
      className={`sticky z-50 bg-gradient-to-b from-[#7F103E]/0 to-transparent backdrop-blur-sm ${className}`}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-1 sm:px-6">
        <a className="flex items-center" href="/">
          <img
            src="/profiles/nav-logo1.png"
            alt="Sneh Matrimony"
            className="h-24 -my-2 w-auto object-contain"
          />
        </a>
        <div className="hidden items-center gap-6 text-sm text-brand-100/90 md:flex">
          <a className="transition hover:text-brand-200" href="/browse">
            Browse
          </a>
          <a className="transition hover:text-brand-200" href="/dashboard">
            Dashboard
          </a>
          <a className="transition hover:text-brand-200" href="/chat">
            Messages
          </a>
          <a className="transition hover:text-brand-200" href="/admin">
            Admin
          </a>
        </div>
        <div className="flex items-center gap-3">
          <AnimatedGradientButton
            variant="ghost"
            className="h-9 px-4"
          >
            Log in
          </AnimatedGradientButton>
          <Button>Create Profile</Button>
        </div>
      </nav>
    </header>
  );
}
