"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PlusCircle,
  LayoutDashboard,
  HandCoins,
  Receipt,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onOpenTransactionModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenTransactionModal }) => {
  const pathname = usePathname();

  const leftNavItems = [
    { href: "/", label: "Catat", icon: PlusCircle },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const rightNavItems = [
    { href: "/debts", label: "Hutang", icon: HandCoins },
    { href: "/transactions", label: "Riwayat", icon: Receipt },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0b0f17]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        {leftNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors",
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 font-medium"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}

        {/* Center Quick Add FAB Modal trigger */}
        <div className="-mt-6 flex flex-col items-center">
          <button
            onClick={onOpenTransactionModal}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-transform"
            aria-label="Modal Tambah Cepat"
            title="Tambah Cepat"
          >
            <Plus className="w-6 h-6" />
          </button>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1">
            Modal
          </span>
        </div>

        {rightNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors",
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 font-medium"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
