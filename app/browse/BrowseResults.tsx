"use client";

import Link from "next/link";
import ProfileCard from "@/components/shared/ProfileCard";
import Button from "@/components/shared/Button";
import InterestActionButton from "@/components/shared/InterestActionButton";
import Pagination from "@/components/shared/Pagination";
import type { Profile } from "@/data/profiles";
import { Suspense } from "react";

type InterestState =
  | "none"
  | "pending"
  | "incoming"
  | "accepted"
  | "declined"
  | "withdrawn";

type BrowseProfile = {
  profile: Profile;
  userId: string;
  interestState: InterestState;
};

export default function BrowseResults({
  profiles,
  signedIn,
  emptyMessage,
  currentPage,
  totalPages,
}: {
  profiles: BrowseProfile[];
  signedIn: boolean;
  emptyMessage?: string;
  currentPage?: number;
  totalPages?: number;
}) {
  if (profiles.length === 0) {
    return (
      <div className="rounded-2xl border border-white/40 bg-white/70 p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
        {emptyMessage ?? "No profiles are visible yet. Please check back soon."}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {profiles.map(({ profile, userId, interestState }) => (
          <ProfileCard
            key={userId}
            profile={profile}
            actionSlot={
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/profiles/${userId}`}>View Profile</Link>
                </Button>
                <InterestActionButton
                  targetUserId={userId}
                  signedIn={signedIn}
                  initialState={interestState}
                />
              </div>
            }
          />
        ))}
      </div>
      {currentPage !== undefined && totalPages !== undefined && (
        <Suspense>
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </Suspense>
      )}
    </>
  );
}
