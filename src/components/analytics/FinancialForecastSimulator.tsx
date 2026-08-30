"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { calculateFutureProjections, ForecastPoint } from "@/lib/financialAdvisor";
import { formatIDR, formatCompactIDR } from "@/lib/formatters";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Sparkles,
  Sliders,
  DollarSign,
  Award,
  Zap,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export const FinancialForecastSimulator: React.FC = () => {
  const { metrics } = useFinance();

  // Baseline figures (monthly)
  const currentBalance = metrics.totalBalance;
  // If period is not monthly, estimate average monthly income & expense
  const monthlyIncome = metrics.totalIncome > 0 ? metrics.totalIncome : 10000000;
  const monthlyExpense = metrics.totalExpense > 0 ? metrics.totalExpense : 7000000;

  // Simulator controls
  const [expenseCut, setExpenseCut] = useState<number>(10); // % cut
  const [incomeBoost, setIncomeBoost] = useState<number>(5); // % boost
  const [investmentYield, setInvestmentYield] = useState<number>(7); // % p.a.

  const projection = useMemo(() => {
    return calculateFutureProjections(
      currentBalance,
      monthlyIncome,
      monthlyExpense,
      expenseCut,
      incomeBoost,
      investmentYield / 100
    );
  }, [currentBalance, monthlyIncome, monthlyExpense, expenseCut, incomeBoost, investmentYield]);

  const { points, summary1Year, summary3Year, summary5Year } = projection;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const base = payload.find((p: any) => p.dataKey === "baselineBalance")?.value || 0;
      const opt = payload.find((p: any) => p.dataKey === "optimizedBalance")?.value || 0;
      const comp = payload.find((p: any) => p.dataKey === "investedCompoundedBalance")?.value || 0;

      return (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xl text-xs space-y-1.5 min-w-[210px]">
          <p className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1">
            Proyeksi {label}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Status Quo (Baseline):</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{formatIDR(base)}</span>
            </div>
            <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-semibold">
              <span>Dengan Optimasi:</span>
              <span>{formatIDR(opt)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>+ Investasi ({investmentYield}% p.a.):</span>
              <span>{formatIDR(comp)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header & Overview */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-[#070b14] text-white p-6 sm:p-7 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Simulator Masa Depan & Akumulasi Kekayaan
              </h3>
              <p className="text-xs text-slate-300">
                Uji skenario &ldquo;What-If&rdquo; untuk melihat dampak pemangkasan pengeluaran & investasi majemuk
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Controls & Future Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Card (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-5">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-sm font-bold pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>Pengaturan Parameter Skenario</span>
          </div>

          {/* Slider 1: Expense Reduction */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Efisiensi Pengeluaran
              </span>
              <span className="font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg">
                Hemat -{expenseCut}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="5"
              value={expenseCut}
              onChange={(e) => setExpenseCut(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Potensi hemat: ~{formatCompactIDR(monthlyExpense * (expenseCut / 100))}/bulan
            </p>
          </div>

          {/* Slider 2: Income Boost */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Kenaikan Pemasukan / Side Income
              </span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg">
                +{incomeBoost}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={incomeBoost}
              onChange={(e) => setIncomeBoost(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Tambahan kas: ~{formatCompactIDR(monthlyIncome * (incomeBoost / 100))}/bulan
            </p>
          </div>

          {/* Slider 3: Investment Yield Assumption */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Imbal Hasil Investasi (Return p.a.)
              </span>
              <span className="font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg">
                {investmentYield}% / thn
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="15"
              step="1"
              value={investmentYield}
              onChange={(e) => setInvestmentYield(Number(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Asumsi imbal hasil majemuk (SBN / Reksadana / Saham)
            </p>
          </div>

          {/* Consultant Quick Advice */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 text-[11px] text-indigo-900 dark:text-indigo-200 font-medium">
            💡 Menghemat 10% belanja dan menginvestasikannya secara disiplin memberikan efek eksponensial dalam 3–5 tahun ke depan!
          </div>
        </div>

        {/* Forecast Trajectory Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Proyeksi Pertumbuhan Saldo 12 Bulan
                </h4>
                <p className="text-[11px] text-slate-400">
                  Perbandingan Status Quo vs Skenario Optimasi
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-500">Baseline</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-600 font-bold">Invested</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="compGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="monthLabel"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCompactIDR(v)}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="baselineBalance"
                    name="Baseline"
                    stroke="#94A3B8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#baseGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="investedCompoundedBalance"
                    name="Investasi Majemuk"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#compGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Year Impact Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1 Year Horizon */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Horizon 1 Tahun (12 Bulan)
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">
            {formatIDR(summary1Year.optimized)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{formatCompactIDR(summary1Year.delta)} lebih kaya</span>
          </div>
          <p className="text-[11px] text-slate-400">
            vs status quo {formatCompactIDR(summary1Year.baseline)}
          </p>
        </div>

        {/* 3 Years Horizon */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-2">
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">
            Horizon 3 Tahun (36 Bulan)
          </span>
          <div className="text-xl font-black text-indigo-950 dark:text-indigo-200">
            {formatIDR(summary3Year.optimized)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{formatCompactIDR(summary3Year.delta)} akumulasi ekstra</span>
          </div>
          <p className="text-[11px] text-slate-400">
            vs status quo {formatCompactIDR(summary3Year.baseline)}
          </p>
        </div>

        {/* 5 Years Horizon */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-card space-y-2">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Horizon 5 Tahun (60 Bulan)
          </span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-300">
            {formatIDR(summary5Year.optimized)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>+{formatCompactIDR(summary5Year.delta)} lompatan finansial</span>
          </div>
          <p className="text-[11px] text-slate-400">
            vs status quo {formatCompactIDR(summary5Year.baseline)}
          </p>
        </div>
      </div>
    </div>
  );
};
