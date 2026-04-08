"use client";

import { signOut } from "next-auth/react";
import Button from "./Button";

export default function SignOutButton() {
  return (
    <Button
      className="h-10 rounded-20 px-4"
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
    >
      Sign out
    </Button>
  );
}
