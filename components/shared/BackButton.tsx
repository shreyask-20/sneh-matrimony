"use client";

import { useRouter } from "next/navigation";

export default function BackButton({
  fallbackHref = "/dashboard",
}: {
  fallbackHref?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="inline-flex h-10 items-center rounded-md bg-brand-600 px-4 text-white shadow-sm"
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
      {"\u2190"} Back
    </button>
  );
}
