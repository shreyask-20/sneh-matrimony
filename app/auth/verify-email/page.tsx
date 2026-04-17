"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import PageBackdrop from "@/components/shared/PageBackdrop";
import Button from "@/components/shared/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const error = searchParams.get("error");
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error">("idle");

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        credentials: "include",
      });
      setResendStatus(res.ok ? "sent" : "error");
    } catch {
      setResendStatus("error");
    } finally {
      setResending(false);
    }
  };

  const errorMessages: Record<string, string> = {
    missing: "No verification token was provided.",
    invalid: "This verification link is invalid or has already been used.",
    expired: "This verification link has expired. Please request a new one.",
  };

  return (
    <div className="mx-auto max-w-md py-20 px-4 text-center">
      {success ? (
        <>
          <div className="mb-6 text-5xl">✅</div>
          <h1 className="font-serif text-2xl text-slate-900 dark:text-white">
            Email verified
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Your email address has been successfully verified. Your profile is
            now one step closer to full verification.
          </p>
          <Button asChild className="mt-8">
            <Link href="/profile">Go to profile</Link>
          </Button>
        </>
      ) : error ? (
        <>
          <div className="mb-6 text-5xl">⚠️</div>
          <h1 className="font-serif text-2xl text-slate-900 dark:text-white">
            Verification failed
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {errorMessages[error] ?? "Something went wrong with your verification link."}
          </p>
          {resendStatus === "sent" ? (
            <p className="mt-6 text-sm text-green-600 dark:text-green-400">
              A new verification email has been sent. Check your inbox.
            </p>
          ) : resendStatus === "error" ? (
            <p className="mt-6 text-sm text-red-500">
              Failed to resend. Please try again or contact support.
            </p>
          ) : (
            <Button
              className="mt-8"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend verification email"}
            </Button>
          )}
        </>
      ) : (
        <>
          <div className="mb-6 text-5xl">📧</div>
          <h1 className="font-serif text-2xl text-slate-900 dark:text-white">
            Check your email
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            We sent a verification link to your email address. Click it to
            verify your account. The link expires in 24 hours.
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Didn&apos;t receive it? Check your spam folder.
          </p>
          {resendStatus === "sent" ? (
            <p className="mt-6 text-sm text-green-600 dark:text-green-400">
              A new verification email has been sent.
            </p>
          ) : resendStatus === "error" ? (
            <p className="mt-6 text-sm text-red-500">
              Failed to resend. Please try again.
            </p>
          ) : (
            <Button
              variant="secondary"
              className="mt-8"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend email"}
            </Button>
          )}
          <div className="mt-6">
            <Button asChild variant="ghost">
              <Link href="/dashboard">Continue to dashboard</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <PageBackdrop>
      <Navbar />
      <main>
        <Suspense>
          <VerifyEmailContent />
        </Suspense>
      </main>
    </PageBackdrop>
  );
}
