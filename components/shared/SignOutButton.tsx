"use client";

import { signOut } from "next-auth/react";
import Button from "./Button";

export default function SignOutButton({ className }: { className?: string }) {
  return (
    <Button
      className={`h-10 rounded-20 px-4 ${className ?? ""}`}
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
    >
      Sign out
    </Button>
  );
}
