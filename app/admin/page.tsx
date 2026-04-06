import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { roleName: true },
  });

  if (!currentUser || currentUser.roleName !== "ADMIN") {
    redirect("/");
  }

  return <AdminClient initialTab={resolvedSearchParams?.tab} />;
}
