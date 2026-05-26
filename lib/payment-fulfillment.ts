import { prisma } from "@/lib/prisma";
import { getSubscriptionExpiry } from "@/lib/subscriptions";

export async function fulfillPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature?: string
) {
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
    include: { subscription: true },
  });

  if (!payment) {
    return { ok: false as const, error: "Payment not found" };
  }

  if (payment.status === "PAID" && payment.subscription) {
    return { ok: true as const, alreadyFulfilled: true, subscription: payment.subscription };
  }

  const startsAt = new Date();
  const expiresAt = getSubscriptionExpiry(startsAt);

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        razorpayPaymentId,
        razorpaySignature: razorpaySignature ?? payment.razorpaySignature,
      },
    });

    const existing = await tx.subscription.findUnique({
      where: { paymentId: payment.id },
    });

    if (existing) {
      return { payment: updatedPayment, subscription: existing };
    }

    const subscription = await tx.subscription.create({
      data: {
        userId: payment.userId,
        plan: payment.plan,
        status: "ACTIVE",
        startsAt,
        expiresAt,
        paymentId: payment.id,
      },
    });

    return { payment: updatedPayment, subscription };
  });

  return { ok: true as const, alreadyFulfilled: false, ...result };
}
