export function getOppositeGender(gender?: string | null) {
  const normalized = gender?.trim().toLowerCase();

  if (normalized === "male") {
    return "Female";
  }

  if (normalized === "female") {
    return "Male";
  }

  return null;
}
