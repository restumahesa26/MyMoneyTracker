"use client";

import React, { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { formatIDR, formatCompactIDR } from "@/lib/formatters";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Flame,
  Award,
  Zap,
} from "lucide-react";

export const FinancialInsights: React.FC = () => {
  const { metrics, filteredTransactions } = useFinance();

  const insights = useMemo(() => {
    // 1. Savings Ratio Rating
    const savingsRatio = metrics.savingsRate;
    let healthStatus = "Prima & Sehat";
    let healthColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800";
    let healthDesc = "Anda menabung lebih dari 20% dari total pemasukan. Pertahankan!";

    if (savingsRatio < 0) {
      healthStatus = "Defisit Keuangan";
      healthColor = "text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800";
      healthDesc = "Pengeluaran melebihi pemasukan pada periode ini. Kurangi pos pengeluaran non-primer.";
    } else if (savingsRatio < 15) {
      healthStatus = "Perlu Perhatian";
      healthColor = "text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800";
      healthDesc = "Rasio tabungan di bawah standar 20%. Cobalah menekan pengeluaran hiburan & belanja.";
    }

    // 2. Cash Runway (Days total balance can support daily burn rate)
    const dailyBurn = metrics.dailyBurnRate;
    const runwayDays = dailyBurn > 0 ? Math.floor(metrics.totalBalance / dailyBurn) : 999;
    const runwayMonths = (runwayDays / 30).toFixed(1);

    // 3. Highest Single Expense in period
    const expenses = filteredTransactions.filter((tx) => tx.type === "EXPENSE");
    const highestExpense = expenses.length > 0
      ? expenses.reduce((max, tx) => (tx.amount > max.amount ? tx : max), expenses[0])
      : null;

    return {
      healthStatus,
      healthColor,
      healthDesc,
      runwayDays,
      runwayMonths,
      highestExpense,
    };
  }, [metrics, filteredTransactions]);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-[#0b0f17] text-white p-6 sm:p-7 shadow-xl border border-indigo-900/50 relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Financial Health & Smart Insights</span>
            </h3>
            <p className="text-xs text-slate-400">
              Analisis cerdas kondisi keuangan pribadi Anda
            </p>
          </div>
        </div>

        {/* Health Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${insights.healthColor}`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Status: {insights.healthStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Health Advice */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-2">
            <Award className="w-4 h-4" />
            <span>Kesehatan Tabungan</span>
          </div>
          <div className="text-2xl font-black text-white mb-1">
            {metrics.savingsRate.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {insights.healthDesc}
          </p>
        </div>

        {/* Card 2: Cash Runway */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold mb-2">
            <Clock className="w-4 h-4" />
            <span>Estimasi Cash Runway</span>
          </div>
          <div className="text-2xl font-black text-white mb-1">
            {insights.runwayDays > 365 ? "> 12 Bulan" : `${insights.runwayMonths} Bulan`}
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Saldo Anda dapat bertahan selama ~{insights.runwayDays} hari dengan rata-rata burn rate saat ini.
          </p>
        </div>

        {/* Card 3: Largest Expense */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-bold mb-2">
            <Zap className="w-4 h-4" />
            <span>Pengeluaran Terbesar</span>
          </div>
          {insights.highestExpense ? (
            <div>
              <div className="text-xl font-black text-rose-400 mb-0.5 truncate">
                {formatIDR(insights.highestExpense.amount)}
              </div>
              <p className="text-[11px] text-slate-200 font-medium truncate">
                {insights.highestExpense.description}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Kategori: {insights.highestExpense.categoryName}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2">Belum ada pengeluaran</p>
          )}
        </div>
      </div>
    </div>
  );
};
