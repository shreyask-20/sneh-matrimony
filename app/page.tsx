import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Hero from "../components/landing/Hero";
import FeaturedProfiles from "../components/landing/FeaturedProfiles";
import HowItWorks from "../components/landing/HowItWorks";
import About from "../components/landing/About";
import Testimonials from "../components/landing/Testimonials";
import Subscriptions from "../components/landing/Subscriptions";
import Footer from "../components/landing/Footer";
import Navbar from "../components/shared/Navbar";
import Toast from "../components/shared/Toast";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.roleName === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#A0144D]/80 to-transparent">
        <Navbar variant="blend" className="bg-transparent" />
        <Hero />
      </div>
      <main>
        <FeaturedProfiles />
        <HowItWorks />
        <About />
        <Testimonials />
        <Subscriptions />
      </main>
      <Footer />
      <Toast message="You have 4 new curated matches today." />
    </div>
  );
}
