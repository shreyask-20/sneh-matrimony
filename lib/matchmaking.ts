export function normalizeConversationPair(userAId: string, userBId: string) {
  return userAId < userBId
    ? { userOneId: userAId, userTwoId: userBId }
    : { userOneId: userBId, userTwoId: userAId };
}

export function isInterestActionAllowed(
  status: string,
  action: "ACCEPTED" | "DECLINED" | "WITHDRAWN"
) {
  if (action === "WITHDRAWN") {
    return status === "PENDING";
  }

  return status === "PENDING";
}
