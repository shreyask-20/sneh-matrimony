"use client";

import { useState } from "react";

type ProfilePhoto = {
  url: string;
  status?: string;
};

export default function ProfileGallery({
  photos,
  alt,
}: {
  photos: ProfilePhoto[];
  alt: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedPhoto = photos[selectedIndex] ?? photos[0];
  const isPending = selectedPhoto?.status === "PENDING";

  return (
    <div className="space-y-4">
      <div className="relative w-full overflow-hidden rounded-3xl">
        <img
          src={selectedPhoto.url}
          alt={alt}
          className={`face-focus-portrait w-full aspect-[3/3] rounded-3xl transition-all duration-300 ${
            isPending ? "blur-xl scale-105" : ""
          }`}
        />
        {isPending && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-black/20">
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow">
              Pending approval
            </span>
          </div>
        )}
      </div>
      {photos.length > 1 ? (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo, index) => {
            const thumbPending = photo.status === "PENDING";
            return (
              <button
                key={`${photo.url}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative overflow-hidden rounded-2xl border transition ${
                  selectedIndex === index
                    ? "border-brand-400 ring-2 ring-brand-200"
                    : "border-transparent hover:border-brand-200"
                }`}
                aria-label={`View photo ${index + 1}`}
              >
                <img
                  src={photo.url}
                  alt={alt}
                  className={`face-focus h-20 w-full rounded-2xl transition-all ${
                    thumbPending ? "blur-md scale-110" : ""
                  }`}
                />
                {thumbPending && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/10">
                    <span className="text-[9px] font-semibold text-white drop-shadow">
                      Pending
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
