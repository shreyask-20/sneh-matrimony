const paragraphs = [
  "Welcome to our Matrimony platform, a trusted place where individuals and families come together to find meaningful and lifelong relationships. Our mission is to help people discover their perfect life partner through a secure and easy-to-use matchmaking service.",
  "Our website provides a large database of profiles from different communities, cultures, and backgrounds, making it easier for users to find compatible matches based on their preferences such as religion, profession, location, and values. Sneh Matrimony is designed specifically to help people meet with the goal of marriage rather than casual relationships.",
  "Our vision is to build a community where meaningful relationships begin and happy marriages are created. We believe that every individual deserves the opportunity to meet someone who shares their values, dreams, and future goals.",
  "At our matrimony platform, we are not just connecting profiles — we are connecting hearts and helping create lifelong partnerships.",
];

export default function About() {
  return (
    <section id="about" className="w-full px-4 pb-16 sm:px-6 lg:px-8 xl:px-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-500">
          Sneh Matrimony
        </p>
        <h2 className="section-heading mt-2">About Us</h2>
      </div>
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
