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
  try {
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
    const receipt = `s_${userId.slice(-8)}_${plan}_${Date.now().toString().slice(-8)}`;

    // Idempotency: re-use an unconsumed CREATED order for the same user+plan
    // rather than creating duplicate/orphaned Razorpay orders on client retries.
    const existingCreated = await prisma.payment.findFirst({
      where: { userId, plan: planKeyToEnum(plan), status: "CREATED" },
      orderBy: { createdAt: "desc" },
      select: { id: true, amountPaise: true, razorpayOrderId: true },
    });
    if (existingCreated && existingCreated.amountPaise === amountPaise) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, phone: true, firstName: true, lastName: true, name: true },
      });
      const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
      const displayName = user?.name ?? (fullName || undefined);
      return NextResponse.json({
        orderId: existingCreated.razorpayOrderId,
        amount: amountPaise,
        currency: "INR",
        keyId: getRazorpayKeyId(),
        plan,
        planName: planConfig.name,
        prefill: {
          name: displayName,
          email: user?.email ?? undefined,
          contact: user?.phone ?? undefined,
        },
      });
    }

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
    // Razorpay's SDK throws { statusCode, error } for any non-2xx upstream
    // response. Surface the exact gateway status + reason so the real cause
    // (bad credentials → 401, inactive/KYC-pending account, amount rules, etc.)
    // is visible in the production logs instead of being buried in a generic 503.
    if (error && typeof error === "object" && "statusCode" in error) {
      const rzp = error as { statusCode?: unknown; error?: unknown };
      console.error("create-order: Razorpay rejected order creation", {
        statusCode: rzp.statusCode,
        error: rzp.error,
      });
    } else {
      console.error("create-order error:", error);
    }

    // Missing/invalid Razorpay credentials — a configuration outage, not a user fault.
    const message = error instanceof Error ? error.message : "";
    if (/razorpay credentials not found/i.test(message)) {
      return NextResponse.json(
        { error: "Online payments are temporarily unavailable. Please try again shortly." },
        { status: 503 }
      );
    }

    // Razorpay API / downstream failure (e.g. order creation rejected or gateway down).
    if (error && typeof error === "object" && "statusCode" in error) {
      return NextResponse.json(
        { error: "We couldn't start your payment. Please try again in a moment." },
        { status: 503 }
      );
    }

    // Generic fallback — specific enough to guide a retry, never leaks internals.
    return NextResponse.json(
      { error: "We couldn't start your checkout. Please try again." },
      { status: 500 }
    );
  }
}
