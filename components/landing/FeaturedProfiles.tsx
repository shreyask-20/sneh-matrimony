import Link from "next/link";
import ProfileCard from "../shared/ProfileCard";
import type { Profile } from "../../data/profiles";
import Button from "../shared/Button";

type FeaturedProfile = {
  userId: string;
  profile: Profile;
};

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
        <button className="text-sm font-semibold text-brand-500">
          View all
        </button>
      </div>
      <div className="marquee-fade marquee-pause relative overflow-hidden rounded-3xl bg-rose-dawn py-6 dark:bg-white/5">
        <div className="marquee-track flex w-max gap-6 px-4">
          {marqueeProfiles.map((item, index) => (
            <div
              key={`${item.userId}-${index}`}
              className="min-w-[260px] max-w-[180px] shrink-0"
            >
              <ProfileCard
                profile={item.profile}
                size="compact"
                actionSlot={
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="w-full whitespace-normal sm:w-auto"
                  >
                    <Link href={`/profiles/${item.userId}`}>View Profile</Link>
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
