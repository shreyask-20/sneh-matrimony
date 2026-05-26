import type { Metadata } from "next";
import InfoPageLayout from "@/components/info/InfoPageLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Sneh Matrimony",
  description:
    "Learn about Sneh Matrimony — a trusted platform helping families find meaningful, marriage-minded partnerships.",
};

const paragraphs = [
  "Welcome to Sneh Matrimony, a trusted place where individuals and families come together to find meaningful and lifelong relationships. Our mission is to help people discover their perfect life partner through a secure and easy-to-use matchmaking service.",
  "We provide a growing database of profiles from different communities, cultures, and backgrounds, making it easier to find compatible matches based on preferences such as religion, profession, location, and values. Sneh Matrimony is designed specifically for marriage — not casual dating.",
  "Our vision is to build a community where meaningful relationships begin and happy marriages are created. We believe every individual deserves the opportunity to meet someone who shares their values, dreams, and future goals.",
  "At Sneh Matrimony, we are not just connecting profiles — we are connecting hearts and helping create lifelong partnerships.",
];

const values = [
  {
    title: "Family-first approach",
    description:
      "We respect the role families play in the journey and keep the experience dignified, transparent, and collaborative.",
  },
  {
    title: "Verified & curated",
    description:
      "Profiles go through review so members can browse and connect with greater confidence.",
  },
  {
    title: "Privacy by design",
    description:
      "Your contact details and conversations stay protected. You control what you share and when.",
  },
];

export default function AboutPage() {
  return (
    <InfoPageLayout
      title="About us"
      subtitle="A modern, heart-led matrimony platform built for families who value trust, culture, and commitment."
    >
      <div className="glass-card space-y-4 rounded-3xl p-6 sm:p-8">
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 40)}
            className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {values.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950"
          >
            <h2 className="font-serif text-lg text-slate-900 dark:text-white">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/auth/register"
          className="rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Create your profile
        </Link>
        <Link
          href="/success-stories"
          className="rounded-2xl border border-brand-200 bg-brand-50/60 px-6 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-100/60 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
        >
          Read success stories
        </Link>
      </div>
    </InfoPageLayout>
  );
}
