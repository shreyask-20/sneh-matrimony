import Navbar from "../../components/shared/Navbar";
import Button from "../../components/shared/Button";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BrowseResults from "./BrowseResults";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import PageBackdrop from "../../components/shared/PageBackdrop";
import { getCandidateProfiles } from "@/lib/candidateProfiles";

type BrowseSearchParams = {
  ageRange?: string | string[];
  city?: string | string[];
  religion?: string | string[];
  education?: string | string[];
  profession?: string | string[];
  caste?: string | string[];
};

const firstQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const normalizeQueryValue = (value: string | string[] | undefined) =>
  firstQueryValue(value)?.trim() || null;

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
  const searchFilters = {
    ageRange: normalizeQueryValue(resolvedSearchParams.ageRange),
    city: normalizeQueryValue(resolvedSearchParams.city),
    religion: normalizeQueryValue(resolvedSearchParams.religion),
    education: normalizeQueryValue(resolvedSearchParams.education),
    profession: normalizeQueryValue(resolvedSearchParams.profession),
    caste: normalizeQueryValue(resolvedSearchParams.caste),
  };

  const currentUserPromise = currentUserId
    ? prisma.user.findUnique({
        where: { id: currentUserId },
        select: {
          gender: true,
          isApproved: true,
          profileVisible: true,
        },
      })
    : Promise.resolve(null);

  const profilesPromise = session?.user?.gender
    ? getCandidateProfiles({
        prisma,
        currentUserId,
        currentUserGender: session.user.gender,
        filters: searchFilters,
      })
    : null;

  const [currentUser, profilesSeed] = await Promise.all([
    currentUserPromise,
    profilesPromise ?? Promise.resolve(null),
  ]);

  const profiles =
    profilesSeed ??
    (currentUserId
      ? await getCandidateProfiles({
          prisma,
          currentUserId,
          currentUserGender: currentUser?.gender ?? null,
          filters: searchFilters,
        })
      : await getCandidateProfiles({
          prisma,
          currentUserId: null,
          filters: searchFilters,
        }));

  const activeFilters = Object.entries(searchFilters).filter(([, value]) => value);
  const emptyMessage =
    profiles.length === 0
      ? activeFilters.length > 0
        ? `No matches found for these filters. Try broadening your search.`
        : currentUser?.isApproved && currentUser?.profileVisible
          ? "No other profiles are available right now. Browse does not show your own profile."
          : "No profiles are visible yet. Please check back soon."
      : undefined;

  return (
    <PageBackdrop>
      <Navbar />
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="glass-card h-fit rounded-3xl p-6">
          <h2 className="font-serif text-xl text-slate-900 dark:text-white">
            Filters
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            {["Age", "Height", "Caste", "Education", "City", "Profession"].map(
              (label) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  {label}
                </div>
              )
            )}
          </div>
          <Button className="mt-6 w-full">Apply filters</Button>
        </aside>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
                Browse matches
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {profiles.length} profiles available for you.
              </p>
              {activeFilters.length > 0 ? (
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-brand-500">
                  Filtered by{" "}
                  {activeFilters
                    .map(([label, value]) => `${label}: ${value}`)
                    .join(" | ")}
                </p>
              ) : null}
            </div>
          </div>
          <BrowseResults
            profiles={profiles}
            signedIn={Boolean(currentUserId)}
            emptyMessage={emptyMessage}
          />
        </section>
      </main>
    </PageBackdrop>
  );
}
