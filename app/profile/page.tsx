import Navbar from "../../components/shared/Navbar";
import Badge from "../../components/shared/Badge";
import Button from "../../components/shared/Button";
import ProfileTabs from "../../components/profile/ProfileTabs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const photos = session?.user?.id
    ? await prisma.photo.findMany({
        where: { userId: session.user.id, status: "APPROVED" },
        select: { url: true },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const primaryPhoto = photos[0]?.url ?? "/profiles/p1.jpg";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <div className="glass-card rounded-3xl p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <img
                src={primaryPhoto}
                alt="Aanya Sharma"
                className="h-72 w-full rounded-3xl object-cover"
              />
              {photos.length > 1 ? (
                <div className="grid grid-cols-4 gap-2">
                  {photos.slice(1, 5).map((photo) => (
                    <img
                      key={photo.url}
                      src={photo.url}
                      alt="Profile"
                      className="h-16 w-full rounded-2xl object-cover"
                    />
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Badge label="Verified" tone="verified" />
                <Badge label="Premium" tone="premium" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button>Express Interest</Button>
                <Button variant="secondary">Chat</Button>
                <Button variant="ghost">Shortlist</Button>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
                  Aanya Sharma, 27
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Product Designer · Mumbai · 5'4" · Hindu
                </p>
              </div>
              <div className="grid gap-4 rounded-3xl border border-white/40 bg-white/70 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-slate-400">Education</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    M.Des, NID
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Profession</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    Product Designer
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Mother tongue</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    Gujarati
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Diet</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    Vegetarian
                  </p>
                </div>
              </div>
              <ProfileTabs />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
