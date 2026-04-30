"use client";

/**
 * Calculates and displays age from a birthDate string.
 * Runs on the client so the age is always accurate to the user's local clock,
 * avoiding the server-side Date.now() drift issue.
 */
export default function AgeDisplay({
  birthDate,
  className,
}: {
  birthDate: string | Date | null | undefined;
  className?: string;
}) {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  const now = new Date();
  const age = Math.max(
    0,
    Math.floor((now.getTime() - birth.getTime()) / 31_557_600_000) // ms per Julian year
  );

  return <span className={className}>{age}</span>;
}
