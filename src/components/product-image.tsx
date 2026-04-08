"use client";

import { useState } from "react";

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#f4f0e8" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9c8b7a" font-family="system-ui" font-size="14">PazarKapısı</text></svg>`,
  );

export function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = src && !failed ? src : PLACEHOLDER;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
