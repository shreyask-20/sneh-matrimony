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
    const normalized = normalizeFilterValue(value);
    if (!normalized) continue;
    conditions.push({
      [field]: {
        contains: normalized,
        mode: "insensitive",
      },
    });
  }

  return conditions;
};

export async function getCandidateProfiles({
  prisma,
  currentUserId,
  currentUserGender,
  limit,
  filters = {},
}: CandidateArgs) {
  const targetGender = getOppositeGender(currentUserGender);
  const searchConditions = buildSearchConditions(filters);

  const users =
    currentUserId && !targetGender
      ? []
      : await prisma.user.findMany({
          where: {
            roleName: "USER",
            isApproved: true,
            profileVisible: true,
            ...(currentUserId
              ? {
                  id: { not: currentUserId },
                  gender: targetGender,
                }
              : {}),
            ...(searchConditions.length > 0 ? { AND: searchConditions } : {}),
          },
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
            isApproved: true,
            profileVisible: true,
            photos: {
              where: { status: "APPROVED" },
              select: { url: true },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
          ...(limit ? { take: limit } : {}),
        });

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

  return users.map((user: any) => ({
    userId: user.id,
    profile: userToProfile(user),
    interestState: interestStateByUserId.get(user.id) ?? "none",
  }));
}
