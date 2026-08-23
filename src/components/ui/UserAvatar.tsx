"use client";

import React, { useState } from "react";
import { User as UserIcon } from "lucide-react";

interface UserAvatarProps {
  photoURL?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  photoURL,
  name = "User",
  size = "md",
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
    xl: "w-16 h-16 text-base",
  };

  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : "U";

  if (photoURL && !imageError) {
    return (
      <div
        className={`relative shrink-0 rounded-2xl overflow-hidden ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 ${sizeClasses[size]} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoURL}
          alt={name || "Profile Photo"}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-500/20 ${sizeClasses[size]} ${className}`}
    >
      {initial || <UserIcon className="w-4 h-4" />}
    </div>
  );
};
