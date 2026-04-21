"use client";

import { useRef, useState, Suspense, KeyboardEvent, ClipboardEvent } from "react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import PageBackdrop from "@/components/shared/PageBackdrop";
import Button from "@/components/shared/Button";

function VerifyEmailContent() {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error">("idle");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 4) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 5; i++) {
      next[i] = pasted[i] ?? "";
    }
    setDigits(next);
    const lastFilled = Math.min(pasted.length, 4);
    inputs.current[lastFilled]?.focus();
  };

  const handleSubmit = async () => {
    const otp = digits.join("");
    if (otp.length < 5) {
      setErrorMsg("Please enter all 5 digits.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setErrorMsg(data.error ?? "Verification failed. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendStatus("idle");
    setDigits(["", "", "", "", ""]);
    setErrorMsg("");
    setStatus("idle");
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

  if (status === "success") {
    return (
      <div className="mx-auto max-w-md py-20 px-4 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl text-slate-900 dark:text-white">
          You&apos;re verified
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Your email has been confirmed. The Email Verified badge will now
          appear on your profile.
        </p>
        <Button asChild className="mt-8">
          <Link href="/profile">Go to profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-20 px-4 text-center">
      <div className="mb-6 text-5xl">📧</div>
      <h1 className="font-serif text-2xl text-slate-900 dark:text-white">
        Check your email
      </h1>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        We sent a 5-digit verification code to your email address. Enter it
        below. The code expires in <strong>15 minutes</strong>.
      </p>

      {/* OTP input boxes */}
      <div className="mt-8 flex justify-center gap-3">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="h-14 w-12 rounded-xl border-2 border-slate-200 bg-white text-center text-2xl font-bold text-slate-900 outline-none transition focus:border-[#9b1c4a] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#9b1c4a]"
          />
        ))}
      </div>

      {errorMsg && (
        <p className="mt-4 text-sm text-red-500">{errorMsg}</p>
      )}

      <Button
        className="mt-6 w-full"
        onClick={handleSubmit}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Verifying..." : "Verify Email"}
      </Button>

      <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        Didn&apos;t receive a code?{" "}
        {resendStatus === "sent" ? (
          <span className="text-green-600 dark:text-green-400">New code sent!</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-medium text-[#9b1c4a] underline-offset-2 hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        )}
      </div>

      {resendStatus === "error" && (
        <p className="mt-2 text-sm text-red-500">Failed to resend. Please try again.</p>
      )}

      <div className="mt-6">
        <Button asChild variant="ghost">
          <Link href="/dashboard">Continue to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

export default function VerifyEmailClient() {
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
