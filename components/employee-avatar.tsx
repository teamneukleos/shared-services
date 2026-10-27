
"use client";

import { useState } from "react";

type EmployeeAvatarProps = {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function EmployeeAvatar({
  name,
  src,
  size = "md",
  className = "",
}: EmployeeAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E8E8E3] bg-[#F1F0E9] font-semibold text-[#55564F] ${sizes[size]} ${className}`}
    >
      {src && !imageFailed ? (
        <img
          src={src}
          alt={`${name} headshot`}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initials || "?"
      )}
    </span>
  );
}
