"use client";

import Button from "./Button";
import AnimatedGradientButton from "./AnimatedGradientButton";
import SignOutButton from "./SignOutButton";
import { useSession } from "next-auth/react";

type NavbarProps = {
  className?: string;
};

export default function Navbar({ className = "" }: NavbarProps) {
  const { data: session, status } = useSession();
  const roleName = session?.user?.roleName;

  return (
    <header
      className={`sticky z-50 bg-gradient-to-r from-[#7F103E] via-[#C43C6E] to-[#EAA0B8] ${className}`}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-1 sm:px-6">
        <a className="flex items-center" href="/">
          <img
            src="/profiles/nav-logo1.png"
            alt="Sneh Matrimony"
            className="h-24 -my-2 w-auto object-contain"
          />
        </a>
        <div className="hidden items-center gap-6 text-sm text-white/90 md:flex">
          <a className="transition hover:text-white" href="/browse">
            Browse
          </a>
          <a className="transition hover:text-white" href="/dashboard">
            Dashboard
          </a>
          <a className="transition hover:text-white" href="/chat">
            Messages
          </a>
          {roleName === "ADMIN" ? (
            <a className="transition hover:text-white" href="/admin">
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
                className="h-9 px-4"
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
