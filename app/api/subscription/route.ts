import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getActiveSubscription } from "@/lib/subscription-status";
import { requireUserId } from "@/lib/require-user";
import { getPlanPricing, PLAN_KEYS } from "@/lib/subscriptions";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getActiveSubscription(userId);
    const plans = PLAN_KEYS.map((key) => getPlanPricing(key));

    return NextResponse.json({
      subscription,
      plans,
      introDiscountPercent: 25,
    });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
