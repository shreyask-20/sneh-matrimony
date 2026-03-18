import Hero from "../components/landing/Hero";
import FeaturedProfiles from "../components/landing/FeaturedProfiles";
import HowItWorks from "../components/landing/HowItWorks";
import Testimonials from "../components/landing/Testimonials";
import Subscriptions from "../components/landing/Subscriptions";
import Footer from "../components/landing/Footer";
import Navbar from "../components/shared/Navbar";
import Toast from "../components/shared/Toast";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <Navbar />
      <main>
        <Hero />
        <FeaturedProfiles />
        <HowItWorks />
        <Testimonials />
        <Subscriptions />
      </main>
      <Footer />
      <Toast message="You have 4 new curated matches today." />
    </div>
  );
}
