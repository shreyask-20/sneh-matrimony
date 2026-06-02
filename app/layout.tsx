import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};
import { Playfair_Display, Manrope } from "next/font/google";
import { getServerSession } from "next-auth/next";
import "./globals.css";
import Providers from "../components/shared/Providers";
import Footer from "@/components/landing/Footer";
import { authOptions } from "@/auth";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sneh-matrimony.vercel.app";
const siteName = "Sneh Matrimony";
const defaultTitle = "Sneh Matrimony — Trusted Matchmaking for Families";
const defaultDescription =
  "Find your perfect life partner with Sneh Matrimony. A trusted, family-friendly matchmaking platform with verified profiles, curated matches, and privacy-first design.";
const defaultOgImage = "/profiles/footer-logo.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    "matrimony",
    "Indian matrimony",
    "marriage matching",
    "life partner",
    "Sneh Matrimony",
    "family matchmaking",
    "verified profiles",
    "curated matches",
    "marriage platform",
    "Indian marriage site",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  icons: {
    icon: "/profiles/footer-logo.jpg",
    shortcut: "/profiles/nav-logo.png",
    apple: "/profiles/nav-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "matrimony",
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
        <Providers session={session}>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
