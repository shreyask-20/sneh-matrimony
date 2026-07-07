import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { sendRefundRequestEmail } from "@/lib/email";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

const VALID_REASONS = [
  "Changed mind",
  "Found a match",
  "Technical issue",
  "Not satisfied with service",
  "Other",
];

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (await isRateLimited(`refund-request:${ip}`, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before trying again." },
        { status: 429 }
      );
    }

    const userId = await requireUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { reason?: string; description?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { reason, description } = body;

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: "Please select a valid reason" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        firstName: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        status: "PAID",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        plan: true,
        amountPaise: true,
        razorpayPaymentId: true,
        createdAt: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "No active payment found to refund" },
        { status: 404 }
      );
    }

    const displayName = user.name || user.firstName || "Unknown";

    try {
      await sendRefundRequestEmail({
        userName: displayName,
        userEmail: user.email || "No email",
        userPhone: user.phone,
        plan: payment.plan,
        amountPaise: payment.amountPaise,
        paymentId: payment.razorpayPaymentId || payment.id,
        reason,
        description: description?.trim() || "",
      });
    } catch (err) {
      console.error("Failed to send refund request email:", err);
      return NextResponse.json(
        { error: "Failed to submit refund request. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
