"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useFinance } from "@/context/FinanceContext";
import { formatIDR } from "@/lib/formatters";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import {
  CalendarClock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
} from "lucide-react";
import { format } from "date-fns";

export const DashboardBillsWidget: React.FC = () => {
  const { bills, isBalanceHidden } = useFinance();
  const currentPeriod = format(new Date(), "yyyy-MM");
  const todayDay = new Date().getDate();

  const metrics = useMemo(() => {
    let totalCommitment = 0;
    let totalPaid = 0;
    let paidCount = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;

    bills.forEach((b) => {
      totalCommitment += b.amount || 0;
      const isPaid = b.lastPaidPeriod === currentPeriod;

      if (isPaid) {
        totalPaid += b.amount || 0;
        paidCount++;
      } else {
        const diff = b.dueDay - todayDay;
        if (diff < 0) {
          overdueCount++;
        } else if (diff <= (b.reminderDaysBefore || 3)) {
          dueSoonCount++;
        }
      }
    });

    const remainingAmount = Math.max(0, totalCommitment - totalPaid);
    const paidPercentage =
      totalCommitment > 0 ? Math.round((totalPaid / totalCommitment) * 100) : 0;

    // Sort bills: unpaid first, then by closest due date
    const sortedBills = [...bills].sort((a, b) => {
      const aPaid = a.lastPaidPeriod === currentPeriod;
      const bPaid = b.lastPaidPeriod === currentPeriod;
      if (aPaid !== bPaid) return aPaid ? 1 : -1;
      return a.dueDay - b.dueDay;
    });

    return {
      totalCommitment,
      totalPaid,
      remainingAmount,
      paidPercentage,
      paidCount,
      overdueCount,
      dueSoonCount,
      totalCount: bills.length,
      displayBills: sortedBills.slice(0, 4),
    };
  }, [bills, currentPeriod, todayDay]);

  if (bills.length === 0) {
    return (
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Lacak Pengeluaran & Tagihan Rutin Bulanan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pantau sewa kos, wifi, kartu halo, dan langganan bulanan Anda agar tidak ada yang terlewat jatuh tempo.
            </p>
          </div>
        </div>
        <Link
          href="/bills"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Atur Tagihan Bulanan</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Tagihan Rutin Bulan Ini</span>
              {metrics.overdueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                  {metrics.overdueCount} Terlewat
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {metrics.paidCount} dari {metrics.totalCount} pengeluaran rutin sudah dibayar ({metrics.paidPercentage}%)
            </p>
          </div>
        </div>

        <Link
          href="/bills"
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <span>Kelola Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mini Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Sudah Terbayar: <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(metrics.totalPaid, isBalanceHidden)}</strong>
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Sisa Tanggungan: <strong className="text-amber-600 dark:text-amber-400">{formatIDR(metrics.remainingAmount, isBalanceHidden)}</strong>
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, metrics.paidPercentage)}%` }}
          />
        </div>
      </div>

      {/* 4 Highlight Bills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {metrics.displayBills.map((bill) => {
          const isPaid = bill.lastPaidPeriod === currentPeriod;
          const diffDays = bill.dueDay - todayDay;
          const isOverdue = !isPaid && diffDays < 0;
          const isDueSoon = !isPaid && diffDays >= 0 && diffDays <= (bill.reminderDaysBefore || 3);

          return (
            <Link
              key={bill.id}
              href="/bills"
              className={`p-3.5 rounded-2xl border transition-all hover:scale-[1.02] flex flex-col justify-between ${
                isPaid
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40"
                  : isOverdue
                  ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                  : isDueSoon
                  ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                  : "bg-slate-50/60 dark:bg-slate-850/60 border-slate-200/60 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: bill.color || "#6366F1" }}
                >
                  <DynamicIcon name={bill.icon || "Receipt"} className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {bill.name}
                  </h5>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Tgl {bill.dueDay} / bln
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                  {formatIDR(bill.amount, isBalanceHidden)}
                </span>
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Lunas</span>
                  </span>
                ) : isOverdue ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Terlewat</span>
                  </span>
                ) : isDueSoon ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <Clock className="w-3 h-3" />
                    <span>{diffDays === 0 ? "Hari Ini" : `${diffDays}h lagi`}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Belum Bayar</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
