import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Request",
  description:
    "Request a refund for your Sneh Matrimony membership. Our team will review your request promptly.",
  robots: { index: false, follow: false },
};

export default function RefundRequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
