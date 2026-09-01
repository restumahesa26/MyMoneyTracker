"use client";

import React, { useMemo } from "react";
import { Debt } from "@/types";
import { formatIDR } from "@/lib/formatters";
import {
  HandCoins,
  PiggyBank,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { parseISO, differenceInCalendarDays, startOfDay } from "date-fns";

interface DebtOverviewCardsProps {
  debts: Debt[];
}

export const DebtOverviewCards: React.FC<DebtOverviewCardsProps> = ({ debts }) => {
  const metrics = useMemo(() => {
    const today = startOfDay(new Date());

    let totalDebtRemaining = 0;
    let totalDebtOriginal = 0;
    let totalDebtPaid = 0;

    let totalReceivableRemaining = 0;
    let totalReceivableOriginal = 0;

    let dueSoonCount = 0;
    let overdueCount = 0;
    let paidCount = 0;

    debts.forEach((debt) => {
      const isPaid = debt.status === "PAID" || debt.remainingAmount <= 0;
      if (isPaid) {
        paidCount++;
      }

      if (debt.type === "DEBT") {
        totalDebtRemaining += debt.remainingAmount;
        totalDebtOriginal += debt.originalAmount;
        totalDebtPaid += debt.paidAmount || (debt.originalAmount - debt.remainingAmount);
      } else {
        totalReceivableRemaining += debt.remainingAmount;
        totalReceivableOriginal += debt.originalAmount;
      }

      if (!isPaid && debt.dueDate) {
        try {
          const dueDate = startOfDay(parseISO(debt.dueDate));
          const diffDays = differenceInCalendarDays(dueDate, today);
          if (diffDays < 0) {
            overdueCount++;
          } else if (diffDays <= 7) {
            dueSoonCount++;
          }
        } catch (e) {
          // ignore date parse error
        }
      }
    });

    const debtPayoffProgress =
      totalDebtOriginal > 0
        ? Math.round((totalDebtPaid / totalDebtOriginal) * 100)
        : 0;

    return {
      totalDebtRemaining,
      totalDebtOriginal,
      totalDebtPaid,
      debtPayoffProgress,
      totalReceivableRemaining,
      dueSoonCount,
      overdueCount,
      paidCount,
      totalCount: debts.length,
    };
  }, [debts]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Sisa Hutang Saya */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Sisa Hutang Saya
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {formatIDR(metrics.totalDebtRemaining)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>Pokok: {formatIDR(metrics.totalDebtOriginal)}</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {metrics.debtPayoffProgress}% Terbayar
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, metrics.debtPayoffProgress)}%` }}
          />
        </div>
      </div>

      {/* 2. Total Piutang (Uang Dipinjam Orang) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Piutang (Dipinjam Orang)
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatIDR(metrics.totalReceivableRemaining)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            Uang Anda yang belum dikembalikan
          </p>
        </div>
      </div>

      {/* 3. Jatuh Tempo & Pengingat */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Peringatan Jatuh Tempo
          </span>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              metrics.overdueCount > 0
                ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 animate-pulse"
                : metrics.dueSoonCount > 0
                ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}
          >
            <CalendarClock className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {metrics.overdueCount + metrics.dueSoonCount}
            </p>
            <span className="text-xs text-slate-500">perlu perhatian</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            {metrics.overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-3 h-3" />
                {metrics.overdueCount} Terlewat
              </span>
            )}
            {metrics.dueSoonCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                {metrics.dueSoonCount} H-7 Hari
              </span>
            )}
            {metrics.overdueCount === 0 && metrics.dueSoonCount === 0 && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Semua aman terkendali
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Total Status Lunas */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Hutang Berhasil Dilunasi
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            {metrics.paidCount}{" "}
            <span className="text-sm font-semibold text-slate-500">
              / {metrics.totalCount} catatan
            </span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            Total tercicil: {formatIDR(metrics.totalDebtPaid)}
          </p>
        </div>
      </div>
    </div>
  );
};
