"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { useFinance } from "@/context/FinanceContext";
import {
  Sun,
  Moon,
  PlusCircle,
  ArrowRightLeft,
  LogOut,
  Sparkles,
  Wallet,
  ShieldCheck,
  Menu,
  User as UserIcon,
} from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface NavbarProps {
  onOpenTransactionModal: (type?: "INCOME" | "EXPENSE") => void;
  onOpenTransferModal: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTransactionModal,
  onOpenTransferModal,
  onOpenMobileMenu,
}) => {
  const { theme, setTheme } = useTheme();
  const { user, isDemo, logout } = useAuth();
  const { dataSource } = useFinance();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0d131f]/80 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
        {/* Left: Mobile Hamburger Menu & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger Menu Button (Mobile & Tablet) */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            aria-label="Buka Menu Sidebar"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-emerald-500 dark:from-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
                MyMoneyTracker
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
                  Personal Finance
                </span>
                {dataSource === "FIREBASE" ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                    Cloud
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    Dummy JSON
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Buttons (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => onOpenTransactionModal("EXPENSE")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 transition-all hover:scale-102 active:scale-98 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Pengeluaran</span>
            </button>

            <button
              onClick={() => onOpenTransactionModal("INCOME")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 transition-all hover:scale-102 active:scale-98 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Pemasukan</span>
            </button>

            <button
              onClick={onOpenTransferModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 transition-all hover:scale-102 active:scale-98 shadow-sm"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Ganti Mode Gelap/Terang"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 scale-100" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform rotate-0 scale-100" />
            )}
          </button>

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <UserAvatar
                photoURL={user?.photoURL}
                name={user?.displayName || user?.email}
                size="sm"
              />
              <span className="hidden md:inline text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                {user?.displayName || (isDemo ? "Guest Demo" : "Pengguna")}
              </span>
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-scale-in">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {user?.displayName || "Pengguna"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user?.email || "demo@moneytracker.id"}
                    </p>
                    {isDemo && (
                      <span className="mt-1.5 inline-block text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium px-2 py-0.5 rounded-full">
                        Mode Tamu (Lokal)
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    {isDemo && (
                      <Link
                        href="/login"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60"
                      >
                        <UserIcon className="w-4 h-4" />
                        Login / Sync Firebase
                      </Link>
                    )}
                    <Link
                      href="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <DynamicIcon name="Settings" className="w-4 h-4 text-slate-400" />
                      Pengaturan & Preferensi
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar (Sign Out)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
