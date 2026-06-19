export const PLANS = {
  monthly: { amount: 19900, label: "1 Month Premium", durationDays: 30 },
  quarterly: { amount: 49900, label: "3 Month Premium", durationDays: 90 },
} as const;

export type PlanKey = keyof typeof PLANS;
