import type { Prisma } from "@prisma/client";
import { userToProfile } from "@/lib/profileAdapter";
import { getOppositeGender } from "@/lib/gender";

type InterestState =
  | "none"
  | "pending"
  | "incoming"
  | "accepted"
  | "declined"
  | "withdrawn";

type CandidateArgs = {
  prisma: any;
  currentUserId: string | null;
  currentUserGender?: string | null;
  limit?: number;
  offset?: number;
  filters?: CandidateSearchFilters;
};

type CandidateSearchFilters = {
  ageRange?: string | null;
  city?: string | null;
  religion?: string | null;
  education?: string | null;
  profession?: string | null;
  caste?: string | null;
};

const normalizeFilterValue = (value?: string | null) =>
  value?.trim() || null;

const broadPreferenceTerms = new Set([
  "any",
  "anywhere",
  "flexible",
  "open",
  "open to relocation",
  "nearby",
  "nearby cities",
  "nearby metro cities",
  "metro cities",
  "compatible",
  "compatible families",
  "compatible family",
  "compatible family background",
  "compatible family values",
  "family background",
  "family values",
  "family first",
  "family-first",
  "values driven match",
  "values-driven match",
  "values led families",
  "values-led families",
  "respectful family values",
  "strong family values",
  "stable families",
  "modern family",
  "grounded family",
]);

const fillerWords = new Set([
  "a",
  "an",
  "and",
  "background",
  "cities",
  "city",
  "compatible",
  "family",
  "families",
  "first",
  "flexible",
  "grounded",
  "match",
  "metro",
  "modern",
  "nearby",
  "open",
  "oriented",
  "preferred",
  "relocation",
  "respectful",
  "stable",
  "strong",
  "the",
  "to",
  "values",
  "values-driven",
  "values-led",
]);

export const parseTextPreferenceTerms = (value?: string | null) => {
  const input = normalizeFilterValue(value);
  if (!input) return [];

  return input
    .split(/\s*(?:,|\/|\||;|\bor\b)\s*/i)
    .map((part) => part.trim())
    .flatMap((part) => {
      const normalizedPart = part
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!normalizedPart || broadPreferenceTerms.has(normalizedPart)) {
        return [];
      }

      if (
        normalizedPart.includes("flexible") ||
        normalizedPart.includes("relocation") ||
        normalizedPart === "open to all"
      ) {
        return [];
      }

      const words = normalizedPart
        .split(/\s+/)
        .filter((word) => !fillerWords.has(word));

      const term = words.join(" ").trim();
      return term ? [term] : [];
    })
    .filter((term, index, terms) => terms.indexOf(term) === index);
};

const shiftYears = (baseDate: Date, years: number) => {
  const date = new Date(baseDate);
  date.setFullYear(date.getFullYear() - years);
  return date;
};

const parseAgeRange = (
  value?: string | null
): Prisma.UserWhereInput["birthDate"] | null => {
  const input = normalizeFilterValue(value);
  if (!input) return null;

  const compact = input.replace(/\s+/g, "");
  const plusMatch = compact.match(/^(\d{1,2})\+$/);
  if (plusMatch) {
    const minAge = Number(plusMatch[1]);
    if (!Number.isFinite(minAge)) return null;
    return {
      lte: shiftYears(new Date(), minAge),
    };
  }

  const rangeMatch = compact.match(/^(\d{1,2})-(\d{1,2})$/);
  if (rangeMatch) {
    const firstAge = Number(rangeMatch[1]);
    const secondAge = Number(rangeMatch[2]);
    if (!Number.isFinite(firstAge) || !Number.isFinite(secondAge)) {
      return null;
    }

    const minAge = Math.min(firstAge, secondAge);
    const maxAge = Math.max(firstAge, secondAge);

    return {
      gt: shiftYears(new Date(), maxAge + 1),
      lte: shiftYears(new Date(), minAge),
    };
  }

  const exactMatch = compact.match(/^(\d{1,2})$/);
  if (exactMatch) {
    const age = Number(exactMatch[1]);
    if (!Number.isFinite(age)) return null;
    return {
      gt: shiftYears(new Date(), age + 1),
      lte: shiftYears(new Date(), age),
    };
  }

  return null;
};

const buildSearchConditions = (
  filters: CandidateSearchFilters
): Prisma.UserWhereInput[] => {
  const conditions: Prisma.UserWhereInput[] = [];
  const ageRange = parseAgeRange(filters.ageRange);

  if (ageRange) {
    conditions.push({ birthDate: ageRange });
  }

  for (const [field, value] of [
    ["city", filters.city],
    ["religion", filters.religion],
    ["education", filters.education],
    ["profession", filters.profession],
    ["community", filters.caste],
  ] as const) {
    const terms = parseTextPreferenceTerms(value);
    if (terms.length === 0) continue;

    conditions.push(
      terms.length === 1
        ? {
            [field]: {
              contains: terms[0],
              mode: "insensitive",
            },
          }
        : {
            OR: terms.map((term) => ({
              [field]: {
                contains: term,
                mode: "insensitive",
              },
            })),
          }
    );
  }

  return conditions;
};

export async function getCandidateProfiles({
  prisma,
  currentUserId,
  currentUserGender,
  limit,
  offset = 0,
  filters = {},
}: CandidateArgs) {
  const targetGender = getOppositeGender(currentUserGender);
  const searchConditions = buildSearchConditions(filters);
  const shouldFilterGender = Boolean(currentUserId && targetGender);

  const where: Prisma.UserWhereInput = {
    roleName: "USER",
    isApproved: true,
    profileVisible: true,
    deletedAt: null, // exclude soft-deleted users
    ...(currentUserId ? { id: { not: currentUserId } } : {}),
    ...(shouldFilterGender ? { gender: targetGender } : {}),
    ...(searchConditions.length > 0 ? { AND: searchConditions } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        city: true,
        profession: true,
        education: true,
        religion: true,
        height: true,
        bio: true,
        emailVerified: true,
        isApproved: true,
        isPremium: true,
        profileVisible: true,
        photos: {
          where: { status: "APPROVED" },
          select: { url: true },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        subscriptions: {
          where: { status: "ACTIVE", expiresAt: { gt: new Date() } },
          select: { plan: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: limit, skip: offset } : {}),
    }),
    prisma.user.count({ where }),
  ]);

  const interests = currentUserId
    ? await prisma.interest.findMany({
        where: {
          OR: [{ fromUserId: currentUserId }, { toUserId: currentUserId }],
        },
        select: {
          fromUserId: true,
          toUserId: true,
          status: true,
        },
      })
    : [];

  const interestStateByUserId = new Map<string, InterestState>();

  for (const interest of interests) {
    if (interest.fromUserId === currentUserId) {
      interestStateByUserId.set(
        interest.toUserId,
        interest.status === "PENDING"
          ? "pending"
          : interest.status === "ACCEPTED"
            ? "accepted"
            : interest.status === "DECLINED"
              ? "declined"
              : "withdrawn"
      );
    } else if (interest.toUserId === currentUserId) {
      interestStateByUserId.set(
        interest.fromUserId,
        interest.status === "PENDING"
          ? "incoming"
          : interest.status === "ACCEPTED"
            ? "accepted"
            : interest.status === "DECLINED"
              ? "declined"
              : "withdrawn"
      );
    }
  }

  return {
    profiles: users.map((user: any) => ({
      userId: user.id,
      profile: userToProfile(user),
      interestState: interestStateByUserId.get(user.id) ?? "none",
    })),
    total,
  };
}
