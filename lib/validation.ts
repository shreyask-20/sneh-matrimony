import { NextResponse } from "next/server";

/**
 * Sanitize a string input: trim whitespace and limit length.
 */
export function sanitizeString(value: unknown, maxLength = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, maxLength);
}

/**
 * Validate that a value is a valid email address.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate Indian phone number format.
 */
export function isValidPhone(phone: string): boolean {
  return /^(?:\+91|0)?[6-9]\d{9}$/.test(phone);
}

/**
 * Validate that a date string represents a valid date in the past.
 */
export function isValidBirthDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const now = new Date();
  return date < now;
}

/**
 * Calculate age from a birth date.
 */
export function calculateAge(birthDate: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Validate that a password meets minimum requirements.
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Create a 400 Bad Request response with an error message.
 */
export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Common validation constants.
 */
export const VALIDATION = {
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
  MAX_PHONE_LENGTH: 15,
  MAX_BIO_LENGTH: 1000,
  MAX_CITY_LENGTH: 100,
  MAX_PROFESSION_LENGTH: 200,
  MAX_EDUCATION_LENGTH: 200,
  MAX_MESSAGE_LENGTH: 5000,
  MIN_PASSWORD_LENGTH: 8,
} as const;
