"use client";

import { useState } from "react";
import HoroscopeChart from "@/components/profile/HoroscopeChart";
import Navbar from "@/components/shared/Navbar";
import BackButton from "@/components/shared/BackButton";
import Button from "@/components/shared/Button";
import {
  emptyHoroscopeChart,
  horoscopeChartHouseKeys,
  normalizeHoroscopeChartInput,
} from "@/lib/horoscope";

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
  religion: string | null;
  community: string | null;
  motherTongue: string | null;
  bio: string | null;
  familyDetails: {
    fatherName: string;
    motherName: string;
    totalBrothers: number;
    totalSisters: number;
    marriedBrothers: number;
    marriedSisters: number;
  } | null;
  horoscope: {
    horoscopeAvailable: boolean;
    manglik: boolean;
    nakshatra: string;
    rashi: string;
    gotra: string;
    gan: string | null;
    nadi: string | null;
    charan: string | null;
    chart: unknown;
  } | null;
  preferences: {
    preferredAgeRange: string | null;
    religionCommunity: string | null;
    locationPreference: string | null;
    castePreference: string | null;
    subCastePreference: string | null;
    expectations: string | null;
  } | null;
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
  const [religion, setReligion] = useState(initialValues?.religion ?? "");
  const [community, setCommunity] = useState(initialValues?.community ?? "");
  const [motherTongue, setMotherTongue] = useState(
    initialValues?.motherTongue ?? ""
  );
  const [bio, setBio] = useState(initialValues?.bio ?? "");
  const [fatherName, setFatherName] = useState(
    initialValues?.familyDetails?.fatherName ?? ""
  );
  const [motherName, setMotherName] = useState(
    initialValues?.familyDetails?.motherName ?? ""
  );
  const [totalBrothers, setTotalBrothers] = useState(
    String(initialValues?.familyDetails?.totalBrothers ?? 0)
  );
  const [totalSisters, setTotalSisters] = useState(
    String(initialValues?.familyDetails?.totalSisters ?? 0)
  );
  const [marriedBrothers, setMarriedBrothers] = useState(
    String(initialValues?.familyDetails?.marriedBrothers ?? 0)
  );
  const [marriedSisters, setMarriedSisters] = useState(
    String(initialValues?.familyDetails?.marriedSisters ?? 0)
  );
  const [horoscopeAvailable, setHoroscopeAvailable] = useState(
    initialValues?.horoscope?.horoscopeAvailable ?? false
  );
  const [manglik, setManglik] = useState(
    initialValues?.horoscope?.manglik ?? false
  );
  const [nakshatra, setNakshatra] = useState(
    initialValues?.horoscope?.nakshatra ?? ""
  );
  const [rashi, setRashi] = useState(initialValues?.horoscope?.rashi ?? "");
  const [gotra, setGotra] = useState(initialValues?.horoscope?.gotra ?? "");
  const [gan, setGan] = useState(initialValues?.horoscope?.gan ?? "");
  const [nadi, setNadi] = useState(initialValues?.horoscope?.nadi ?? "");
  const [charan, setCharan] = useState(initialValues?.horoscope?.charan ?? "");
  const [chartValues, setChartValues] = useState(
    normalizeHoroscopeChartInput(initialValues?.horoscope?.chart) ?? {
      ...emptyHoroscopeChart,
    }
  );
  const [preferredAgeRange, setPreferredAgeRange] = useState(
    initialValues?.preferences?.preferredAgeRange ?? ""
  );
  const [religionCommunity, setReligionCommunity] = useState(
    initialValues?.preferences?.religionCommunity ?? ""
  );
  const [locationPreference, setLocationPreference] = useState(
    initialValues?.preferences?.locationPreference ?? ""
  );
  const [castePreference, setCastePreference] = useState(
    initialValues?.preferences?.castePreference ?? ""
  );
  const [subCastePreference, setSubCastePreference] = useState(
    initialValues?.preferences?.subCastePreference ?? ""
  );
  const [expectations, setExpectations] = useState(
    initialValues?.preferences?.expectations ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const previewChart = normalizeHoroscopeChartInput(chartValues);
  const updateChartValue = (
    houseKey: (typeof horoscopeChartHouseKeys)[number],
    value: string
  ) => {
    setChartValues((current) => ({
      ...current,
      [houseKey]: value,
    }));
  };

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
      !city.trim() ||
      !religion.trim() ||
      !community.trim() ||
      !motherTongue.trim() ||
      !fatherName.trim() ||
      !motherName.trim() ||
      !nakshatra.trim() ||
      !rashi.trim() ||
      !gotra.trim() ||
      !preferredAgeRange.trim() ||
      !religionCommunity.trim() ||
      !locationPreference.trim() ||
      !castePreference.trim() ||
      !subCastePreference.trim() ||
      !expectations.trim();

    if (requiredMissing) {
      setError("Please fill all required fields.");
      return;
    }

    const parsedChart = normalizeHoroscopeChartInput(chartValues);

    const parsedTotalBrothers = Number(totalBrothers);
    const parsedTotalSisters = Number(totalSisters);
    const parsedMarriedBrothers = Number(marriedBrothers);
    const parsedMarriedSisters = Number(marriedSisters);
    const siblingCounts = [
      parsedTotalBrothers,
      parsedTotalSisters,
      parsedMarriedBrothers,
      parsedMarriedSisters,
    ];

    if (
      siblingCounts.some(
        (value) => !Number.isInteger(value) || Number.isNaN(value) || value < 0
      )
    ) {
      setError("Sibling counts must be whole numbers starting from 0.");
      return;
    }

    if (
      parsedMarriedBrothers > parsedTotalBrothers ||
      parsedMarriedSisters > parsedTotalSisters
    ) {
      setError("Married sibling counts cannot exceed total siblings.");
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
        religion,
        community,
        motherTongue,
        bio,
        familyDetails: {
          fatherName,
          motherName,
          totalBrothers: parsedTotalBrothers,
          totalSisters: parsedTotalSisters,
          marriedBrothers: parsedMarriedBrothers,
          marriedSisters: parsedMarriedSisters,
        },
        horoscope: {
          horoscopeAvailable,
          manglik,
          nakshatra,
          rashi,
          gotra,
          gan,
          nadi,
          charan,
          chart: parsedChart,
        },
        preferences: {
          preferredAgeRange,
          religionCommunity,
          locationPreference,
          castePreference,
          subCastePreference,
          expectations,
        },
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
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Basic details
              </p>
            </div>
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
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Religion"
                value={religion}
                onChange={(event) => setReligion(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Community / Caste"
                value={community}
                onChange={(event) => setCommunity(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Mother tongue"
                value={motherTongue}
                onChange={(event) => setMotherTongue(event.target.value)}
              />
            </div>
            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
              rows={4}
              placeholder="Short bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
            <div className="pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Family details
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Father full name"
                value={fatherName}
                onChange={(event) => setFatherName(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Mother full name"
                value={motherName}
                onChange={(event) => setMotherName(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                type="number"
                min="0"
                placeholder="Total brothers"
                value={totalBrothers}
                onChange={(event) => setTotalBrothers(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                type="number"
                min="0"
                placeholder="Married brothers"
                value={marriedBrothers}
                onChange={(event) => setMarriedBrothers(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                type="number"
                min="0"
                placeholder="Total sisters"
                value={totalSisters}
                onChange={(event) => setTotalSisters(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                type="number"
                min="0"
                placeholder="Married sisters"
                value={marriedSisters}
                onChange={(event) => setMarriedSisters(event.target.value)}
              />
            </div>
            <div className="pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Horoscope
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                value={horoscopeAvailable ? "Yes" : "No"}
                onChange={(event) =>
                  setHoroscopeAvailable(event.target.value === "Yes")
                }
              >
                <option value="Yes">Horoscope available: Yes</option>
                <option value="No">Horoscope available: No</option>
              </select>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                value={manglik ? "Yes" : "No"}
                onChange={(event) => setManglik(event.target.value === "Yes")}
              >
                <option value="Yes">Manglik: Yes</option>
                <option value="No">Manglik: No</option>
              </select>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Nakshatra"
                value={nakshatra}
                onChange={(event) => setNakshatra(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Rashi"
                value={rashi}
                onChange={(event) => setRashi(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white md:col-span-2"
                placeholder="Gotra"
                value={gotra}
                onChange={(event) => setGotra(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Gan"
                value={gan}
                onChange={(event) => setGan(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Nadi"
                value={nadi}
                onChange={(event) => setNadi(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white md:col-span-2"
                placeholder="Charan"
                value={charan}
                onChange={(event) => setCharan(event.target.value)}
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {horoscopeChartHouseKeys.map((houseKey, index) => (
                  <label key={houseKey} className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      House {index + 1}
                    </span>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder={`Value for H${index + 1}`}
                      value={chartValues[houseKey] ?? ""}
                      onChange={(event) =>
                        updateChartValue(houseKey, event.target.value)
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Chart preview
                </p>
                <HoroscopeChart chart={previewChart} />
                <p className="text-xs text-slate-400">
                  Enter each house directly here. We will save it behind the scenes in chart data.
                </p>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Partner preferences
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Preferred age range"
                value={preferredAgeRange}
                onChange={(event) => setPreferredAgeRange(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Religion / community preference"
                value={religionCommunity}
                onChange={(event) => setReligionCommunity(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Caste preference"
                value={castePreference}
                onChange={(event) => setCastePreference(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Sub-caste preference"
                value={subCastePreference}
                onChange={(event) => setSubCastePreference(event.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white md:col-span-2"
                placeholder="Location preference"
                value={locationPreference}
                onChange={(event) => setLocationPreference(event.target.value)}
              />
            </div>
            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
              rows={4}
              placeholder="Expectations"
              value={expectations}
              onChange={(event) => setExpectations(event.target.value)}
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
