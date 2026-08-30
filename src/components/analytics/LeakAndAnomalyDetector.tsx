"use client";

import React, { useMemo, useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { detectFinancialLeaksAndSpikes, LeakAndAnomalyReport } from "@/lib/financialAdvisor";
import { formatIDR, formatCompactIDR } from "@/lib/formatters";
import {
  AlertTriangle,
  Coffee,
  Calendar,
  Flame,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

export const LeakAndAnomalyDetector: React.FC = () => {
  const { filteredTransactions, categories, metrics } = useFinance();

  const report: LeakAndAnomalyReport = useMemo(() => {
    return detectFinancialLeaksAndSpikes(filteredTransactions, categories, metrics);
  }, [filteredTransactions, categories, metrics]);

  const { latteFactorItems, totalLatteSpend, latteAnnualizedImpact, weekendVsWeekday, topSingleExpenses, actionableSavingsPlaybook } = report;

  const [completedPlaybook, setCompletedPlaybook] = useState<Record<string, boolean>>({});

  const togglePlaybook = (title: string) => {
    setCompletedPlaybook((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const totalPotentialSave = actionableSavingsPlaybook.reduce(
    (acc, item) => acc + (completedPlaybook[item.title] ? item.potentialMonthlySave : 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Alert Banner */}
      <div className="rounded-3xl bg-amber-500/10 border border-amber-500/30 p-5 sm:p-6 text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">
              Deteksi Kebocoran Halus & Inefisiensi Belanja
            </h3>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
              Konsultan keuangan mendeteksi pos-pos pengeluaran mikro dan pola perilaku belanja yang sering luput dari perhatian.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Grid: The Latte Factor + Weekend vs Weekday Behavior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: The Latte Factor */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Efek &quot;The Latte Factor&quot; (Mikro-Pengeluaran)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Transaksi kecil (&le; Rp 100rb) yang berulang kali terjadi
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800">
              Kebocoran Halus
            </span>
          </div>

          {/* Metric Summary */}
          <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-800/50 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-orange-800 dark:text-orange-300 font-semibold">
                Total Jajan Mikro Periode Ini:
              </p>
              <p className="text-xl font-black text-orange-950 dark:text-orange-200">
                {formatIDR(totalLatteSpend)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-orange-700 dark:text-orange-400 font-semibold">
                Dampak Tahunan (Annualized):
              </p>
              <p className="text-sm font-black text-rose-600 dark:text-rose-400">
                ~{formatCompactIDR(latteAnnualizedImpact)}/tahun
              </p>
            </div>
          </div>

          {/* List of Recurring Micro Transactions */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Item Mikro Paling Sering:
            </p>
            {latteFactorItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Bagus! Tidak ditemukan pola transaksi mikro berulang yang signifikan pada periode ini.
              </p>
            ) : (
              latteFactorItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-[10px] font-black">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[150px] sm:max-w-[200px]">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.count}x transaksi • {item.categoryName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 dark:text-slate-100">
                      {formatIDR(item.totalAmount)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      rata-rata {formatCompactIDR(item.avgAmount)}/trx
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card B: Weekend vs Weekday Spending Behavior */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Pola Belanja: Hari Kerja vs Akhir Pekan
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Menganalisis lonjakan belanja impulsif saat libur (Sabtu & Minggu)
                  </p>
                </div>
              </div>
            </div>

            {/* Weekend vs Weekday Comparison Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Hari Kerja (Sen - Jum)</span>
                <p className="text-base font-black text-slate-800 dark:text-slate-100">
                  {formatIDR(weekendVsWeekday.weekdayTotal)}
                </p>
                <p className="text-[11px] text-slate-500">
                  ~{formatCompactIDR(weekendVsWeekday.weekdayAvgPerDay)}/hari
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-500">Akhir Pekan (Sab - Min)</span>
                <p className="text-base font-black text-indigo-950 dark:text-indigo-200">
                  {formatIDR(weekendVsWeekday.weekendTotal)}
                </p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  ~{formatCompactIDR(weekendVsWeekday.weekendAvgPerDay)}/hari
                </p>
              </div>
            </div>

            {/* Proportion Progress */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Porsi Belanja Akhir Pekan</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {weekendVsWeekday.weekendExpenseRatio.toFixed(1)}% dari Total Belanja
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    weekendVsWeekday.isWeekendHeavy ? "bg-rose-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${Math.min(weekendVsWeekday.weekendExpenseRatio, 100)}%` }}
                />
              </div>
            </div>

            {/* Behavioral Commentary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Insight Perilaku Belanja
              </span>
              <p className="text-[11px] leading-relaxed">
                {weekendVsWeekday.isWeekendHeavy
                  ? "Pengeluaran harian akhir pekan Anda ~1.4x lebih tinggi dibanding hari kerja. Rekomendasi: Tentukan anggaran hiburan khusus weekend untuk mencegah kebocoran saldo."
                  : "Pola belanja akhir pekan Anda relatif terkendali seimbang dengan pengeluaran hari kerja biasa."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Actionable Savings Playbook Checklist */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Playbook Taktik Penghematan (Interactive Checklist)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Centang langkah taktis yang siap Anda terapkan untuk melihat estimasi penghematan bulanan
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-right self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
              Potensi Hemat Terpilih:
            </span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-300">
              +{formatIDR(totalPotentialSave)}/bln
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {actionableSavingsPlaybook.map((tactic, idx) => {
            const isChecked = Boolean(completedPlaybook[tactic.title]);
            return (
              <div
                key={idx}
                onClick={() => togglePlaybook(tactic.title)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isChecked
                    ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700"
                    : "bg-slate-50/70 dark:bg-slate-850/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-lg mt-0.5 flex items-center justify-center shrink-0 border transition-all ${
                    isChecked
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className={`text-xs font-bold ${isChecked ? "text-emerald-900 dark:text-emerald-200" : "text-slate-800 dark:text-slate-200"}`}>
                      {tactic.title}
                    </h5>
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                      +{formatCompactIDR(tactic.potentialMonthlySave)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tactic.tip}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
