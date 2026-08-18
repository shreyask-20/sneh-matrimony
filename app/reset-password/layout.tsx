import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description:
    "Set a new password for your Sneh Matrimony account and regain access to your profile.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
