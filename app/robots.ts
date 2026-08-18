import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sneh-matrimony.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/chat",
          "/profile",
          "/preferred-matches",
          "/premium",
          "/subscribe",
          "/refund-request",
          "/admin",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/revive-account",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
