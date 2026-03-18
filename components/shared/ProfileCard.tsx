import Badge from "./Badge";
import type { Profile } from "../../data/profiles";
import Button from "./Button";

type Props = {
  profile: Profile;
  actionLabel?: string;
  size?: "normal" | "compact";
};

export default function ProfileCard({
  profile,
  actionLabel = "View",
  size = "normal",
}: Props) {
  const isCompact = size === "compact";
  return (
    <div
      className={`glass-card card-clean group flex flex-col gap-5 overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:shadow-soft ${
        isCompact ? "h-[400px] p-4" : "h-[420px] p-5"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-white/60 ${
          isCompact ? "h-40" : "h-52"
        }`}
      >
        <img
          src={profile.image}
          alt={profile.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)]" />

      </div>
      <div className="flex items-start justify-between">
        <div>
          <h3
            className={`font-serif text-slate-900 dark:text-white ${
              isCompact ? "text-base" : "text-lg"
            }`}
          >
            {profile.name}, {profile.age}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            {profile.location} · {profile.education}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {profile.verified && <Badge label="Verified" tone="verified" />}
          {profile.premium && <Badge label="Premium" tone="premium" />}
        </div>
      </div>
      <p
        className={`overflow-hidden text-sm text-slate-600 dark:text-slate-300 ${
          isCompact ? "max-h-[60px]" : "max-h-[72px]"
        }`}
      >
        {profile.about}
      </p>
      <div className="mt-auto flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          {profile.faith}
        </p>
        <Button size="sm" variant="secondary">
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
