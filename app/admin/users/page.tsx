import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Users",
  description: "Sneh Matrimony admin user management.",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  redirect("/admin?tab=users");
}
