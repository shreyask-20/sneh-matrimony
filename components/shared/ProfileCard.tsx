import type React from "react";
import Image from "next/image";
import Badge from "./Badge";
import type { Profile } from "../../data/profiles";
import Button from "./Button";

type Props = {
  profile: Profile;
  actionLabel?: string;
  size?: "normal" | "compact";
  actionSlot?: React.ReactNode;
};

export default function ProfileCard({
  profile,
  actionLabel = "View",
  size = "normal",
  actionSlot,
}: Props) {
  const isCompact = size === "compact";
  const ageLabel = profile.age > 0 ? profile.age : "-";
  const locationLabel = profile.location || "Location not set";
  const educationLabel = profile.education || "Education not set";
  const faithLabel = profile.faith || "Not specified";
  const verificationLabel =
    profile.verification?.tierLabel ??
    (profile.verified ? "Profile verified" : undefined);
  const verificationBadges =
    profile.verification?.badges ?? (profile.verified ? ["Profile"] : []);
  const lastActiveLabel = profile.verification?.lastActiveLabel;

  return (
    <div
      className={`glass-card card-clean group flex flex-col gap-5 overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:shadow-soft ${
        isCompact ? "h-auto min-h-[420px] p-4 sm:h-[450px]" : "min-h-[520px] p-4 sm:min-h-[560px] sm:p-5"
      }`}
    >
      <div
        className={`relative w-full overflow-hidden rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 ${
          isCompact ? "aspect-[5/4]" : "aspect-[3/3]"
        }`}
      >
        <Image
          src={profile.image}
          alt={profile.name}
          fill
          sizes={
            isCompact
              ? "(min-width: 1024px) 200px, (min-width: 640px) 180px, 160px"
              : "(min-width: 1024px) 360px, (min-width: 640px) 320px, 280px"
          }
          quality={70}
          className="face-focus-portrait"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]" />
      </div>
      <div className="flex min-h-14 items-start justify-between gap-2 overflow-hidden">
        <div className="min-w-0 flex-1">
          <h3
            className={`font-serif text-slate-900 dark:text-white ${
              isCompact ? "text-base" : "text-lg"
            } line-clamp-1`}
          >
            {profile.name}, {ageLabel}
          </h3>
          <p className="line-clamp-1 text-sm text-slate-500 dark:text-slate-300">
            {locationLabel} - {educationLabel}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {verificationLabel && (
            <Badge label={verificationLabel} tone="verified" />
          )}
          {profile.premium && <Badge label={profile.premium} tone="premium" />}
        </div>
      </div>
      <div className="flex h-8 items-center gap-2 overflow-hidden text-xs text-slate-500 dark:text-slate-300">
        {verificationBadges.length > 0 && (
          <span className="truncate">
            Verified: {verificationBadges.join(" · ")}
          </span>
        )}
        {lastActiveLabel && (
          <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            {lastActiveLabel}
          </span>
        )}
      </div>
      <p
        className={`line-clamp-2 overflow-hidden text-sm text-slate-600 dark:text-slate-300`}
      >
        {profile.about}
      </p>
      <div className="mt-auto flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          {faithLabel}
        </p>
        {actionSlot ?? (
          <Button
            size="sm"
            variant="secondary"
            className="w-full whitespace-normal sm:w-auto"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
