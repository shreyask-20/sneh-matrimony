"use client";

import { useState, useEffect } from "react";
import HoroscopeChart from "@/components/profile/HoroscopeChart";
import Navbar from "@/components/shared/Navbar";
import BackButton from "@/components/shared/BackButton";
import Button from "@/components/shared/Button";
import {
  emptyHoroscopeChart,
  horoscopeChartHouseKeys,
  normalizeHoroscopeChartInput,
} from "@/lib/horoscope";

type Photo = {
  id: number;
  url: string;
  status: string;
  isPrimary: boolean;
};

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
  photos: Photo[];
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

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 1024 * 1024;
const MIN_PRIMARY_PHOTO_SIDE = 900;

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
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>(
    initialValues?.photos ?? []
  );
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const previewChart = normalizeHoroscopeChartInput(chartValues);

  const totalPhotoCount = existingPhotos.length + newPhotos.length;

  useEffect(() => {
    const previews = newPhotos.map((file) => URL.createObjectURL(file));
    setNewPhotoPreviews(previews);
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [newPhotos]);

  useEffect(() => {
    if (totalPhotoCount === 0) {
      setPrimaryPhotoIndex(0);
      return;
    }
    if (primaryPhotoIndex >= totalPhotoCount) {
      setPrimaryPhotoIndex(0);
    }
  }, [totalPhotoCount, primaryPhotoIndex]);

  const updateChartValue = (
    houseKey: (typeof horoscopeChartHouseKeys)[number],
    value: string
  ) => {
    setChartValues((current) => ({
      ...current,
      [houseKey]: value,
    }));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const valid = incoming.filter(
      (file) => file.type.startsWith("image/") && file.size <= MAX_PHOTO_BYTES
    );
    const oversized = incoming.filter((file) => file.size > MAX_PHOTO_BYTES);
    if (oversized.length > 0) {
      setPhotoError(
        `Each photo must be 1MB or less. ${oversized.length} file${
          oversized.length === 1 ? "" : "s"
        } skipped.`
      );
    }
    const currentPhotos = newPhotos;
    const next = [...currentPhotos, ...valid];
    if (next.length === 0 && next.length > 0) {
      setPrimaryPhotoIndex(0);
    }
    if (next.length > 0 && next.length + existingPhotos.length > MAX_PHOTOS) {
      setPhotoError(`You can only have up to ${MAX_PHOTOS} photos total.`);
      return;
    }
    setNewPhotos(next);
    setPhotoError(null);
  };

  const setPhotos = (photos: File[]) => {
    if (photos.length > 0 && photos.length + existingPhotos.length > MAX_PHOTOS) {
      setPhotoError(`You can only have up to ${MAX_PHOTOS} photos total.`);
      return;
    }
    setNewPhotos(photos);
    setPhotoError(null);
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
    setPrimaryPhotoIndex((current) => {
      if (current === index) return 0;
      if (index < current) return Math.max(0, current - 1);
      return current;
    });
  };

  const removeExistingPhoto = async (photoId: number) => {
    try {
      const res = await fetch(`/api/photos?id=${photoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setPhotoError(data.error ?? "Failed to delete photo.");
        return;
      }
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch {
      setPhotoError("Failed to delete photo.");
    }
  };

  const setPrimaryExistingPhoto = async (photoId: number) => {
    try {
      const res = await fetch("/api/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ photoId }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setPhotoError(data.error ?? "Failed to set primary photo.");
        return;
      }
      setExistingPhotos((prev) =>
        prev.map((p) => ({ ...p, isPrimary: p.id === photoId }))
      );
      setPrimaryPhotoIndex(existingPhotos.findIndex((p) => p.id === photoId));
    } catch {
      setPhotoError("Failed to set primary photo.");
    }
  };

  const loadImageDimensions = (file: File) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const previewUrl = URL.createObjectURL(file);
      const image = new window.Image();
      image.onload = () => {
        URL.revokeObjectURL(previewUrl);
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      };
      image.onerror = () => {
        URL.revokeObjectURL(previewUrl);
        reject(new Error("Unable to read image."));
      };
      image.src = previewUrl;
    });

  const validatePrimaryPhoto = async (file: File | undefined) => {
    if (!file) return null;
    if (file.size > MAX_PHOTO_BYTES) {
      return "The primary photo must be 1MB or smaller.";
    }
    try {
      const dimensions = await loadImageDimensions(file);
      if (
        dimensions.width < MIN_PRIMARY_PHOTO_SIDE ||
        dimensions.height < MIN_PRIMARY_PHOTO_SIDE
      ) {
        return "Primary photo should be at least 900px on both sides.";
      }
    } catch {
      return "Unable to read the primary photo.";
    }
    return null;
  };

  const uploadPhotos = async (orderedFiles: File[]) => {
    const signatureRes = await fetch("/api/upload/signature", {
      method: "POST",
      credentials: "include",
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
      orderedFiles.map(async (file) => {
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

    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i];
      // The new photo is primary if: no existing photos and it's the first new photo,
      // or its overall index matches primaryPhotoIndex
      const overallIndex = existingPhotos.length + i;
      const isPrimary = overallIndex === primaryPhotoIndex && existingPhotos.length === 0
        ? true
        : overallIndex === primaryPhotoIndex;

      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          url: upload.url,
          publicId: upload.publicId,
          isPrimary,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save photo.");
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setPhotoError(null);
    setFieldErrors({});

    const newFieldErrors: {[key: string]: string} = {};

    if (!fullName.trim()) newFieldErrors.fullName = "This field is required";
    if (!gender.trim()) newFieldErrors.gender = "This field is required";
    if (!birthDate.trim()) newFieldErrors.birthDate = "This field is required";
    if (!maritalStatus.trim()) newFieldErrors.maritalStatus = "This field is required";
    if (!height.trim()) newFieldErrors.height = "This field is required";
    if (!profession.trim()) newFieldErrors.profession = "This field is required";
    if (!education.trim()) newFieldErrors.education = "This field is required";
    if (!city.trim()) newFieldErrors.city = "This field is required";
    if (!religion.trim()) newFieldErrors.religion = "This field is required";
    if (!community.trim()) newFieldErrors.community = "This field is required";
    if (!motherTongue.trim()) newFieldErrors.motherTongue = "This field is required";
    if (!fatherName.trim()) newFieldErrors.fatherName = "This field is required";
    if (!motherName.trim()) newFieldErrors.motherName = "This field is required";
    if (!nakshatra.trim()) newFieldErrors.nakshatra = "This field is required";
    if (!rashi.trim()) newFieldErrors.rashi = "This field is required";
    if (!gotra.trim()) newFieldErrors.gotra = "This field is required";
    if (!preferredAgeRange.trim()) newFieldErrors.preferredAgeRange = "This field is required";
    if (!religionCommunity.trim()) newFieldErrors.religionCommunity = "This field is required";
    if (!locationPreference.trim()) newFieldErrors.locationPreference = "This field is required";
    if (!castePreference.trim()) newFieldErrors.castePreference = "This field is required";
    if (!subCastePreference.trim()) newFieldErrors.subCastePreference = "This field is required";
    if (!expectations.trim()) newFieldErrors.expectations = "This field is required";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setError("Please fill in all required fields highlighted in red.");
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

    if (newPhotos.length > 0) {
      const validationError = await validatePrimaryPhoto(newPhotos[0]);
      if (validationError) {
        setLoading(false);
        setPhotoError(validationError);
        return;
      }

      setUploading(true);
      try {
        await uploadPhotos(newPhotos);
      } catch (uploadError) {
        setLoading(false);
        setUploading(false);
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload photos."
        );
        return;
      }
      setUploading(false);
    }

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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

    setFieldErrors({});
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
            Update your profile information and photos.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Photos ({totalPhotoCount}/{MAX_PHOTOS})
              </p>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {existingPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 ${
                      photo.isPrimary
                        ? "border-brand-400"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPrimaryExistingPhoto(photo.id)}
                      className="absolute left-1 top-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white"
                    >
                      {photo.isPrimary ? "Primary" : "Set Primary"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(photo.id)}
                      className="absolute right-1 top-1 rounded-full bg-red-500/80 p-1 text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {newPhotoPreviews.map((preview, index) => (
                  <div
                    key={`new-${index}`}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 ${
                      existingPhotos.length + index === primaryPhotoIndex
                        ? "border-brand-400"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={preview}
                      alt={`New photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newIdx = existingPhotos.length + index;
                        if (totalPhotoCount === 1) {
                          setPrimaryPhotoIndex(0);
                        } else {
                          setPrimaryPhotoIndex(
                            newIdx === primaryPhotoIndex
                              ? 0
                              : newIdx
                          );
                        }
                      }}
                      className="absolute left-1 top-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white"
                    >
                      {existingPhotos.length + index === primaryPhotoIndex
                        ? "Primary"
                        : "Set Primary"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-500/80 p-1 text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {totalPhotoCount < MAX_PHOTOS && (
                  <label className="flex aspect-square cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-300 hover:text-brand-400">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                    <span className="text-3xl">+</span>
                  </label>
                )}
              </div>
              {photoError && (
                <p className="text-sm text-red-500">{photoError}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Basic details
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.fullName ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Full name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.fullName}</p>
                )}
              </div>
              <div>
                <select
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.gender ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {fieldErrors.gender && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.gender}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.birthDate ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  type="date"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                />
                {fieldErrors.birthDate && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.birthDate}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.maritalStatus ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Marital status"
                  value={maritalStatus}
                  onChange={(event) => setMaritalStatus(event.target.value)}
                />
                {fieldErrors.maritalStatus && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.maritalStatus}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.height ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Height (e.g. 5ft 6in)"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                />
                {fieldErrors.height && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.height}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.profession ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Profession"
                  value={profession}
                  onChange={(event) => setProfession(event.target.value)}
                />
                {fieldErrors.profession && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.profession}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.education ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Education"
                  value={education}
                  onChange={(event) => setEducation(event.target.value)}
                />
                {fieldErrors.education && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.education}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.city ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="City"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
                {fieldErrors.city && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.city}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.religion ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Religion"
                  value={religion}
                  onChange={(event) => setReligion(event.target.value)}
                />
                {fieldErrors.religion && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.religion}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.community ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Community / Caste"
                  value={community}
                  onChange={(event) => setCommunity(event.target.value)}
                />
                {fieldErrors.community && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.community}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.motherTongue ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Mother tongue"
                  value={motherTongue}
                  onChange={(event) => setMotherTongue(event.target.value)}
                />
                {fieldErrors.motherTongue && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.motherTongue}</p>
                )}
              </div>
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
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.fatherName ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Father full name"
                  value={fatherName}
                  onChange={(event) => setFatherName(event.target.value)}
                />
                {fieldErrors.fatherName && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.fatherName}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.motherName ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Mother full name"
                  value={motherName}
                  onChange={(event) => setMotherName(event.target.value)}
                />
                {fieldErrors.motherName && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.motherName}</p>
                )}
              </div>
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
              <div>
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
              </div>
              <div>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  value={manglik ? "Yes" : "No"}
                  onChange={(event) => setManglik(event.target.value === "Yes")}
                >
                  <option value="Yes">Manglik: Yes</option>
                  <option value="No">Manglik: No</option>
                </select>
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.nakshatra ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Nakshatra"
                  value={nakshatra}
                  onChange={(event) => setNakshatra(event.target.value)}
                />
                {fieldErrors.nakshatra && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.nakshatra}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.rashi ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Rashi"
                  value={rashi}
                  onChange={(event) => setRashi(event.target.value)}
                />
                {fieldErrors.rashi && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.rashi}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.gotra ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Gotra"
                  value={gotra}
                  onChange={(event) => setGotra(event.target.value)}
                />
                {fieldErrors.gotra && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.gotra}</p>
                )}
              </div>
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
                  Enter each house directly here.
                </p>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Partner preferences
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.preferredAgeRange ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Preferred age range"
                  value={preferredAgeRange}
                  onChange={(event) => setPreferredAgeRange(event.target.value)}
                />
                {fieldErrors.preferredAgeRange && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.preferredAgeRange}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.religionCommunity ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Religion / community preference"
                  value={religionCommunity}
                  onChange={(event) => setReligionCommunity(event.target.value)}
                />
                {fieldErrors.religionCommunity && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.religionCommunity}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.castePreference ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Caste preference"
                  value={castePreference}
                  onChange={(event) => setCastePreference(event.target.value)}
                />
                {fieldErrors.castePreference && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.castePreference}</p>
                )}
              </div>
              <div>
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.subCastePreference ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Sub-caste preference"
                  value={subCastePreference}
                  onChange={(event) => setSubCastePreference(event.target.value)}
                />
                {fieldErrors.subCastePreference && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.subCastePreference}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <input
                  className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                    fieldErrors.locationPreference ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Location preference"
                  value={locationPreference}
                  onChange={(event) => setLocationPreference(event.target.value)}
                />
                {fieldErrors.locationPreference && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.locationPreference}</p>
                )}
              </div>
            </div>
            <div>
              <textarea
                className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-300 dark:bg-white/5 dark:text-white ${
                  fieldErrors.expectations ? 'border-red-300' : 'border-slate-200 dark:border-white/10'
                }`}
                rows={4}
                placeholder="Expectations"
                value={expectations}
                onChange={(event) =>
                  setExpectations(event.target.value)
                }
              />
              {fieldErrors.expectations && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.expectations}</p>
              )}
            </div>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {success ? (
              <p className="text-sm text-green-600">{success}</p>
            ) : null}
            <Button
              type="submit"
              disabled={loading || uploading}
              className="w-full"
            >
              {uploading
                ? "Uploading photos..."
                : loading
                ? "Saving..."
                : "Save changes"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}