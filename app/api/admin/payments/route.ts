import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { roleName: true },
  });
  if (!user || user.roleName !== "ADMIN") return null;
  return session;
}

export async function GET(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || null;
    const plan = searchParams.get("plan")?.trim() || null;
    const status = searchParams.get("status")?.trim() || null;

    const paymentWhere: Record<string, unknown> = {};

    if (plan) {
      paymentWhere.plan = plan;
    }

    if (status) {
      paymentWhere.status = status;
    }

    if (search) {
      paymentWhere.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
        { razorpayOrderId: { contains: search, mode: "insensitive" } },
        { razorpayPaymentId: { contains: search, mode: "insensitive" } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where: paymentWhere,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        plan: true,
        listAmountPaise: true,
        discountPercent: true,
        amountPaise: true,
        status: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        createdAt: true,
        userId: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        subscription: {
          select: { status: true, expiresAt: true },
        },
      },
    });

    // Group payments by user
    const userMap = new Map<string, {
      user: { id: string; name: string | null; email: string | null; phone: string | null };
      currentPlan: string | null;
      currentSubscriptionExpiresAt: string | null;
      payments: Array<{
        id: string;
        plan: string;
        amountPaise: number;
        listAmountPaise: number;
        discountPercent: number;
        status: string;
        razorpayOrderId: string;
        razorpayPaymentId: string | null;
        createdAt: string;
      }>;
    }>();

    for (const payment of payments) {
      const userId = payment.userId;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: payment.user,
          currentPlan: null,
          currentSubscriptionExpiresAt: null,
          payments: [],
        });
      }
      const entry = userMap.get(userId)!;
      entry.payments.push({
        id: payment.id,
        plan: payment.plan,
        amountPaise: payment.amountPaise,
        listAmountPaise: payment.listAmountPaise,
        discountPercent: payment.discountPercent,
        status: payment.status,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        createdAt: payment.createdAt.toISOString(),
      });
    }

    // Fetch active subscription for each user
    const userIds = Array.from(userMap.keys());
    const activeSubscriptions = userIds.length > 0
      ? await prisma.subscription.findMany({
          where: {
            userId: { in: userIds },
            status: "ACTIVE",
            expiresAt: { gt: new Date() },
          },
          select: { userId: true, plan: true, expiresAt: true },
        })
      : [];

    const subByUserId = new Map(activeSubscriptions.map((s) => [s.userId, s]));

    for (const [userId, entry] of userMap) {
      const sub = subByUserId.get(userId);
      if (sub) {
        entry.currentPlan = sub.plan;
        entry.currentSubscriptionExpiresAt = sub.expiresAt.toISOString();
      }
    }

    const users = Array.from(userMap.values());

    const totalRevenue = await prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amountPaise: true },
    });

    return NextResponse.json({
      users,
      totalRevenuePaise: totalRevenue._sum.amountPaise ?? 0,
    });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
