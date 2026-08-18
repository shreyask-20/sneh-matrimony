import type { Metadata } from "next";
import InfoPageLayout from "@/components/info/InfoPageLayout";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, MessageCircle, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Safety & Privacy",
  description:
    "How Sneh Matrimony protects your data, verifies profiles, and keeps matchmaking safe and respectful for families.",
  openGraph: {
    url: "/safety-privacy",
  },
  alternates: {
    canonical: "/safety-privacy",
  },
};

const sections = [
  {
    icon: UserCheck,
    title: "Profile verification",
    body:
      "New profiles are reviewed by our team before they appear in browse. Photos can be moderated for quality and authenticity, and approved members receive a verification badge families can trust.",
  },
  {
    icon: Lock,
    title: "Your data stays private",
    body:
      "We do not sell your personal information. Email, phone, and password are stored securely. You choose what appears on your public profile and what you share in conversations.",
  },
  {
    icon: MessageCircle,
    title: "Safe communication",
    body:
      "Chat happens inside the platform so you can connect without sharing private contact details until you are ready. You can block users and report concerns at any time.",
  },
  {
    icon: Eye,
    title: "Visibility controls",
    body:
      "Your profile visibility can be managed as you complete verification steps. Hidden profiles are not shown in browse until requirements are met.",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    body:
      "Membership payments are processed through Razorpay using industry-standard encryption. We never store your card or UPI credentials on our servers.",
  },
];

const practices = [
  "Use a strong, unique password and keep your login private.",
  "Meet in public places with family present for early meetings when possible.",
  "Report suspicious behaviour or harassment to our support team immediately.",
  "Take time to verify details before sharing financial or personal documents.",
  "Trust your instincts — pause or block any interaction that feels uncomfortable.",
];

export default function SafetyPrivacyPage() {
  return (
    <InfoPageLayout
      title="Safety & privacy"
      subtitle="Your trust matters. Here is how we protect members and keep matchmaking respectful and secure."
    >
      <div className="space-y-4">
        {sections.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="glass-card flex gap-4 rounded-3xl p-5 sm:p-6"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-slate-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950 sm:p-8">
        <h2 className="font-serif text-xl text-slate-900 dark:text-white">
          Tips for a safer experience
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {practices.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="text-brand-500">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-3xl border border-brand-100 bg-brand-50/50 p-6 text-sm text-slate-600 dark:border-brand-500/20 dark:bg-white/5 dark:text-slate-300">
        <p>
          Questions about your data or a safety concern? Contact us at{" "}
          <a
            href="mailto:snehmatrimonyindia@gmail.com"
            className="font-semibold text-brand-600 hover:underline"
          >
            snehmatrimonyindia@gmail.com
          </a>{" "}
          or call{" "}
          <a href="tel:9922641116" className="font-semibold text-brand-600 hover:underline">
            9922641116
          </a>
          .
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Create a profile
          </Link>
          <Link
            href="/about"
            className="rounded-2xl border border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-100/60 dark:border-brand-500/30 dark:text-brand-300"
          >
            About Sneh Matrimony
          </Link>
        </div>
      </div>
    </InfoPageLayout>
  );
}
