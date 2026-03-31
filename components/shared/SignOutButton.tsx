"use client";

import { signOut } from "next-auth/react";
import Button from "./Button";

export default function SignOutButton() {
  return (
    <Button onClick={() => signOut({ callbackUrl: "/auth/login" })}>
      Sign out
    </Button>
  );
}
