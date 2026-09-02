"use client";

import React, { useMemo } from "react";
import { RecurringBill } from "@/types";
import { formatIDR } from "@/lib/formatters";
import { useFinance } from "@/context/FinanceContext";
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Clock,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

interface BillOverviewCardsProps {
  bills: RecurringBill[];
  activePeriod?: string; // "YYYY-MM"
}

export const BillOverviewCards: React.FC<BillOverviewCardsProps> = ({
  bills,
  activePeriod,
}) => {
  const { isBalanceHidden } = useFinance();
  const currentPeriod = activePeriod || format(new Date(), "yyyy-MM");
  const todayDay = new Date().getDate();

  const metrics = useMemo(() => {
    let totalCommitment = 0;
    let totalPaid = 0;
    let paidCount = 0;
    let dueSoonCount = 0;
    let overdueCount = 0;

    bills.forEach((bill) => {
      totalCommitment += bill.amount || 0;
      const isPaid = bill.lastPaidPeriod === currentPeriod;

      if (isPaid) {
        totalPaid += bill.amount || 0;
        paidCount++;
      } else {
        const dueDay = bill.dueDay || 1;
        const diffDays = dueDay - todayDay;

        if (diffDays < 0) {
          overdueCount++;
        } else if (diffDays <= (bill.reminderDaysBefore || 3)) {
          dueSoonCount++;
        }
      }
    });

    const remainingAmount = Math.max(0, totalCommitment - totalPaid);
    const paidPercentage =
      totalCommitment > 0 ? Math.round((totalPaid / totalCommitment) * 100) : 0;

    return {
      totalCommitment,
      totalPaid,
      remainingAmount,
      paidPercentage,
      paidCount,
      dueSoonCount,
      overdueCount,
      totalCount: bills.length,
    };
  }, [bills, currentPeriod, todayDay]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Komitmen Tagihan Bulan Ini */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Tagihan Bulan Ini
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {formatIDR(metrics.totalCommitment, isBalanceHidden)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>{metrics.totalCount} pengeluaran rutin</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              Periode {currentPeriod}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sudah Dibayar Bulan Ini */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Sudah Dibayar Bulan Ini
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatIDR(metrics.totalPaid, isBalanceHidden)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>
              {metrics.paidCount} dari {metrics.totalCount} lunas
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {metrics.paidPercentage}%
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, metrics.paidPercentage)}%` }}
          />
        </div>
      </div>

      {/* 3. Sisa Tanggungan Belum Dibayar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Sisa Tanggungan
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {formatIDR(metrics.remainingAmount, isBalanceHidden)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            {metrics.totalCount - metrics.paidCount} tagihan belum dibayar
          </p>
        </div>
      </div>

      {/* 4. Peringatan Jatuh Tempo */}
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
                <Clock className="w-3 h-3" />
                {metrics.dueSoonCount} Jatuh Tempo Dekat
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
    </div>
  );
};
