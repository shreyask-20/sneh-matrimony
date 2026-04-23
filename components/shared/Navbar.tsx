"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Button from "./Button";
import AnimatedGradientButton from "./AnimatedGradientButton";
import SignOutButton from "./SignOutButton";
import { useSession } from "next-auth/react";
import {
  Home,
  LayoutDashboard,
  MessageCircleMore,
  UserCircle2,
  ShieldCheck,
  Heart,
  Menu,
  X,
} from "lucide-react";

type NavbarProps = {
  className?: string;
  variant?: "blend" | "solid";
};

export default function Navbar({
  className = "",
  variant = "solid",
}: NavbarProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const roleName = session?.user?.roleName;
  const isAdmin = roleName === "ADMIN";
  const isBlend = variant === "blend";
  const [unreadConversationCount, setUnreadConversationCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const loginButtonClass = isBlend
    ? ""
    : "text-brand-600 border-brand-200 bg-white/90 hover:text-brand-700";

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (status !== "authenticated" || isAdmin) {
      setUnreadConversationCount(0);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const loadUnreadCount = async () => {
      try {
        const response = await fetch("/api/chat/unread-count", {
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data = (await response.json()) as {
          unreadConversationCount?: number;
        };

        if (active) {
          setUnreadConversationCount(data.unreadConversationCount ?? 0);
        }
      } catch {
        if (active) {
          setUnreadConversationCount(0);
        }
      }
    };

    void loadUnreadCount();

    const handleFocus = () => { void loadUnreadCount(); };
    window.addEventListener("focus", handleFocus);
    const interval = window.setInterval(() => { void loadUnreadCount(); }, 60000);

    return () => {
      active = false;
      controller.abort();
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(interval);
    };
  }, [status, isAdmin, pathname]);

  const mobileNavLinks = !isAdmin ? [
    { href: "/browse", icon: <Home className="h-5 w-5" />, label: "Browse" },
    { href: "/preferred-matches", icon: <Heart className="h-5 w-5" />, label: "Preferred Matches" },
    { href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    {
      href: "/chat",
      icon: <MessageCircleMore className="h-5 w-5" />,
      label: "Messages",
      badge: unreadConversationCount > 0 ? unreadConversationCount : null,
    },
    { href: "/profile", icon: <UserCircle2 className="h-5 w-5" />, label: "Profile" },
  ] : [
    { href: "/admin", icon: <ShieldCheck className="h-5 w-5" />, label: "Admin", badge: null },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-[55] ${
          isBlend
            ? "bg-gradient-to-b from-[#7F103E]/0 to-transparent backdrop-blur-sm"
            : "bg-white/95 backdrop-blur border-b border-brand-100/40 shadow-[0_6px_18px_rgba(127,16,62,0.08)]"
        } ${className}`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <nav className="flex w-full items-center justify-between py-1">
            <a className="flex items-center -ml-3" href="/">
              <img
                src={isBlend ? "/profiles/navi.png" : "/profiles/nav-logo.png"}
                alt="Sneh Matrimony"
                className={`${isBlend ? "h-14 sm:h-20" : "h-16 sm:h-24"} w-auto shrink-0 object-contain`}
              />
            </a>

            {/* Desktop feature pills */}
            <div
              className={`hidden items-center gap-2 text-xs lg:flex ${
                isBlend ? "text-white/80" : "text-slate-600"
              }`}
            >
              {["Privacy-first", "Verified profiles", "Secure chat"].map((label) => (
                <span
                  key={label}
                  className={`rounded-full border px-3 py-1 transition ${
                    isBlend
                      ? "border-white/20 bg-white/10"
                      : "border-brand-100 bg-brand-50/60"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Desktop nav links */}
            <div
              className={`hidden items-center gap-6 text-sm md:flex ${
                isBlend ? "text-white/90" : "text-slate-700"
              }`}
            >
              {!isAdmin ? (
                <>
                  {[
                    { href: "/browse", label: "Browse" },
                    { href: "/preferred-matches", label: "Preferred Matches" },
                    { href: "/dashboard", label: "Dashboard" },
                  ].map(({ href, label }) => (
                    <a
                      key={href}
                      href={href}
                      className={`bg-[length:200%_100%] bg-right text-transparent transition ${
                        isBlend
                          ? "bg-gradient-to-r from-white/80 to-white bg-clip-text hover:bg-left"
                          : "bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text hover:bg-left"
                      }`}
                    >
                      {label}
                    </a>
                  ))}
                  <a
                    href="/chat"
                    className={`bg-[length:200%_100%] bg-right text-transparent transition ${
                      isBlend
                        ? "bg-gradient-to-r from-white/80 to-white bg-clip-text hover:bg-left"
                        : "bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text hover:bg-left"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      Messages
                      {unreadConversationCount > 0 && (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                          {unreadConversationCount}
                        </span>
                      )}
                    </span>
                  </a>
                </>
              ) : (
                <a
                  href="/admin"
                  className={`bg-[length:200%_100%] bg-right text-transparent transition ${
                    isBlend
                      ? "bg-gradient-to-r from-white/80 to-white bg-clip-text hover:bg-left"
                      : "bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text hover:bg-left"
                  }`}
                >
                  Admin
                </a>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {status === "authenticated" ? (
                <>
                  {/* Desktop profile + signout */}
                  {!isAdmin ? (
                    <Button
                      asChild
                      variant="secondary"
                      className="hidden h-10 rounded-20 border-brand-100/70 bg-white/90 px-4 text-slate-700 shadow-sm hover:bg-brand-50 md:inline-flex"
                    >
                      <a href="/profile" className="inline-flex items-center gap-2">
                        <UserCircle2 className="h-4 w-4" />
                        Profile
                      </a>
                    </Button>
                  ) : null}
                  <div className="hidden md:block">
                    <SignOutButton />
                  </div>

                  {/* Mobile hamburger */}
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition md:hidden ${
                      isBlend
                        ? "text-white hover:bg-white/10"
                        : "text-slate-700 hover:bg-brand-50"
                    }`}
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                  >
                    {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                </>
              ) : status === "unauthenticated" ? (
                <>
                  <AnimatedGradientButton
                    variant="ghost"
                    className={`h-9 px-4 ${loginButtonClass}`}
                    asChild
                  >
                    <a href="/auth/login">Log in</a>
                  </AnimatedGradientButton>
                  <Button asChild>
                    <a href="/auth/register">Create Profile</a>
                  </Button>
                </>
              ) : null}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && status === "authenticated" && (
        <div className="fixed inset-x-0 top-0 z-[60] md:hidden">
          {/* Backdrop — only covers below the menu panel */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu panel — fixed width, anchored top-right, not full height */}
          <div
            className="absolute right-4 top-16 w-64 overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nav links */}
            <nav className="flex flex-col p-2">
              {mobileNavLinks.map(({ href, icon, label, badge }) => (
                <a
                  key={href}
                  href={href}
                  className={`flex min-h-[48px] items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    pathname === href
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                  }`}
                >
                  <span className={pathname === href ? "text-brand-500" : "text-slate-400"}>
                    {icon}
                  </span>
                  <span className="flex-1">{label}</span>
                  {badge != null && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                      {badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>

            {/* Divider + Sign out */}
            <div className="border-t border-slate-100 p-2 dark:border-white/10">
              <SignOutButton className="w-full justify-center" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
