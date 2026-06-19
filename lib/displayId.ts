import { prisma } from "./prisma";

export async function generateDisplayId(): Promise<string> {
  const last = await prisma.user.findFirst({
    where: { displayId: { not: null } },
    orderBy: { displayId: "desc" },
    select: { displayId: true },
  });

  const lastNum = last?.displayId
    ? parseInt(last.displayId.replace(/^C/, ""), 10)
    : 0;

  return `C${String(lastNum + 1).padStart(3, "0")}`;
}
