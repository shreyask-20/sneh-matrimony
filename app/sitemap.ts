import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sneh-matrimony.vercel.app";

const staticPages: MetadataRoute.Sitemap = [
  {
    url: `${siteUrl}/`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${siteUrl}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${siteUrl}/browse`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: `${siteUrl}/success-stories`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    url: `${siteUrl}/safety-privacy`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  },
  {
    url: `${siteUrl}/terms`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const users = await prisma.user.findMany({
    where: {
      roleName: "USER",
      isApproved: true,
      profileVisible: true,
      deletedAt: null,
    },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const profilePages: MetadataRoute.Sitemap = users.map((user) => ({
    url: `${siteUrl}/profiles/${user.id}`,
    lastModified: user.createdAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticPages, ...profilePages];
}
