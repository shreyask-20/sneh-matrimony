import type { Profile } from "@/data/profiles";
import { buildVerificationSummary } from "@/lib/verification";

export type UserForCard = {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  birthDate: Date | null;
  city: string | null;
  profession: string | null;
  education: string | null;
  religion: string | null;
  height: string | null;
  bio: string | null;
  emailVerified: Date | null;
  isApproved: boolean;
  isPremium: boolean;
  profileVisible: boolean;
  photos: Array<{ url: string }>;
  subscriptions: Array<{ plan: string }>;
};

const hashId = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

export function userToProfile(user: UserForCard): Profile {
  const name =
    user.name ??
    (`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Profile");

  const age = user.birthDate
    ? Math.max(0, Math.floor((Date.now() - user.birthDate.getTime()) / 31557600000))
    : 0;

  return {
    id: hashId(user.id),
    name,
    age,
    location: user.city ?? "",
    faith: user.religion ?? "",
    education: user.education ?? "",
    height: user.height ?? "",
    image: user.photos[0]?.url ?? "/profiles/p1.jpg",
    verified: user.isApproved,
    verification: buildVerificationSummary({
      isApproved: user.isApproved,
      emailVerified: user.emailVerified,
      approvedPhotoCount: user.photos.length,
    }),
    premium: user.isPremium && user.subscriptions[0]?.plan
      ? user.subscriptions[0].plan.charAt(0) + user.subscriptions[0].plan.slice(1).toLowerCase()
      : undefined,
    about: user.bio ?? "Profile details are being updated.",
  };
}
