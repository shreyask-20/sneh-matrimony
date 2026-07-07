import type { Metadata } from "next";
import Hero from "../components/landing/Hero";
import FeaturedProfiles from "../components/landing/FeaturedProfiles";
import HowItWorks from "../components/landing/HowItWorks";
import About from "../components/landing/About";
import Testimonials from "../components/landing/Testimonials";
import Subscriptions from "../components/landing/Subscriptions";
import Navbar from "../components/shared/Navbar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCandidateProfiles } from "@/lib/candidateProfiles";
import { unstable_cache } from "next/cache";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Sneh Matrimony helps families find meaningful, marriage-minded partnerships. Browse verified profiles and discover curated matches today.",
  openGraph: {
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

const getFeaturedProfiles = unstable_cache(
  async (currentUserId: string | null, currentUserGender: string | null) =>
    getCandidateProfiles({
      prisma,
      currentUserId,
      currentUserGender,
      limit: 10,
    }),
  ["featured-profiles"],
  { revalidate: 60, tags: ["featured-profiles"] }
);

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = session?.user?.id != null;
  const currentUserId = session?.user?.id ?? null;
  const currentUserGender = session?.user?.gender ?? null;
  const featuredProfiles = await getFeaturedProfiles(
    currentUserId,
    currentUserGender
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#A0144D]/80 to-transparent">
        <Navbar variant="blend" className="bg-transparent" />
        <Hero isAuthenticated={isAuthenticated} />
      </div>
      <main>
        <FeaturedProfiles profiles={featuredProfiles.profiles} />
        <HowItWorks />
        <About />
        <Testimonials />
        <Subscriptions />
      </main>

    </div>
  );
}
