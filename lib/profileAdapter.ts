import type { Profile } from "@/data/profiles";

export type UserForCard = {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  birthDate: Date | null;
  city: string | null;
  education: string | null;
  bio: string | null;
  isApproved: boolean;
  profileVisible: boolean;
  photos: Array<{ url: string }>;
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
    faith: "",
    education: user.education ?? "",
    height: "",
    image: user.photos[0]?.url ?? "/profiles/p1.jpg",
    verified: user.isApproved,
    premium: false,
    about: user.bio ?? "Profile details are being updated.",
  };
}
