import { prisma } from "@/lib/prisma";

export async function getConversationForUser(
  conversationId: number,
  userId: string
) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userOneId: userId }, { userTwoId: userId }],
    },
    select: {
      id: true,
      userOneId: true,
      userTwoId: true,
      lastMessageAt: true,
    },
  });
}

export function getOtherUserId(
  conversation: { userOneId: string; userTwoId: string },
  currentUserId: string
) {
  return conversation.userOneId === currentUserId
    ? conversation.userTwoId
    : conversation.userOneId;
}
