import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Profile",
  description:
    "Create your Sneh Matrimony profile in a few easy steps. Join a trusted community of families seeking meaningful matrimonial alliances.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
