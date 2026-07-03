"use client";

import { X } from "lucide-react";

const termsPreview = [
  {
    title: "1. Eligibility",
    body: "The applicant must be legally eligible to marry under applicable Indian laws. You confirm that all information provided during registration is true, accurate, and complete. If registering on behalf of another person, you confirm that you have their consent.",
  },
  {
    title: "2. Profile Information",
    body: "All information, photographs, and documents submitted must be genuine and belong to the registered individual. False, misleading, or fraudulent information may result in immediate suspension or permanent deletion of the profile without notice.",
  },
  {
    title: "3. Profile Approval",
    body: "Registration does not guarantee profile approval. The website reserves the right to reject, suspend, or remove any profile that violates these Terms & Conditions or appears suspicious or inappropriate.",
  },
  {
    title: "4. User Responsibilities",
    body: "You agree to use the website only for genuine matrimonial purposes, not to post offensive or illegal content, not to create duplicate or fake profiles, and not to misuse other members' information.",
  },
  {
    title: "5. Privacy & Communication",
    body: "Personal information will be handled in accordance with our Privacy Policy. By registering, you consent to receive communication through phone calls, SMS, WhatsApp, email, or notifications regarding your profile, matches, and services.",
  },
  {
    title: "6. Paid Services",
    body: "Fees paid for premium or assisted services are non-refundable unless otherwise stated. Membership benefits are available only for the registered profile and cannot be transferred.",
  },
  {
    title: "7. No Guarantee",
    body: "The website acts only as a platform to help members connect. We do not guarantee marriage, compatibility, responses from other members, or the authenticity of every user, despite reasonable verification efforts.",
  },
  {
    title: "8. User Safety",
    body: "Never send money to anyone you meet through this website. Always verify identity and background before making any personal or financial commitments. Report suspicious activity immediately.",
  },
  {
    title: "9. Limitation of Liability",
    body: "The website, its owners, employees, and affiliates shall not be liable for any loss, dispute, fraud, or damages arising from interactions between members.",
  },
  {
    title: "10. Governing Law",
    body: "These Terms & Conditions shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Nashik, Maharashtra.",
  },
];

type TermsModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function TermsModal({ open, onClose }: TermsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/10">
          <div>
            <h2 className="font-serif text-lg text-slate-900 dark:text-white">
              Terms &amp; Conditions
            </h2>
            <p className="text-xs text-slate-400">Effective Date: July 2026</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {termsPreview.map(({ title, body }) => (
              <div key={title}>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-sm text-slate-600 dark:border-brand-500/20 dark:bg-white/5 dark:text-slate-300">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Declaration
            </p>
            <p className="mt-1 leading-relaxed">
              By clicking &quot;I Agree&quot; and completing registration, I
              confirm that I have read, understood, and agree to abide by these
              Terms &amp; Conditions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
