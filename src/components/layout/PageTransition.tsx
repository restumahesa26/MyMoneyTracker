"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Instant Click Interceptor for Links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;

      if (anchor && anchor.href) {
        const targetUrl = new URL(anchor.href, window.location.origin);
        const currentUrl = new URL(window.location.href);

        // If internal link and different pathname
        const isInternal = targetUrl.origin === currentUrl.origin;
        const isDifferentPath = targetUrl.pathname !== currentUrl.pathname;
        const isSamePageHash = targetUrl.pathname === currentUrl.pathname && targetUrl.hash !== "";

        if (
          isInternal &&
          isDifferentPath &&
          !isSamePageHash &&
          !anchor.target &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          // Trigger instant loading indicator (0ms latency!)
          setIsNavigating(true);
          setProgress(25);

          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            setProgress((prev) => {
              if (prev < 85) {
                return prev + Math.random() * 15;
              }
              return prev;
            });
          }, 150);
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // 2. When pathname finishes changing (Page has loaded/compiled)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);

    const timer = setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 250);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* 1. Glowing Top Progress Bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-slate-200/20 dark:bg-slate-800/40 overflow-hidden pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-lg shadow-indigo-500/80 transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 2. Instant Floating Loading Badge (Shows immediate feedback while Next.js compiles) */}
      {isNavigating && (
        <div className="fixed top-4 right-4 z-50 pointer-events-none animate-scale-in">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 backdrop-blur-md">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span className="text-xs font-bold tracking-tight">Memuat Halaman...</span>
          </div>
        </div>
      )}

      {/* 3. Subtle background shimmer overlay during route change */}
      {isNavigating && (
        <div className="fixed inset-0 z-30 bg-black/5 dark:bg-black/20 backdrop-blur-[1px] pointer-events-none transition-opacity duration-200" />
      )}

      {/* 4. Animated Page Entrance */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
};
