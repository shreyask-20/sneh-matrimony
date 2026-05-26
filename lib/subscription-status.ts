import { prisma } from "@/lib/prisma";
import { PLANS, type PlanKey } from "@/lib/subscriptions";

export async function getActiveSubscription(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: "desc" },
    include: {
      payment: {
        select: {
          amountPaise: true,
          listAmountPaise: true,
          discountPercent: true,
        },
      },
    },
  });

  if (!subscription) {
    return null;
  }

  const planKey = subscription.plan as PlanKey;
  const planConfig = PLANS[planKey];

  return {
    id: subscription.id,
    plan: subscription.plan,
    planName: planConfig.name,
    status: subscription.status,
    startsAt: subscription.startsAt.toISOString(),
    expiresAt: subscription.expiresAt.toISOString(),
    amountPaise: subscription.payment.amountPaise,
    listAmountPaise: subscription.payment.listAmountPaise,
    discountPercent: subscription.payment.discountPercent,
  };
}
