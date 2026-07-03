const FREE_PERIOD_MS = 60 * 24 * 60 * 60 * 1000;

export function isFemaleInFreePeriod(createdAt: Date): boolean {
  const now = new Date();
  const freePeriodEnd = new Date(createdAt.getTime() + FREE_PERIOD_MS);
  return now < freePeriodEnd;
}
