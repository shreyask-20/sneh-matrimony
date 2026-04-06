"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "../../../components/shared/Button";
import Navbar from "../../../components/shared/Navbar";

const steps = ["Basic info", "Personal", "Preferences", "Upload photos"];

export default function RegisterPage() {
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [profession, setProfession] = useState("");
  const [education, setEducation] = useState("");
  const [city, setCity] = useState("");
  const [preferredAgeRange, setPreferredAgeRange] = useState("");
  const [religionCommunity, setReligionCommunity] = useState("");
  const [locationPreference, setLocationPreference] = useState("");
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const previews = photos.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [photos]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    setPhotos((prev) => [...prev, ...valid]);
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const validateStep = (step: number) => {
    if (step === 0) {
      if (!fullName.trim()) return "Full name is required.";
      if (!email.trim()) return "Email is required.";
      if (!phone.trim()) return "Phone number is required.";
      if (!password.trim()) return "Password is required.";
    }
    if (step === 1) {
      if (!gender.trim()) return "Please select gender.";
    }
    return null;
  };

  const handleNext = () => {
    const message = validateStep(activeStep);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  };

  const uploadPhotos = async () => {
    if (photos.length === 0) return [];
    const signatureRes = await fetch("/api/upload/signature");
    if (!signatureRes.ok) {
      throw new Error("Failed to get upload signature");
    }
    const signatureData = (await signatureRes.json()) as {
      cloudName: string;
      apiKey: string;
      timestamp: number;
      folder: string;
      signature: string;
    };

    const uploads = await Promise.all(
      photos.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signatureData.apiKey);
        formData.append("timestamp", signatureData.timestamp.toString());
        formData.append("folder", signatureData.folder);
        formData.append("signature", signatureData.signature);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          throw new Error("Image upload failed");
        }

        const uploadData = (await uploadRes.json()) as {
          secure_url: string;
          public_id: string;
        };

        return {
          url: uploadData.secure_url,
          publicId: uploadData.public_id,
        };
      })
    );

    return uploads;
  };

  const handleFinish = async () => {
    const step0Error = validateStep(0);
    if (step0Error) {
      setError(step0Error);
      setActiveStep(0);
      return;
    }
    const step1Error = validateStep(1);
    if (step1Error) {
      setError(step1Error);
      setActiveStep(1);
      return;
    }
    setError(null);
    setLoading(true);

    let uploadedPhotos: Array<{ url: string; publicId?: string }> = [];
    try {
      uploadedPhotos = await uploadPhotos();
    } catch (uploadError) {
      setLoading(false);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload photos."
      );
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        password,
        gender,
        profession,
        education,
        city,
        preferredAgeRange,
        religionCommunity,
        locationPreference,
        bio,
        photos: uploadedPhotos,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      let message = "Something went wrong. Please try again.";
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = (await response.json()) as { error?: string };
        if (data.error) message = data.error;
      }
      setError(message);
      return;
    }

    const signInResult = await signIn("credentials", {
      identifier: email || phone,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      router.push("/auth/login");
      return;
    }

    router.push("/");
  };

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
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Create a password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </>
              )}
              {activeStep === 1 && (
                <>
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
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </>
              )}
              {activeStep === 2 && (
                <>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Preferred age range"
                    value={preferredAgeRange}
                    onChange={(event) => setPreferredAgeRange(event.target.value)}
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Religion / Community"
                    value={religionCommunity}
                    onChange={(event) => setReligionCommunity(event.target.value)}
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Location preference"
                    value={locationPreference}
                    onChange={(event) => setLocationPreference(event.target.value)}
                  />
                </>
              )}
              {activeStep === 3 && (
                <>
                  <div
                    className={`relative rounded-2xl border border-dashed px-4 py-8 text-center text-sm transition ${
                      isDragging
                        ? "border-brand-300 bg-brand-100/70 text-brand-700 dark:border-brand-400 dark:bg-white/10 dark:text-white"
                        : "border-brand-200 bg-brand-50/60 text-brand-600 dark:border-brand-500/40 dark:bg-white/5 dark:text-brand-200"
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDragging(false);
                      handleFiles(event.dataTransfer.files);
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(event) => handleFiles(event.target.files)}
                    />
                    Drop or browse to upload your favorite photos
                    {photos.length > 0 ? (
                      <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                        {photos.length} photo{photos.length === 1 ? "" : "s"}{" "}
                        selected
                      </p>
                    ) : null}
                  </div>
                  {photoPreviews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {photoPreviews.map((preview, index) => (
                        <div
                          key={preview}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5"
                        >
                          <div className="relative aspect-[3/4]">
                            <img
                              src={preview}
                              alt={`Selected upload ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            {index === 0 ? (
                              <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
                                Primary
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-500 dark:text-slate-300">
                            <span className="truncate">{photos[index]?.name}</span>
                            <button
                              type="button"
                              className="font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-200"
                              onClick={() => removePhoto(index)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Short bio"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                  />
                </>
              )}
            </div>
            {error ? (
              <p className="mt-4 text-sm text-red-500">{error}</p>
            ) : null}
            <div className="mt-6 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setActiveStep((prev) => (prev > 0 ? prev - 1 : prev))
                }
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() =>
                  activeStep < steps.length - 1 ? handleNext() : handleFinish()
                }
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : activeStep === steps.length - 1
                  ? "Finish"
                  : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
