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
  const loginButtonClass = isBlend
    ? ""
    : "text-brand-600 border-brand-200 bg-white/90 hover:text-brand-700";

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

    const handleFocus = () => {
      void loadUnreadCount();
    };

    window.addEventListener("focus", handleFocus);
    const interval = window.setInterval(() => {
      void loadUnreadCount();
    }, 60000);

    return () => {
      active = false;
      controller.abort();
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(interval);
    };
  }, [status, isAdmin, pathname]);

  return (
    <header
      className={`sticky z-50 ${
        isBlend
          ? "bg-gradient-to-b from-[#7F103E]/0 to-transparent backdrop-blur-sm"
          : "bg-white/95 backdrop-blur border-b border-brand-100/40 shadow-[0_6px_18px_rgba(127,16,62,0.08)]"
      } ${className}`}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-1 sm:px-6">
        <a className="flex items-center" href="/">
          <img
            src={isBlend ? "/profiles/nav-logo1.png" : "/profiles/nav-logo.png"}
            alt="Sneh Matrimony"
            className="h-24 -my-2 w-auto object-contain"
          />
        </a>
        <div
          className={`hidden items-center gap-6 text-sm md:flex ${
            isBlend ? "text-white/90" : "text-slate-700"
          }`}
        >
          {!isAdmin ? (
            <>
              <a
                className={`transition ${
                  isBlend ? "hover:text-white" : "hover:text-brand-500"
                }`}
                href="/browse"
              >
                Browse
              </a>
              <a
                className={`transition ${
                  isBlend ? "hover:text-white" : "hover:text-brand-500"
                }`}
                href="/dashboard"
              >
                Dashboard
              </a>
              <a
                className={`transition ${
                  isBlend ? "hover:text-white" : "hover:text-brand-500"
                }`}
                href="/chat"
              >
                <span className="inline-flex items-center gap-2">
                  Messages
                  {unreadConversationCount > 0 ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                      {unreadConversationCount}
                    </span>
                  ) : null}
                </span>
              </a>
            </>
          ) : null}
          {isAdmin ? (
            <a
              className={`transition ${
                isBlend ? "hover:text-white" : "hover:text-brand-500"
              }`}
              href="/admin"
            >
              Admin
            </a>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <>
              {!isAdmin ? (
                <Button
                  asChild
                  variant="secondary"
                  className="h-10 rounded-20 border-brand-100/70 bg-white/90 px-4 text-slate-700 shadow-sm hover:bg-brand-50"
                >
                  <a href="/profile" className="inline-flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4" />
                    Profile
                  </a>
                </Button>
              ) : null}
              <SignOutButton />
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
      {status === "authenticated" ? (
        <div
          className={`flex items-center gap-2 overflow-x-auto px-4 pb-3 text-sm sm:px-6 md:hidden ${
            isBlend ? "text-white/90" : "text-slate-700"
          }`}
        >
          {!isAdmin ? (
            <>
              <a
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 transition ${
                  isBlend
                    ? "border-white/15 bg-white/10 hover:bg-white/15"
                    : "border-brand-100 bg-white/90 hover:border-brand-200 hover:bg-brand-50"
                }`}
                href="/browse"
              >
                <Home className="h-4 w-4" />
                Browse
              </a>
              <a
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 transition ${
                  isBlend
                    ? "border-white/15 bg-white/10 hover:bg-white/15"
                    : "border-brand-100 bg-white/90 hover:border-brand-200 hover:bg-brand-50"
                }`}
                href="/dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </a>
              <a
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 transition ${
                  isBlend
                    ? "border-white/15 bg-white/10 hover:bg-white/15"
                    : "border-brand-100 bg-white/90 hover:border-brand-200 hover:bg-brand-50"
                }`}
                href="/chat"
              >
                <MessageCircleMore className="h-4 w-4" />
                <span className="inline-flex items-center gap-2">
                  Messages
                  {unreadConversationCount > 0 ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                      {unreadConversationCount}
                    </span>
                  ) : null}
                </span>
              </a>
            </>
          ) : (
            <a
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 transition ${
                isBlend
                  ? "border-white/15 bg-white/10 hover:bg-white/15"
                  : "border-brand-100 bg-white/90 hover:border-brand-200 hover:bg-brand-50"
              }`}
              href="/admin"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </a>
          )}
        </div>
      ) : null}
    </header>
  );
}
