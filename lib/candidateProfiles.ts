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
};

export async function getCandidateProfiles({
  prisma,
  currentUserId,
  currentUserGender,
  limit,
}: CandidateArgs) {
  const targetGender = getOppositeGender(currentUserGender);

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
          },
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            birthDate: true,
            city: true,
            education: true,
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
