"use client";

import React from "react";
import { useFinance } from "@/context/FinanceContext";
import { formatIDR, formatCompactIDR } from "@/lib/formatters";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const Scorecards: React.FC = () => {
  const { metrics, dateFilter } = useFinance();

  const isIncomeUp = metrics.incomeGrowth >= 0;
  const isExpenseUp = metrics.expenseGrowth >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* 1. Total Saldo Bersih */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">
            Total Saldo Bersih
          </span>
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black tracking-tight mb-1">
            {formatIDR(metrics.totalBalance)}
          </div>
          <p className="text-[11px] text-indigo-200">
            Total aset di semua dompet & rekening
          </p>
        </div>
      </div>

      {/* 2. Total Pemasukan */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Pemasukan
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 mb-1">
            {formatIDR(metrics.totalIncome)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            {metrics.previousIncome > 0 ? (
              <span
                className={`inline-flex items-center font-bold ${
                  isIncomeUp ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {isIncomeUp ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {Math.abs(metrics.incomeGrowth).toFixed(1)}%
              </span>
            ) : (
              <span className="text-slate-400">Periode aktif</span>
            )}
            <span className="text-slate-400 dark:text-slate-500">vs periode lalu</span>
          </div>
        </div>
      </div>

      {/* 3. Total Pengeluaran */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Pengeluaran
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400 mb-1">
            {formatIDR(metrics.totalExpense)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            {metrics.previousExpense > 0 ? (
              <span
                className={`inline-flex items-center font-bold ${
                  isExpenseUp ? "text-rose-500" : "text-emerald-500"
                }`}
              >
                {isExpenseUp ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {Math.abs(metrics.expenseGrowth).toFixed(1)}%
              </span>
            ) : (
              <span className="text-slate-400">Periode aktif</span>
            )}
            <span className="text-slate-400 dark:text-slate-500">vs periode lalu</span>
          </div>
        </div>
      </div>

      {/* 4. Net Savings Rate */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Savings Rate
          </span>
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-violet-600 dark:text-violet-400 mb-1">
            {metrics.savingsRate.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Sisa: {formatCompactIDR(metrics.netSavings)}
          </p>
        </div>
      </div>

      {/* 5. Daily Burn Rate */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Daily Burn Rate
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400 mb-1">
            {formatCompactIDR(metrics.dailyBurnRate)}
            <span className="text-xs font-normal text-slate-400">/hari</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Rata-rata belanja harian
          </p>
        </div>
      </div>
    </div>
  );
};
