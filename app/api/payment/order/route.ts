import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { PLANS, type PlanKey } from "@/lib/pricing";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { plan?: string };
  const planKey = body.plan as PlanKey;

  if (!planKey || !(planKey in PLANS)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const plan = PLANS[planKey];

  const order = await razorpay.orders.create({
    amount: plan.amount,
    currency: "INR",
    notes: {
      userId: session.user.id,
      plan: planKey,
    },
  });

  console.log("Razorpay order created:", order.id, "keyId:", process.env.RAZORPAY_KEY_ID);

  return NextResponse.json({
    orderId: order.id,
    amount: plan.amount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    plan: planKey,
    label: plan.label,
  });
}
