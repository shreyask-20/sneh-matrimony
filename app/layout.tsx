import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import { getServerSession } from "next-auth/next";
import "./globals.css";
import Providers from "../components/shared/Providers";
import { authOptions } from "@/auth";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Sneh Matrimony",
  description: "Find your perfect life partner with Sneh Matrimony.",
  icons: {
    icon: "/profiles/footer-logo.jpg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${playfair.variable} ${manrope.variable}`}>
      <body className="font-sans">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
