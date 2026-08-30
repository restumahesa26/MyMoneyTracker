"use client";

import React, { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { analyze503020Rule, Rule503020Analysis } from "@/lib/financialAdvisor";
import { formatIDR, formatCompactIDR } from "@/lib/formatters";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Scale,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  HelpCircle,
  Shield,
} from "lucide-react";

export const Rule503020Chart: React.FC = () => {
  const { metrics, categories, filteredTransactions } = useFinance();

  const ruleData: Rule503020Analysis = useMemo(() => {
    return analyze503020Rule(metrics, categories, filteredTransactions);
  }, [metrics, categories, filteredTransactions]);

  const { buckets, consultantVerdict, rebalanceRecommendations, totalIncome } = ruleData;

  const chartDonutData = [
    { name: "Kebutuhan (Needs)", value: buckets.needs.actualAmount, color: buckets.needs.color },
    { name: "Keinginan (Wants)", value: buckets.wants.actualAmount, color: buckets.wants.color },
    { name: "Tabungan (Savings)", value: buckets.savings.actualAmount, color: buckets.savings.color },
  ].filter((d) => d.value > 0);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Analisis Rasio Emas 50 / 30 / 20
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tolok ukur ideal: 50% Kebutuhan Pokok, 30% Gaya Hidup & Keinginan, 20% Tabungan/Investasi
          </p>
        </div>

        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          Baseline Income: {formatCompactIDR(totalIncome)}
        </span>
      </div>

      {/* Visual Comparison: Ideal (50/30/20) vs Actual */}
      <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/80">
        <div className="space-y-2">
          {/* Ideal Standard Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>Rasio Standar Ideal (50 / 30 / 20)</span>
              <span className="text-[11px]">50% Needs • 30% Wants • 20% Savings</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden">
              <div className="h-full bg-sky-500 transition-all" style={{ width: "50%" }} title="Needs 50%" />
              <div className="h-full bg-purple-500 transition-all" style={{ width: "30%" }} title="Wants 30%" />
              <div className="h-full bg-emerald-500 transition-all" style={{ width: "20%" }} title="Savings 20%" />
            </div>
          </div>

          {/* Actual User Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">
              <span>Realisasi Aktual Anda</span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                {buckets.needs.actualPercent.toFixed(0)}% Needs • {buckets.wants.actualPercent.toFixed(0)}% Wants • {buckets.savings.actualPercent.toFixed(0)}% Savings
              </span>
            </div>
            <div className="w-full h-4 rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden shadow-inner">
              <div
                className="h-full bg-sky-500 transition-all duration-700"
                style={{ width: `${Math.min(buckets.needs.actualPercent, 100)}%` }}
                title={`Kebutuhan: ${buckets.needs.actualPercent.toFixed(1)}%`}
              />
              <div
                className="h-full bg-purple-500 transition-all duration-700"
                style={{ width: `${Math.min(buckets.wants.actualPercent, 100)}%` }}
                title={`Keinginan: ${buckets.wants.actualPercent.toFixed(1)}%`}
              />
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${Math.min(buckets.savings.actualPercent, 100)}%` }}
                title={`Tabungan: ${buckets.savings.actualPercent.toFixed(1)}%`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Bucket Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Needs Bucket */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-950/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-500" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {buckets.needs.name}
              </h4>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                buckets.needs.actualPercent <= 50
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
              }`}
            >
              {buckets.needs.actualPercent <= 50 ? "Terkendali" : "Melebihi Target"}
            </span>
          </div>

          <div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">
              {formatIDR(buckets.needs.actualAmount)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>Porsi: <b className="text-sky-600 dark:text-sky-400">{buckets.needs.actualPercent.toFixed(1)}%</b></span>
              <span>Target: <b>50%</b> ({formatCompactIDR(buckets.needs.targetAmount)})</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Pos Kebutuhan Utama:
            </p>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {buckets.needs.categories.slice(0, 3).map((c) => (
                <div key={c.id} className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="truncate">{c.name}</span>
                  <span className="font-semibold">{formatCompactIDR(c.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Wants Bucket */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-950/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {buckets.wants.name}
              </h4>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                buckets.wants.actualPercent <= 30
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800"
              }`}
            >
              {buckets.wants.actualPercent <= 30 ? "Ideal" : "Lifestyle Creep"}
            </span>
          </div>

          <div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">
              {formatIDR(buckets.wants.actualAmount)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>Porsi: <b className="text-purple-600 dark:text-purple-400">{buckets.wants.actualPercent.toFixed(1)}%</b></span>
              <span>Target: <b>30%</b> ({formatCompactIDR(buckets.wants.targetAmount)})</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Pos Keinginan Terbesar:
            </p>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {buckets.wants.categories.slice(0, 3).map((c) => (
                <div key={c.id} className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="truncate">{c.name}</span>
                  <span className="font-semibold">{formatCompactIDR(c.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Savings Bucket */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {buckets.savings.name}
              </h4>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                buckets.savings.actualPercent >= 20
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
              }`}
            >
              {buckets.savings.actualPercent >= 20 ? "Luar Biasa" : "Di Bawah Target"}
            </span>
          </div>

          <div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatIDR(buckets.savings.actualAmount)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>Porsi: <b className="text-emerald-600 dark:text-emerald-400">{buckets.savings.actualPercent.toFixed(1)}%</b></span>
              <span>Target: <b>20%</b> ({formatCompactIDR(buckets.savings.targetAmount)})</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Status Akumulasi Tabungan:
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {buckets.savings.actualPercent >= 20
                ? "Sangat baik. Surplus kas siap dialokasikan ke instrumen investasi jangka panjang."
                : "Perlu pemangkasan pada pos keinginan untuk meningkatkan rasio tabungan ke 20%."}
            </p>
          </div>
        </div>
      </div>

      {/* Consultant Recommendation Box */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 space-y-2">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Rekomendasi Penyeimbangan (Rebalancing Strategy)</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          {consultantVerdict}
        </p>
        {rebalanceRecommendations.length > 0 && (
          <div className="pt-1 text-xs text-indigo-900 dark:text-indigo-200 font-semibold flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{rebalanceRecommendations[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
};
