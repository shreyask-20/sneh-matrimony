import type { Metadata } from "next";
import InfoPageLayout from "@/components/info/InfoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Success Stories",
  description:
    "Real couples and families who found meaningful matches through Sneh Matrimony. Read their inspiring journeys and start your own.",
  openGraph: {
    url: "/success-stories",
  },
  alternates: {
    canonical: "/success-stories",
  },
};

const stories = [
  {
    name: "Meera & Arnav",
    location: "Mumbai",
    quote:
      "Sneh felt warm and personal. Our families stayed involved throughout, and the process was genuinely joyful. We connected over shared values before we ever met in person.",
    image: "/profiles/p1.jpg",
  },
  {
    name: "Nida & Ayaan",
    location: "Pune",
    quote:
      "The curated recommendations saved us time. Profile insights helped us start the right conversations, and admin verification gave our parents peace of mind.",
    image: "/profiles/p7.jpg",
  },
  {
    name: "Kavya & Rohit",
    location: "Nashik",
    quote:
      "The verification badge gave our families confidence. Everything felt safe, respectful, and focused on marriage — exactly what we were looking for.",
    image: "/profiles/p8.jpg",
  },
  {
    name: "Priya & Sameer",
    location: "Ahmedabad",
    quote:
      "We appreciated how clearly profiles were presented. Within weeks we found a strong match, and our families were able to take the next steps with clarity.",
    image: "/profiles/wo1%20(4).jpg",
  },
];

const highlights = [
  { label: "Family-rated experience", value: "4.9/5" },
  { label: "Verified profiles", value: "100%" },
  { label: "Marriage-focused", value: "Always" },
];

export default function SuccessStoriesPage() {
  return (
    <InfoPageLayout
      title="Success stories"
      subtitle="Real couples who found their forever through Sneh Matrimony — shared with permission and care for privacy."
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-brand-100 bg-brand-50/50 p-5 text-center dark:border-brand-500/20 dark:bg-white/5"
          >
            <p className="font-serif text-2xl text-brand-600">{item.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {stories.map((story) => (
          <Card key={story.name}>
            <CardContent>
              <div className="overflow-hidden rounded-xl">
                <img
                  src={story.image}
                  alt={story.name}
                  className="h-52 w-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="mt-4 font-serif text-xl text-slate-900 dark:text-white">
                {story.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{story.location}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                “{story.quote}”
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="glass-card mt-10 rounded-3xl p-6 text-center sm:p-8">
        <h2 className="font-serif text-2xl text-slate-900 dark:text-white">
          Ready to write your story?
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Join Sneh Matrimony and begin your journey toward a meaningful, family-supported
          partnership.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-flex rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Get started
        </Link>
      </div>
    </InfoPageLayout>
  );
}
