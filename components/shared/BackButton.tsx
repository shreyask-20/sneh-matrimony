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
        const backPath = sessionStorage.getItem("sneh:back-path");

        if (backPath && backPath !== window.location.pathname + window.location.search) {
          router.push(backPath);
          return;
        }

        router.push(fallbackHref);
      }}
    >
      ← Back
    </Button>
  );
}
