"use client";

import { useState } from "react";
import Button from "../../../components/shared/Button";
import Navbar from "../../../components/shared/Navbar";

const steps = ["Basic info", "Personal", "Preferences", "Upload photos"];

export default function RegisterPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
            Create your profile
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            A few steps away from curated, meaningful matches.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <button
                key={step}
                onClick={() => setActiveStep(index)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  activeStep === index
                    ? "border-brand-300 bg-brand-50/80 text-brand-700 dark:border-brand-500/40 dark:bg-white/5 dark:text-white"
                    : "border-slate-200 bg-white/80 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                }`}
                type="button"
              >
                <p className="text-xs uppercase tracking-[0.25em]">
                  Step {index + 1}
                </p>
                <p className="mt-2 font-serif text-lg">{step}</p>
              </button>
            ))}
          </div>
          <div className="glass-card rounded-3xl p-8">
            <h2 className="font-serif text-2xl text-slate-900 dark:text-white">
              {steps[activeStep]}
            </h2>
            <div className="mt-6 grid gap-4">
              {activeStep === 0 && (
                <>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Full name"
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Email address"
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Phone number"
                  />
                </>
              )}
              {activeStep === 1 && (
                <>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Profession"
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Education"
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="City"
                  />
                </>
              )}
              {activeStep === 2 && (
                <>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Preferred age range"
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Religion / Community"
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Location preference"
                  />
                </>
              )}
              {activeStep === 3 && (
                <>
                  <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 px-4 py-8 text-center text-sm text-brand-600 dark:border-brand-500/40 dark:bg-white/5 dark:text-brand-200">
                    Drop or browse to upload your favorite photos
                  </div>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Short bio"
                  />
                </>
              )}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() =>
                  setActiveStep((prev) => (prev > 0 ? prev - 1 : prev))
                }
              >
                Back
              </Button>
              <Button
                onClick={() =>
                  setActiveStep((prev) =>
                    prev < steps.length - 1 ? prev + 1 : prev
                  )
                }
              >
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
