import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Logs",
  description: "Sneh Matrimony admin activity logs.",
  robots: { index: false, follow: false },
};

export default function AdminLogsPage() {
  redirect("/admin?tab=logs");
}
