import { profiles } from "../../data/profiles";
import ProfileCard from "../shared/ProfileCard";

export default function FeaturedProfiles() {
  const marqueeProfiles = [...profiles, ...profiles];
  return (
    <section className="w-full px-4 pb-16 sm:px-6 lg:px-8 xl:px-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="section-heading">Featured Profiles</h2>
          <p className="section-subtitle mt-2">
            Curated by our relationship experts for quality and compatibility.
          </p>
        </div>
        <button className="text-sm font-semibold text-brand-500">
          View all
        </button>
      </div>
      <div className="marquee-fade relative overflow-hidden rounded-3xl bg-rose-dawn py-6 dark:bg-white/5">
        <div className="marquee-track flex w-max gap-6 px-4">
          {marqueeProfiles.map((profile, index) => (
            <div
              key={`${profile.id}-${index}`}
              className="min-w-[260px] max-w-[180px] shrink-0"
            >
              <ProfileCard
                profile={profile}
                actionLabel="Connect"
                size="compact"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
