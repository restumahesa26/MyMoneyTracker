"use client";

import React from "react";
import { Wallet, Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="relative mb-6">
        {/* Animated ambient glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full blur-xl opacity-30 animate-pulse pointer-events-none" />

        {/* Logo Card with gentle pulse */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 animate-bounce">
          <Wallet className="w-8 h-8" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
        <span>Memuat Halaman...</span>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
        Menyiapkan data keuangan Anda
      </p>
    </div>
  );
}
