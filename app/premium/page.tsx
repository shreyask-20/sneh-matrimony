import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Premium Membership",
  description:
    "Explore Sneh Matrimony premium membership plans and unlock curated matchmaking.",
  robots: { index: false, follow: false },
};

export default function PremiumPage() {
  redirect("/subscribe");
}
