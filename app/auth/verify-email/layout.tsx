import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description:
    "Verify your email address to activate your Sneh Matrimony account and start connecting with curated matches.",
  robots: { index: false, follow: false },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
