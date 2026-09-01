import type { SubscriptionPlan } from "@prisma/client";

export const INTRO_DISCOUNT_PERCENT = 25;
export const SUBSCRIPTION_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

export type PlanKey = keyof typeof PLANS;

export const PLANS = {
  SILVER: {
    key: "SILVER" as const,
    name: "Silver",
    // TEMP: ₹2 payable for live payment testing (266 * 0.75 = 200 paise). Revert to 200_000 after testing.
    listPricePaise: 266,
    perks: [
      "View 150 profiles",
      "Who viewed your profile — 5",
      "Express Interest — Unlimited",
      "10 messages per profile",
    ],
    highlight: false,
  },
  GOLD: {
    key: "GOLD" as const,
    name: "Gold",
    // TEMP: ₹2 payable for live payment testing (266 * 0.75 = 200 paise). Revert to 300_000 after testing.
    listPricePaise: 266,
    perks: [
      "View 60 profiles",
      "Express Interest — Unlimited",
      "5 messages per profile",
    ],
    highlight: false,
  },
  PLATINUM: {
    key: "PLATINUM" as const,
    name: "Platinum",
    listPricePaise: 400_000,
    perks: [
      "Unlimited profile views",
      "Who viewed your profile — Unlimited",
      "Express Interest — Unlimited",
      "20 messages per profile",
      "Featured profile",
    ],
    highlight: true,
  },
} as const;

export const PLAN_KEYS = Object.keys(PLANS) as PlanKey[];

export function isValidPlan(plan: string): plan is PlanKey {
  return PLAN_KEYS.includes(plan as PlanKey);
}

export function getPayableAmountPaise(plan: PlanKey): number {
  const list = PLANS[plan].listPricePaise;
  return Math.round(list * (1 - INTRO_DISCOUNT_PERCENT / 100));
}

export function formatInrFromPaise(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function getPlanPricing(plan: PlanKey) {
  const config = PLANS[plan];
  const payablePaise = getPayableAmountPaise(plan);
  return {
    ...config,
    listPrice: formatInrFromPaise(config.listPricePaise),
    payablePrice: formatInrFromPaise(payablePaise),
    payablePaise,
    discountPercent: INTRO_DISCOUNT_PERCENT,
  };
}

export function planKeyToEnum(plan: PlanKey): SubscriptionPlan {
  return plan as SubscriptionPlan;
}

export function getSubscriptionExpiry(startsAt: Date): Date {
  return new Date(startsAt.getTime() + SUBSCRIPTION_DURATION_MS);
}
