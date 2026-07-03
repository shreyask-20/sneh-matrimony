import type { Metadata } from "next";
import InfoPageLayout from "@/components/info/InfoPageLayout";
import AcceptTermsButton from "@/components/terms/AcceptTermsButton";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the Terms & Conditions for using Sneh Matrimony. By registering on this website, you agree to abide by these terms.",
  openGraph: {
    url: "/terms",
  },
  alternates: {
    canonical: "/terms",
  },
};

const effectiveDate = "July 2026";

const sections = [
  {
    title: "1. Eligibility",
    items: [
      "The applicant must be legally eligible to marry under applicable Indian laws.",
      "You confirm that all information provided during registration is true, accurate, and complete.",
      "If registering on behalf of another person (such as your son, daughter, sibling, or relative), you confirm that you have their consent.",
    ],
  },
  {
    title: "2. Profile Information",
    items: [
      "All information, photographs, and documents submitted must be genuine and belong to the registered individual.",
      "False, misleading, or fraudulent information may result in immediate suspension or permanent deletion of the profile without notice.",
      "The website reserves the right to verify any information submitted by the user.",
    ],
  },
  {
    title: "3. Profile Approval",
    items: [
      "Registration does not guarantee profile approval.",
      "The website reserves the right to reject, suspend, or remove any profile that violates these Terms & Conditions or appears suspicious or inappropriate.",
    ],
  },
  {
    title: "4. User Responsibilities",
    items: [
      "To use the website only for genuine matrimonial purposes.",
      "Not to post offensive, defamatory, obscene, or illegal content.",
      "Not to create duplicate or fake profiles.",
      "Not to misuse other members' information.",
    ],
  },
  {
    title: "5. Privacy",
    items: [
      "Personal information will be handled in accordance with our Privacy Policy.",
      "Users should exercise caution while sharing personal or financial information with other members.",
    ],
  },
  {
    title: "6. Communication",
    items: [
      "By registering, you consent to receive communication through phone calls, SMS, WhatsApp, email, or notifications regarding your profile, matches, and services.",
    ],
  },
  {
    title: "7. Paid Services",
    items: [
      "Fees paid for premium or assisted services are non-refundable unless otherwise stated.",
      "Membership benefits are available only for the registered profile and cannot be transferred.",
    ],
  },
  {
    title: "8. No Guarantee",
    items: [
      "The website acts only as a platform to help members connect. We do not guarantee marriage, compatibility, responses from other members, or the authenticity of every user, despite reasonable verification efforts.",
    ],
  },
  {
    title: "9. User Safety",
    items: [
      "Never send money to anyone you meet through this website.",
      "Always verify identity and background before making any personal or financial commitments.",
      "Report suspicious activity immediately to the website administrator.",
    ],
  },
  {
    title: "10. Limitation of Liability",
    items: [
      "The website, its owners, employees, and affiliates shall not be liable for any loss, dispute, fraud, or damages arising from interactions between members.",
    ],
  },
  {
    title: "11. Account Termination",
    items: [
      "We reserve the right to suspend or permanently remove any profile that violates these Terms & Conditions without prior notice.",
    ],
  },
  {
    title: "12. Changes to Terms",
    items: [
      "These Terms & Conditions may be updated at any time. Continued use of the website after changes are posted constitutes acceptance of the revised Terms.",
    ],
  },
  {
    title: "13. Governing Law",
    items: [
      "These Terms & Conditions shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Nashik, Maharashtra.",
    ],
  },
];

export default function TermsPage() {
  return (
    <InfoPageLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before registering on Sneh Matrimony."
    >
      <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
        Effective Date: {effectiveDate}
      </p>

      <div className="space-y-6">
        {sections.map(({ title, items }) => (
          <div
            key={title}
            className="glass-card rounded-3xl p-5 sm:p-6"
          >
            <h2 className="font-serif text-lg text-slate-900 dark:text-white">
              {title}
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {items.map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-brand-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-brand-100 bg-brand-50/50 p-6 text-sm text-slate-600 dark:border-brand-500/20 dark:bg-white/5 dark:text-slate-300">
        <h2 className="font-serif text-lg text-slate-900 dark:text-white">
          Declaration
        </h2>
        <p className="mt-3 leading-relaxed">
          By clicking &quot;I Agree&quot; and completing registration, I confirm
          that I have read, understood, and agree to abide by these Terms &amp;
          Conditions.
        </p>
      </div>

      <AcceptTermsButton />
    </InfoPageLayout>
  );
}
