export type VerificationBadge = "Profile" | "Photo" | "Email" | "ID" | "Video";

export type VerificationSummary = {
  tierLabel: string;
  badges: VerificationBadge[];
  lastActiveLabel?: string;
};

type VerificationInputs = {
  isApproved?: boolean | null;
  emailVerified?: Date | null;
  approvedPhotoCount?: number | null;
  idVerified?: boolean | null;
  videoVerified?: boolean | null;
};

export const buildVerificationSummary = ({
  isApproved,
  emailVerified,
  approvedPhotoCount,
  idVerified,
  videoVerified,
}: VerificationInputs): VerificationSummary => {
  const badges: VerificationBadge[] = [];

  if (isApproved) badges.push("Profile");
  if ((approvedPhotoCount ?? 0) > 0) badges.push("Photo");
  if (emailVerified) badges.push("Email");
  if (idVerified) badges.push("ID");
  if (videoVerified) badges.push("Video");

  let tierLabel = "Verification pending";
  if (badges.includes("Video")) tierLabel = "Video verified";
  else if (badges.includes("ID")) tierLabel = "ID verified";
  else if (badges.includes("Photo")) tierLabel = "Photo verified";
  else if (badges.includes("Email")) tierLabel = "Email verified";
  else if (badges.includes("Profile")) tierLabel = "Profile verified";

  return { tierLabel, badges };
};
