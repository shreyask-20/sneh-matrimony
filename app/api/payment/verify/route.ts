import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";
import { PLANS, type PlanKey } from "@/lib/pricing";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    plan?: string;
  };

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  // Verify signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
  }

  const planKey = plan as PlanKey;
  if (!(planKey in PLANS)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const durationDays = PLANS[planKey].durationDays;

  // Set premium on user
  const now = new Date();
  const premiumExpiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      isPremium: true,
      premiumExpiresAt,
    },
  });

  return NextResponse.json({
    ok: true,
    isPremium: true,
    premiumExpiresAt,
    plan: PLANS[planKey].label,
  });
}
