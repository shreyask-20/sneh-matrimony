import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay";
import { requireUserId } from "@/lib/require-user";
import {
  getPayableAmountPaise,
  INTRO_DISCOUNT_PERCENT,
  isValidPlan,
  PLANS,
  planKeyToEnum,
  type PlanKey,
} from "@/lib/subscriptions";

export async function POST(request: NextRequest) {
  const userId = await requireUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { plan?: string };
  try {
    body = (await request.json()) as { plan?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const planParam = body.plan?.toUpperCase();
  if (!planParam || !isValidPlan(planParam)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const plan = planParam as PlanKey;
  const planConfig = PLANS[plan];
  const amountPaise = getPayableAmountPaise(plan);
  const receipt = `sneh_${userId}_${plan}_${Date.now()}`;

  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        userId,
        plan,
      },
    });

    await prisma.payment.create({
      data: {
        userId,
        plan: planKeyToEnum(plan),
        listAmountPaise: planConfig.listPricePaise,
        discountPercent: INTRO_DISCOUNT_PERCENT,
        amountPaise,
        status: "CREATED",
        razorpayOrderId: order.id,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true, firstName: true, lastName: true, name: true },
    });

    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    const displayName = user?.name ?? (fullName || undefined);

    return NextResponse.json({
      orderId: order.id,
      amount: amountPaise,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      plan,
      planName: planConfig.name,
      prefill: {
        name: displayName,
        email: user?.email ?? undefined,
        contact: user?.phone ?? undefined,
      },
    });
  } catch (error) {
    console.error("create-order error:", error);
    return NextResponse.json(
      { error: "Unable to create payment order" },
      { status: 500 }
    );
  }
}
