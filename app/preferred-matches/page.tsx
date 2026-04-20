import Navbar from "../../components/shared/Navbar";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BrowseResults from "../browse/BrowseResults";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import PageBackdrop from "../../components/shared/PageBackdrop";
import { getCandidateProfiles } from "@/lib/candidateProfiles";

export default async function PreferredMatchesPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.roleName === "ADMIN") {
    redirect("/admin");
  }

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const currentUserId = session.user.id;

  // Fetch current user with preferences
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: {
      gender: true,
      isApproved: true,
      profileVisible: true,
      preferences: {
        select: {
          preferredAgeRange: true,
          religionCommunity: true,
          locationPreference: true,
          castePreference: true,
        },
      },
    },
  });

  if (!currentUser) {
    redirect("/auth/login");
  }

  // Build search filters from user preferences
  const searchFilters = {
    ageRange: currentUser.preferences?.preferredAgeRange || null,
    city: currentUser.preferences?.locationPreference || null,
    religion: currentUser.preferences?.religionCommunity || null,
    education: null,
    profession: null,
    caste: currentUser.preferences?.castePreference || null,
  };

  // Get matching profiles
  const profiles = await getCandidateProfiles({
    prisma,
    currentUserId,
    currentUserGender: currentUser.gender,
    filters: searchFilters,
  });

  const hasPreferences = Object.values(currentUser.preferences || {}).some(
    (value) => value
  );

  const emptyMessage = !hasPreferences
    ? "Please fill in your preferences on your profile to see personalized matches."
    : profiles.length === 0
      ? "No matches found based on your preferences. Check back soon or update your preferences."
      : undefined;

  return (
    <PageBackdrop>
      <Navbar />
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
                Matches For You
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {profiles.length} profiles based on your preferences.
              </p>
              {hasPreferences ? (
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-brand-500">
                  Personalized matches
                </p>
              ) : null}
            </div>
          </div>
          <BrowseResults
            profiles={profiles}
            signedIn={true}
            emptyMessage={emptyMessage}
          />
        </section>
      </main>
    </PageBackdrop>
  );
}
