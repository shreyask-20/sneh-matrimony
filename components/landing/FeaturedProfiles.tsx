import Link from "next/link";
import type { Profile } from "../../data/profiles";

type FeaturedProfile = {
  userId: string;
  profile: Profile;
};

function MarqueeCard({ userId, profile }: FeaturedProfile) {
  return (
    <Link
      href={`/profiles/${userId}`}
      className="group relative flex w-[200px] shrink-0 flex-col overflow-hidden rounded-3xl shadow-[0_8px_32px_rgba(127,16,62,0.10)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(127,16,62,0.18)] sm:w-[230px]"
    >
      {/* Photo — tall portrait */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={profile.image}
          alt={profile.name}
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay — bottom fade for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Verified badge — top right */}
        {profile.verification?.badges.includes("Email") && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-brand-600 shadow-sm backdrop-blur-sm dark:bg-black/60 dark:text-brand-300">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        )}

        {/* Name + location overlaid on photo */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="font-serif text-base font-semibold leading-tight text-white drop-shadow">
            {profile.name}{profile.age > 0 ? `, ${profile.age}` : ""}
          </p>
          {profile.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
              <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.location}
            </p>
          )}
        </div>
      </div>

      {/* Bottom strip */}
      <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-slate-900">
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {profile.education || profile.faith || "Member"}
        </p>
        <span className="ml-2 shrink-0 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-semibold text-white transition group-hover:bg-brand-700">
          View
        </span>
      </div>
    </Link>
  );
}

export default function FeaturedProfiles({
  profiles,
}: {
  profiles: FeaturedProfile[];
}) {
  const marqueeProfiles = [...profiles, ...profiles, ...profiles, ...profiles];

  return (
    <section className="w-full px-4 pb-16 sm:px-6 lg:px-8 xl:px-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="section-heading">Featured Profiles</h2>
          <p className="section-subtitle mt-2">
            Curated by our relationship experts for quality and compatibility.
          </p>
        </div>
        <Link
          href="/browse"
          className="text-sm font-semibold text-brand-500 hover:text-brand-600"
        >
          View all
        </Link>
      </div>

      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-rose-dawn py-16 text-center dark:bg-white/5">
          <p className="font-serif text-lg text-slate-700 dark:text-slate-200">
            Profiles coming soon
          </p>
          <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Our team is reviewing and curating profiles. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="marquee-fade marquee-pause relative overflow-hidden rounded-3xl bg-rose-dawn py-8 dark:bg-white/5">
          <div className="marquee-track flex w-max items-stretch gap-5 px-6">
            {marqueeProfiles.map((item, index) => (
              <MarqueeCard
                key={`${item.userId}-${index}`}
                userId={item.userId}
                profile={item.profile}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
