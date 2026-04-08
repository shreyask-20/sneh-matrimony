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
      className="rounded-20 bg-white/80 px-4 py-2 text-slate-900 transition hover:bg-gradient-to-r hover:from-pink-200"
      onClick={() => {
        const backPath = sessionStorage.getItem("sneh:back-path");

        if (
          backPath &&
          backPath !== window.location.pathname + window.location.search
        ) {
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
