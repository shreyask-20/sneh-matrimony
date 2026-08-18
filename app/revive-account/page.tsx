import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/shared/Navbar";
import PageBackdrop from "@/components/shared/PageBackdrop";
import ReviveButton from "./ReviveButton";

export const metadata: Metadata = {
  title: "Revive Account",
  description:
    "Cancel your pending account deletion and reactivate your Sneh Matrimony profile.",
  robots: { index: false, follow: false },
};

export default async function ReviveAccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { deletionRequestedAt: true },
  });

  if (!user?.deletionRequestedAt) {
    redirect("/dashboard");
  }

  const scheduledDate = new Date(
    new Date(user.deletionRequestedAt).getTime() + 5 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <PageBackdrop>
      <Navbar />
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-20">
        <div className="glass-card rounded-3xl p-6 sm:p-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl dark:bg-amber-900/30">
            ⏳
          </div>

          <h1 className="font-serif text-2xl text-slate-900 dark:text-white sm:text-3xl">
            Account Deletion Pending
          </h1>

          <p className="mt-4 text-slate-600 dark:text-slate-300">
            You requested to delete your account. It is scheduled for permanent
            deletion on{" "}
            <strong className="text-slate-900 dark:text-white">
              {scheduledDate}
            </strong>
            .
          </p>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            If you&apos;ve changed your mind, you can revive your account before
            this date. After the grace period, your account cannot be
            recovered.
          </p>

          <ReviveButton scheduledDate={scheduledDate} />
        </div>
      </main>
    </PageBackdrop>
  );
}
