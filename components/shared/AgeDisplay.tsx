"use client";

import { useState, useEffect } from "react";

/**
 * Calculates and displays age from a birthDate string.
 * Uses useState + useEffect to compute age only on the client,
 * avoiding hydration mismatches between server and client renders.
 */
export default function AgeDisplay({
  birthDate,
  className,
}: {
  birthDate: string | Date | null | undefined;
  className?: string;
}) {
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    if (!birthDate) return;
    const birth = new Date(birthDate);
    const now = new Date();
    setAge(
      Math.max(
        0,
        Math.floor((now.getTime() - birth.getTime()) / 31_557_600_000)
      )
    );
  }, [birthDate]);

  if (age === null) return null;

  return <span className={className}>{age}</span>;
}
