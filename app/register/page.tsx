"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, User, Briefcase, Heart, Camera, CheckCircle2 } from "lucide-react";
import Button from "../../components/shared/Button";
import Navbar from "../../components/shared/Navbar";
import PageBackdrop from "../../components/shared/PageBackdrop";
import TermsModal from "../../components/terms/TermsModal";

const steps = [
  { label: "Basic info", icon: User },
  { label: "Personal", icon: Briefcase },
  { label: "Preferences", icon: Heart },
  { label: "Upload photos", icon: Camera },
];
const MAX_PHOTO_BYTES = 1024 * 1024;
const RECOMMENDED_PHOTO_BYTES = 500 * 1024;

export default function RegisterPage() {
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  useEffect(() => {
    const previews = photos.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [photos]);

  useEffect(() => {
    if (photos.length === 0) {
      setPrimaryPhotoIndex(0);
      return;
    }

    if (primaryPhotoIndex >= photos.length) {
      setPrimaryPhotoIndex(0);
    }
  }, [photos.length, primaryPhotoIndex]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const oversized = incoming.filter((file) => file.size > MAX_PHOTO_BYTES);
    const valid = incoming.filter(
      (file) => file.type.startsWith("image/") && file.size <= MAX_PHOTO_BYTES
    );
    if (oversized.length > 0) {
      setError(
        `Each photo must be 1MB or less. ${oversized.length} file${
          oversized.length === 1 ? "" : "s"
        } skipped.`
      );
    }
    setPhotos((prev) => {
      const next = [...prev, ...valid];
      if (prev.length === 0 && next.length > 0) {
        setPrimaryPhotoIndex(0);
      }
      return next;
    });
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
    setPrimaryPhotoIndex((current) => {
      if (current === indexToRemove) return 0;
      if (indexToRemove < current) return Math.max(0, current - 1);
      return current;
    });
  };

  const getOrderedPhotos = (list: File[] = photos, primaryIndex = primaryPhotoIndex) => {
    if (list.length === 0) return [];
    const safePrimaryIndex = Math.min(Math.max(primaryIndex, 0), list.length - 1);
    return [
      list[safePrimaryIndex],
      ...list.filter((_, index) => index !== safePrimaryIndex),
    ];
  };

  const validatePrimaryPhoto = async (file: File | undefined) => {
    if (!file) {
      return "Please upload at least one primary profile photo.";
    }

    if (!file.type.startsWith("image/")) {
      return "The primary photo must be an image.";
    }

    if (file.size > MAX_PHOTO_BYTES) {
      return "The primary photo must be 1MB or smaller.";
    }

    return null;
  };

  const validateStep = (step: number) => {
    if (step === 0) {
      const errors: Record<string, string> = {};
      if (!fullName.trim()) errors.fullName = "Full name is required.";
      if (!email.trim()) {
        errors.email = "Email is required.";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim()))
          errors.email = "Please enter a valid email address.";
      }
      if (!phone.trim()) {
        errors.phone = "Phone number is required.";
      } else {
        const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
        if (!phoneRegex.test(phone.trim().replace(/\s+/g, "")))
          errors.phone = "Enter a valid 10-digit Indian mobile number (e.g. 9876543210).";
      }
      if (!password.trim()) {
        errors.password = "Password is required.";
      } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return Object.values(errors)[0];
      }
      setFieldErrors({});
      return null;
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
    const orderedPhotos = getOrderedPhotos();
    const signatureRes = await fetch("/api/upload/signature", {
      method: "POST",
    });
    if (!signatureRes.ok) {
      throw new Error("Failed to get upload signature");
    }
    const signatureData = (await signatureRes.json()) as {
      cloudName: string;
      apiKey: string;
      timestamp: number;
      folder: string;
      signature: string;
      maxFileSize: number;
    };

    const uploads = await Promise.all(
      orderedPhotos.map(async (file) => {
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
    if (!termsAgreed) {
      setError("You must agree to the Terms & Conditions to register.");
      setActiveStep(3);
      return;
    }
    setError(null);
    setLoading(true);

    const orderedPhotos = getOrderedPhotos();
    let primaryPhotoError: string | null = null;
    try {
      primaryPhotoError = await validatePrimaryPhoto(orderedPhotos[0]);
    } catch {
      primaryPhotoError = "Unable to read the primary photo. Please choose a different image.";
    }
    if (primaryPhotoError) {
      setLoading(false);
      setError(primaryPhotoError);
      setActiveStep(3);
      return;
    }

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
        termsAccepted: true,
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
      router.push("/login");
      return;
    }

    router.push("/dashboard?login=1");
  };

  return (
    <PageBackdrop>
      <Navbar />
      <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
              Create your profile
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              A few steps away from curated, meaningful matches.
            </p>
          </div>

          {/* Step progress */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const done = index < activeStep;
                const active = index === activeStep;
                return (
                  <div key={step.label} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      {/* Left connector */}
                      <div className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                        index === 0 ? "invisible" : index <= activeStep ? "bg-brand-500" : "bg-slate-200 dark:bg-white/10"
                      }`} />
                      {/* Circle */}
                      <button
                        type="button"
                        onClick={() => done && setActiveStep(index)}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          done
                            ? "border-brand-500 bg-brand-500 text-white"
                            : active
                              ? "border-brand-500 bg-white text-brand-600 shadow-[0_0_0_4px_rgba(155,28,74,0.1)] dark:bg-slate-900"
                              : "border-slate-200 bg-white text-slate-400 dark:border-white/10 dark:bg-slate-900"
                        } ${done ? "cursor-pointer" : "cursor-default"}`}
                      >
                        {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                      </button>
                      {/* Right connector */}
                      <div className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                        index === steps.length - 1 ? "invisible" : index < activeStep ? "bg-brand-500" : "bg-slate-200 dark:bg-white/10"
                      }`} />
                    </div>
                    {/* Label */}
                    <span className={`mt-2 hidden text-xs font-medium sm:block ${
                      active ? "text-brand-600 dark:text-brand-300"
                      : done ? "text-slate-600 dark:text-slate-300"
                      : "text-slate-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form card */}
          <div className="glass-card rounded-3xl p-4 sm:p-8">
            <div className="mb-6 border-b border-slate-100 pb-5 dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                Step {activeStep + 1} of {steps.length}
              </p>
              <h2 className="mt-1 font-serif text-xl text-slate-900 dark:text-white sm:text-2xl">
                {steps[activeStep].label}
              </h2>
            </div>
            <div className="grid gap-4">
              {activeStep === 0 && (
                <>
                  <div>
                    <input
                      className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${fieldErrors.fullName ? "border-red-300 dark:border-red-500/60" : "border-slate-200 dark:border-white/10"}`}
                      placeholder="Full name"
                      aria-label="Full name"
                      value={fullName}
                      onChange={(event) => { setFullName(event.target.value); setFieldErrors((e) => ({ ...e, fullName: "" })); }}
                    />
                    {fieldErrors.fullName && <p className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</p>}
                  </div>
                  <div>
                    <input
                      className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${fieldErrors.email ? "border-red-300 dark:border-red-500/60" : "border-slate-200 dark:border-white/10"}`}
                      placeholder="Email address"
                      type="email"
                      aria-label="Email address"
                      value={email}
                      onChange={(event) => { setEmail(event.target.value); setFieldErrors((e) => ({ ...e, email: "" })); }}
                    />
                    {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                  </div>
                  <div>
                    <input
                      className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${fieldErrors.phone ? "border-red-300 dark:border-red-500/60" : "border-slate-200 dark:border-white/10"}`}
                      placeholder="Phone number (e.g. 9876543210)"
                      type="tel"
                      aria-label="Phone number"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(event) => {
                        // Strip non-digits, allow optional leading + for +91 prefix
                        const raw = event.target.value;
                        // Keep only digits (and a leading + if present)
                        const digitsOnly = raw.replace(/[^\d]/g, "");
                        // If user typed +91 prefix, strip it so we store just the 10-digit number
                        const stripped = digitsOnly.startsWith("91") && digitsOnly.length > 10
                          ? digitsOnly.slice(2)
                          : digitsOnly;
                        // Hard cap at 10 digits
                        if (stripped.length <= 10) {
                          setPhone(stripped);
                          setFieldErrors((e) => ({ ...e, phone: "" }));
                        }
                      }}
                    />
                    {fieldErrors.phone && <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>}
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        className={`w-full rounded-2xl border bg-white/80 px-4 py-3 pr-12 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${fieldErrors.password ? "border-red-300 dark:border-red-500/60" : "border-slate-200 dark:border-white/10"}`}
                        placeholder="Create a password"
                        type={showPassword ? "text" : "password"}
                        aria-label="Password"
                        value={password}
                        onChange={(event) => { setPassword(event.target.value); setFieldErrors((e) => ({ ...e, password: "" })); }}
                      />
                      {password.length > 0 ? (
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-1 text-slate-400 transition hover:text-brand-600 dark:text-slate-300"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      ) : null}
                    </div>
                    {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
                  </div>
                </>
              )}
              {activeStep === 1 && (
                <>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Profession"
                    aria-label="Profession"
                    value={profession}
                    onChange={(event) => setProfession(event.target.value)}
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Education"
                    aria-label="Education"
                    value={education}
                    onChange={(event) => setEducation(event.target.value)}
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="City"
                    aria-label="City"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                  />
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    aria-label="Gender"
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
                    aria-label="Preferred age range"
                    value={preferredAgeRange}
                    onChange={(event) => setPreferredAgeRange(event.target.value)}
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Religion / Community"
                    aria-label="Religion and community"
                    value={religionCommunity}
                    onChange={(event) => setReligionCommunity(event.target.value)}
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Location preference"
                    aria-label="Location preference"
                    value={locationPreference}
                    onChange={(event) => setLocationPreference(event.target.value)}
                  />
                </>
              )}
              {activeStep === 3 && (
                <>
                  <p className="rounded-2xl border border-brand-100/70 bg-brand-50/60 px-4 py-3 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    The first photo becomes your primary profile image. Choose a clear solo portrait with your face visible. You can keep adding extra photos after that.
                  </p>
                  <p className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    Max file size is 1MB per photo. For faster loading, aim for
                    {` `}under {(RECOMMENDED_PHOTO_BYTES / 1024).toFixed(0)}KB.
                  </p>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload photo"
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {photoPreviews.map((preview, index) => (
                        <div
                          key={preview}
                          className={`overflow-hidden rounded-2xl border bg-white/80 dark:bg-white/5 ${
                            index === primaryPhotoIndex
                              ? "border-brand-300 ring-2 ring-brand-200 dark:border-brand-400 dark:ring-brand-400/30"
                              : "border-slate-200 dark:border-white/10"
                          }`}
                        >
                          <div className="relative aspect-[3/4]">
                            <img
                              src={preview}
                              alt={`Selected upload ${index + 1}`}
                              className="face-focus-top h-full w-full"
                            />
                            {index === primaryPhotoIndex ? (
                              <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
                                Primary
                              </span>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-300">
                            <span className="truncate">{photos[index]?.name}</span>
                            <div className="flex flex-wrap items-center gap-3">
                              {index !== primaryPhotoIndex ? (
                                <button
                                  type="button"
                                  className="font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-200"
                                  onClick={() => setPrimaryPhotoIndex(index)}
                                >
                                  Make primary
                                </button>
                              ) : (
                                <span className="font-semibold text-brand-600 dark:text-brand-200">
                                  Primary
                                </span>
                              )}
                              <button
                                type="button"
                                className="font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-200"
                                onClick={() => removePhoto(index)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Short bio"
                    aria-label="Bio"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                  />
                  <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(event) => {
                        setTermsAgreed(event.target.checked);
                        setError(null);
                      }}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setTermsModalOpen(true)}
                        className="font-semibold text-brand-600 hover:underline dark:text-brand-300"
                      >
                        Terms &amp; Conditions
                      </button>
                    </span>
                  </label>
                </>
              )}
            </div>
            {error && Object.keys(fieldErrors).length === 0 ? (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            ) : null}
            <div className="mt-6 flex items-center justify-between">              <Button
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
      <TermsModal
        open={termsModalOpen}
        onClose={() => {
          setTermsModalOpen(false);
          setTermsAgreed(true);
          setError(null);
        }}
      />
    </PageBackdrop>
  );
}
