"use client";

import { useState } from "react";

type ProfilePhoto = {
  url: string;
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

  return (
    <div className="space-y-4">
      <img
        src={selectedPhoto.url}
        alt={alt}
        className="face-focus-portrait w-full aspect-[3/3] rounded-3xl"
      />
      {photos.length > 1 ? (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo, index) => (
            <button
              key={`${photo.url}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`overflow-hidden rounded-2xl border transition ${
                selectedIndex === index
                  ? "border-brand-400 ring-2 ring-brand-200"
                  : "border-transparent hover:border-brand-200"
              }`}
              aria-label={`View photo ${index + 1}`}
            >
              <img
                src={photo.url}
                alt={alt}
                className="face-focus h-16 w-full rounded-2xl"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
