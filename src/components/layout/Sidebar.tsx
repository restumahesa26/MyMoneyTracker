"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFinance } from "@/context/FinanceContext";
import {
  LayoutDashboard,
  BarChart3,
  Receipt,
  WalletCards,
  Target,
  Settings,
  Sparkles,
  X,
  PlusCircle,
  ArrowRightLeft,
  LogOut,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";

export const NAV_ITEMS = [
  {
    name: "Catat Cepat",
    href: "/",
    icon: PlusCircle,
    badge: "Utama",
  },
  {
    name: "Dashboard & Ringkasan",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Analisis Mendalam",
    href: "/analytics",
    icon: BarChart3,
    badge: "AI/Pro",
  },
  {
    name: "Riwayat Transaksi",
    href: "/transactions",
    icon: Receipt,
    badge: null,
  },
  {
    name: "Dompet & Akun",
    href: "/wallets",
    icon: WalletCards,
    badge: null,
  },
  {
    name: "Kategori & Budget",
    href: "/categories",
    icon: Target,
    badge: null,
  },
  {
    name: "Pengaturan",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenTransactionModal?: (type?: "INCOME" | "EXPENSE") => void;
  onOpenTransferModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile = () => {},
  onOpenTransactionModal,
  onOpenTransferModal,
}) => {
  const pathname = usePathname();
  const { user, isDemo, logout } = useAuth();
  const { dataSource } = useFinance();

  const renderNavLinks = () => (
    <div className="space-y-1">
      <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
        Menu Navigasi
      </p>
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onCloseMobile}
            className={cn(
              "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group",
              isActive
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-850 dark:hover:text-slate-100 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )}
              />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-[#0b0f17]/50 p-4 shrink-0 min-h-[calc(100vh-4rem)]">
        {renderNavLinks()}

        {/* Pro Banner / Tips Widget */}
        <div className="mt-auto pt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-emerald-900/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-emerald-950/30 border border-indigo-200/50 dark:border-indigo-800/40">
            <div className="flex items-center gap-2 mb-1.5 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold">Tips Keuangan</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Gunakan metode 50/30/20: 50% Kebutuhan, 30% Keinginan, dan 20% Tabungan/Investasi.
            </p>
          </div>

          {/* Desktop Sidebar User Profile Card */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar photoURL={user?.photoURL} name={user?.displayName || user?.email} size="md" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {user?.displayName || "Pengguna"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || "demo@moneytracker.id"}
                </p>
              </div>
            </div>

            <Link
              href="/settings"
              title="Pengaturan"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Drawer / Sheet (Accessible via Hamburger Menu) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between p-5 z-50 h-full overflow-y-auto animate-scale-in">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <Link
                  href="/"
                  onClick={onCloseMobile}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center shadow-sm overflow-hidden p-1">
                    <img
                      src="/favicon/favicon-96x96.png"
                      alt="MyMoneyTracker Logo"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-base tracking-tight bg-gradient-to-r from-indigo-600 to-emerald-500 dark:from-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
                      MyMoneyTracker
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                        Personal Finance
                      </span>
                      {dataSource === "FIREBASE" ? (
                        <span className="text-[8px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-300 dark:border-emerald-700/50">
                          Cloud
                        </span>
                      ) : (
                        <span className="text-[8px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-300 dark:border-amber-700/50">
                          Dummy JSON
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="space-y-2 mb-5">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                  Aksi Cepat
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onCloseMobile();
                      onOpenTransactionModal?.("EXPENSE");
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Pengeluaran</span>
                  </button>
                  <button
                    onClick={() => {
                      onCloseMobile();
                      onOpenTransactionModal?.("INCOME");
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Pemasukan</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    onCloseMobile();
                    onOpenTransferModal?.();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Transfer Antar Dompet</span>
                </button>
              </div>

              {/* Nav Links */}
              {renderNavLinks()}
            </div>

            {/* Bottom Drawer info & Logout */}
            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <UserAvatar photoURL={user?.photoURL} name={user?.displayName || user?.email} size="md" />
                <div className="min-w-0 flex-1 truncate">
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                    {user?.displayName || "Pengguna"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email || "demo@moneytracker.id"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onCloseMobile();
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar (Sign Out)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
