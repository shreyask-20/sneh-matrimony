import AdminClient from "./AdminClient";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { roleName: true },
  });

  if (!user || user.roleName !== "ADMIN") {
    redirect("/");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <AdminClient initialTab={resolvedSearchParams?.tab} />;
}
