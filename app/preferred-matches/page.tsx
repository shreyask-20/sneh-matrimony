import Navbar from "../../components/shared/Navbar";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BrowseResults from "../browse/BrowseResults";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import PageBackdrop from "../../components/shared/PageBackdrop";
import { getCandidateProfiles } from "@/lib/candidateProfiles";
import Link from "next/link";

export default async function PreferredMatchesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  if (session.user.roleName === "ADMIN") {
    redirect("/admin");
  }

  const currentUserId = session.user.id;

  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: {
      gender: true,
      isApproved: true,
      profileVisible: true,
      preferences: {
        select: {
          preferredAgeRange: true,
          locationPreference: true,
          religionCommunity: true,
          castePreference: true,
        },
      },
    },
  });

  const prefs = currentUser?.preferences;
  const hasPreferences = Boolean(
    prefs?.preferredAgeRange ||
      prefs?.locationPreference ||
      prefs?.religionCommunity ||
      prefs?.castePreference
  );

  // Build filters from saved preferences
  const preferenceFilters = {
    ageRange: prefs?.preferredAgeRange ?? null,
    city: prefs?.locationPreference ?? null,
    religion: prefs?.religionCommunity ?? null,
    education: null,
    profession: null,
    caste: prefs?.castePreference ?? null,
  };

  const { profiles } = hasPreferences
    ? await getCandidateProfiles({
        prisma,
        currentUserId,
        currentUserGender: session.user.gender ?? currentUser?.gender ?? null,
        filters: preferenceFilters,
      })
    : { profiles: [] };

  const activePrefs = [
    prefs?.preferredAgeRange && `Age: ${prefs.preferredAgeRange}`,
    prefs?.religionCommunity && `Religion: ${prefs.religionCommunity}`,
    prefs?.locationPreference && `Location: ${prefs.locationPreference}`,
    prefs?.castePreference && `Caste: ${prefs.castePreference}`,
  ].filter(Boolean) as string[];

  const emptyMessage =
    profiles.length === 0 && hasPreferences
      ? "No profiles match your current preferences. Try updating them from your profile."
      : undefined;

  return (
    <PageBackdrop>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
            Preferred Matches
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Profiles filtered based on the preferences you saved in your profile.
          </p>
          {activePrefs.length > 0 && (
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-brand-500">
              {activePrefs.join(" · ")}
            </p>
          )}
        </div>

        {!hasPreferences ? (
          <div className="rounded-3xl border border-brand-100/60 bg-brand-50/50 p-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
            <p className="font-serif text-xl text-slate-900 dark:text-white">
              No preferences set yet
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Fill in your partner preferences in your profile to see matches here.
            </p>
            <Link
              href="/profile/edit"
              className="mt-5 inline-flex rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Set preferences
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {profiles.length} profile{profiles.length === 1 ? "" : "s"} match your preferences.
              </p>
              <Link
                href="/profile/edit"
                className="text-xs text-brand-500 underline underline-offset-2 hover:text-brand-700"
              >
                Update preferences
              </Link>
            </div>
            <BrowseResults
              profiles={profiles}
              signedIn={true}
              emptyMessage={emptyMessage}
            />
          </>
        )}
      </main>
    </PageBackdrop>
  );
}
