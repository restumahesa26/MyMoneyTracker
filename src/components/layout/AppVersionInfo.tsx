"use client";

import React, { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Clock, GitCommit } from "lucide-react";

interface AppVersionInfoProps {
  className?: string;
}

export const AppVersionInfo: React.FC<AppVersionInfoProps> = ({ className = "" }) => {
  const lastUpdatedRaw =
    process.env.NEXT_PUBLIC_APP_LAST_UPDATED || process.env.NEXT_PUBLIC_BUILD_TIME;
  const commitHash = process.env.NEXT_PUBLIC_APP_COMMIT_HASH;

  const formattedDate = useMemo(() => {
    if (!lastUpdatedRaw) return "Terbaru";
    try {
      const parsed = parseISO(lastUpdatedRaw);
      return format(parsed, "d MMM yyyy, HH:mm", { locale: localeId });
    } catch {
      return lastUpdatedRaw;
    }
  }, [lastUpdatedRaw]);

  return (
    <div
      className={`px-2 py-1.5 text-center text-[10px] text-slate-400 dark:text-slate-500 select-none ${className}`}
    >
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
          <Clock className="w-3 h-3 shrink-0" />
          <span>Update: {formattedDate}</span>
        </span>
        {commitHash && (
          <span
            title={`Git Commit: ${commitHash}`}
            className="inline-flex items-center gap-0.5 font-mono text-[9px] bg-slate-100 dark:bg-slate-800/90 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-750 text-slate-500 dark:text-slate-400"
          >
            <GitCommit className="w-2.5 h-2.5 shrink-0" />
            <span>{commitHash}</span>
          </span>
        )}
      </div>
    </div>
  );
};
