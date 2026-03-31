"use client";

import Button from "./Button";
import AnimatedGradientButton from "./AnimatedGradientButton";
import SignOutButton from "./SignOutButton";
import { useSession } from "next-auth/react";

type NavbarProps = {
  className?: string;
  variant?: "blend" | "solid";
};

export default function Navbar({
  className = "",
  variant = "solid",
}: NavbarProps) {
  const { data: session, status } = useSession();
  const roleName = session?.user?.roleName;
  const isBlend = variant === "blend";
  const loginButtonClass = isBlend
    ? ""
    : "text-brand-600 border-brand-200 bg-white/90 hover:text-brand-700";

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
            Messages
          </a>
          {roleName === "ADMIN" ? (
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
            <SignOutButton />
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
    </header>
  );
}
