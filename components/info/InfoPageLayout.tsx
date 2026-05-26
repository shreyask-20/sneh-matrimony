import type { ReactNode } from "react";
import Navbar from "@/components/shared/Navbar";
import PageBackdrop from "@/components/shared/PageBackdrop";
import Footer from "@/components/landing/Footer";

type InfoPageLayoutProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function InfoPageLayout({
  eyebrow = "Sneh Matrimony",
  title,
  subtitle,
  children,
}: InfoPageLayoutProps) {
  return (
    <PageBackdrop>
      <Navbar />
      <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-500">{eyebrow}</p>
            <h1 className="section-heading mt-3">{title}</h1>
            {subtitle && (
              <p className="section-subtitle mx-auto mt-3 max-w-2xl">{subtitle}</p>
            )}
          </header>
          {children}
        </div>
      </main>
      <Footer />
    </PageBackdrop>
  );
}
