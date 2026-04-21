import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import VerifyEmailClient from "./VerifyEmailClient";

export default async function VerifyEmailPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    });
    if (user?.emailVerified) {
      redirect("/dashboard");
    }
  }

  return <VerifyEmailClient />;
}
