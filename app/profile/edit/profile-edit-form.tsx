"use client";

import { useState } from "react";
import Navbar from "@/components/shared/Navbar";
import BackButton from "@/components/shared/BackButton";
import Button from "@/components/shared/Button";

type InitialValues = {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  birthDate: Date | null;
  maritalStatus: string | null;
  height: string | null;
  profession: string | null;
  education: string | null;
  city: string | null;
  bio: string | null;
} | null;

export default function ProfileEditForm({
  initialValues,
}: {
  initialValues: InitialValues;
}) {
  const [fullName, setFullName] = useState(initialValues?.name ?? "");
  const [gender, setGender] = useState(initialValues?.gender ?? "");
  const [birthDate, setBirthDate] = useState(
    initialValues?.birthDate
      ? new Date(initialValues.birthDate).toISOString().slice(0, 10)
      : ""
  );
  const [maritalStatus, setMaritalStatus] = useState(
    initialValues?.maritalStatus ?? ""
  );
  const [height, setHeight] = useState(initialValues?.height ?? "");
  const [profession, setProfession] = useState(
    initialValues?.profession ?? ""
  );
  const [education, setEducation] = useState(initialValues?.education ?? "");
  const [city, setCity] = useState(initialValues?.city ?? "");
  const [bio, setBio] = useState(initialValues?.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const requiredMissing =
      !fullName.trim() ||
      !gender.trim() ||
      !birthDate.trim() ||
      !maritalStatus.trim() ||
      !height.trim() ||
      !profession.trim() ||
      !education.trim() ||
      !city.trim();

    if (requiredMissing) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        gender,
        birthDate,
        maritalStatus,
        height,
        profession,
        education,
        city,
        bio,
      }),
    });
    setLoading(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Failed to update profile.");
      return;
    }

    setSuccess("Profile updated successfully.");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8">
          <div className="space-y-4">
            <BackButton fallbackHref="/profile" />
            <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
              Edit profile
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Complete your details so your profile can be approved.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
              >
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Marital status"
                value={maritalStatus}
                onChange={(event) => setMaritalStatus(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Height (e.g. 5ft 6in)"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Profession"
                value={profession}
                onChange={(event) => setProfession(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Education"
                value={education}
                onChange={(event) => setEducation(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="City"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </div>
            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
              rows={4}
              placeholder="Short bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {success ? (
              <p className="text-sm text-green-600">{success}</p>
            ) : null}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
