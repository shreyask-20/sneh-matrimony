"use client";

import { useRouter } from "next/navigation";
import Button from "./Button";

export default function BackButton({
  fallbackHref = "/dashboard",
}: {
  fallbackHref?: string;
}) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }

        router.push(fallbackHref);
      }}
    >
      ← Back
    </Button>
  );
}
