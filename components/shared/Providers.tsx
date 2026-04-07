"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function RouteHistoryTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const currentPath = query ? `${pathname}?${query}` : pathname;
    const previousPath = sessionStorage.getItem("sneh:last-path");

    if (previousPath && previousPath !== currentPath) {
      sessionStorage.setItem("sneh:back-path", previousPath);
    }

    sessionStorage.setItem("sneh:last-path", currentPath);
  }, [pathname, searchParams]);

  return null;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const routeKey = query ? `${pathname}?${query}` : pathname;

  return (
    <div key={routeKey} className="page-transition">
      {children}
    </div>
  );
}

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <RouteHistoryTracker />
      <PageTransition>{children}</PageTransition>
    </SessionProvider>
  );
}
