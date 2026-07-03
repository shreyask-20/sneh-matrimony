import type { Metadata } from "next";
import Navbar from "../../components/shared/Navbar";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BrowseResults from "./BrowseResults";
import BrowseFilters from "./BrowseFilters";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import PageBackdrop from "../../components/shared/PageBackdrop";
import { getCandidateProfiles } from "@/lib/candidateProfiles";
import { getActiveSubscription } from "@/lib/subscription-status";
import { isFemaleInFreePeriod } from "@/lib/promo";
import SubscriptionOverlay from "../../components/subscription/SubscriptionOverlay";
import { Suspense } from "react";

const PAGE_SIZE = 4;

type BrowseSearchParams = {
  ageRange?: string | string[];
  city?: string | string[];
  religion?: string | string[];
  education?: string | string[];
  profession?: string | string[];
  caste?: string | string[];
  page?: string | string[];
};

const firstQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const normalizeQueryValue = (value: string | string[] | undefined) =>
  firstQueryValue(value)?.trim() || null;

export const metadata: Metadata = {
  title: "Browse Matches",
  description:
    "Browse verified matrimony profiles and find your perfect life partner. Filter by age, city, religion, education, and more on Sneh Matrimony.",
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams?: Promise<BrowseSearchParams>;
}) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = (await (searchParams ??
    Promise.resolve({} as BrowseSearchParams))) as BrowseSearchParams;

  if (session?.user?.roleName === "ADMIN") {
    redirect("/admin");
  }

  const currentUserId = session?.user?.id ?? null;

  const rawPage = Number(firstQueryValue(resolvedSearchParams.page) ?? "1");
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const searchFilters = {
    ageRange: normalizeQueryValue(resolvedSearchParams.ageRange),
    city: normalizeQueryValue(resolvedSearchParams.city),
    religion: normalizeQueryValue(resolvedSearchParams.religion),
    education: normalizeQueryValue(resolvedSearchParams.education),
    profession: normalizeQueryValue(resolvedSearchParams.profession),
    caste: normalizeQueryValue(resolvedSearchParams.caste),
  };

  const currentUser = currentUserId
    ? await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { firstName: true, gender: true, isApproved: true, profileVisible: true, createdAt: true },
      })
    : null;

  let needsSubscription = false;
  if (currentUserId) {
    const subscription = await getActiveSubscription(currentUserId);
    const hasSubscription = subscription !== null;
    const isFemale = currentUser?.gender?.trim().toLowerCase() === "female";
    const isFreePeriod = isFemale && currentUser?.createdAt
      ? isFemaleInFreePeriod(currentUser.createdAt)
      : false;
    needsSubscription = !hasSubscription && !isFreePeriod;
  }

  const { profiles, total } = await getCandidateProfiles({
    prisma,
    currentUserId,
    currentUserGender: session?.user?.gender ?? currentUser?.gender ?? null,
    filters: searchFilters,
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // Clamp page to valid range
  const safePage = Math.min(currentPage, totalPages);

  const activeFilters = Object.entries(searchFilters).filter(([, value]) => value);
  const emptyMessage =
    profiles.length === 0
      ? activeFilters.length > 0
        ? "No matches found for these filters. Try broadening your search."
        : currentUser?.isApproved && currentUser?.profileVisible
          ? "No other profiles are available right now. Browse does not show your own profile."
          : "No profiles are visible yet. Please check back soon."
      : undefined;

  return (
    <PageBackdrop>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="glass-card hidden h-fit rounded-3xl p-6 lg:block">
          <h2 className="font-serif text-xl text-slate-900 dark:text-white">
            Filters
          </h2>
          <div className="mt-4">
            <Suspense>
              <BrowseFilters defaults={{}} />
            </Suspense>
          </div>
        </aside>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl text-slate-900 sm:text-3xl dark:text-white">
                Browse matches
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {total} profile{total === 1 ? "" : "s"} available
                {totalPages > 1 ? ` · page ${safePage} of ${totalPages}` : ""}.
              </p>
              {activeFilters.length > 0 && (
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-brand-500">
                  Filtered by{" "}
                  {activeFilters.map(([label, value]) => `${label}: ${value}`).join(" · ")}
                </p>
              )}
            </div>
            {/* Mobile filter button rendered inside BrowseFilters */}
            <div className="lg:hidden">
              <Suspense>
                <BrowseFilters defaults={{}} />
              </Suspense>
            </div>
          </div>
          <BrowseResults
            profiles={profiles}
            signedIn={Boolean(currentUserId)}
            emptyMessage={emptyMessage}
            currentPage={safePage}
            totalPages={totalPages}
            isApproved={currentUser?.isApproved ?? false}
          />
        </section>
      </main>
      {needsSubscription && (
        <SubscriptionOverlay userName={currentUser?.firstName ?? undefined} />
      )}
    </PageBackdrop>
  );
}
