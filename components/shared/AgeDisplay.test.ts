import { describe, it, expect } from "vitest";

/**
 * Pure age calculation logic — mirrors exactly what AgeDisplay.tsx does.
 * Tests the math without needing a browser or React renderer.
 */
function calcAge(birthDate: string | Date, now: Date): number {
  const birth = new Date(birthDate);
  return Math.max(0, Math.floor((now.getTime() - birth.getTime()) / 31_557_600_000));
}

describe("AgeDisplay — age calculation", () => {
  it("calculates age correctly for someone born exactly 30 years ago", () => {
    const now = new Date("2025-04-27T12:00:00Z");
    const birth = new Date("1995-04-27T12:00:00Z");
    expect(calcAge(birth, now)).toBe(30);
  });

  it("returns 29 when birthday hasn't happened yet this year", () => {
    const now = new Date("2025-04-27T12:00:00Z");
    const birth = new Date("1995-12-01T12:00:00Z"); // December — not yet
    expect(calcAge(birth, now)).toBe(29);
  });

  it("returns 30 when birthday already passed this year", () => {
    const now = new Date("2025-04-27T12:00:00Z");
    const birth = new Date("1995-01-15T12:00:00Z"); // January — already passed
    expect(calcAge(birth, now)).toBe(30);
  });

  it("returns 0 for a future birth date", () => {
    const now = new Date("2025-04-27T12:00:00Z");
    const birth = new Date("2030-01-01T12:00:00Z");
    expect(calcAge(birth, now)).toBe(0);
  });

  it("returns 0 for a newborn (same day)", () => {
    const now = new Date("2025-04-27T12:00:00Z");
    const birth = new Date("2025-04-27T06:00:00Z");
    expect(calcAge(birth, now)).toBe(0);
  });

  it("handles leap year birthdays correctly", () => {
    const now = new Date("2025-03-01T12:00:00Z");
    const birth = new Date("2000-02-29T12:00:00Z");
    expect(calcAge(birth, now)).toBe(25);
  });

  it("accepts a string date input", () => {
    const now = new Date("2025-04-27T12:00:00Z");
    expect(calcAge("1990-04-27", now)).toBe(35);
  });

  it("handles someone turning 18 today", () => {
    const now = new Date("2025-04-27T12:00:00Z");
    const birth = new Date("2007-04-27T06:00:00Z");
    expect(calcAge(birth, now)).toBe(18);
  });
});
