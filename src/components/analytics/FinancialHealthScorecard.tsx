"use client";

import React, { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { calculateFinancialHealthScore, FinancialHealthAnalysis } from "@/lib/financialAdvisor";
import { formatIDR, formatCompactIDR } from "@/lib/formatters";
import {
  Sparkles,
  ShieldCheck,
  Award,
  Clock,
  Target,
  TrendingUp,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  UserCheck,
  Zap,
} from "lucide-react";

export const FinancialHealthScorecard: React.FC = () => {
  const { metrics, categories, filteredTransactions, accounts } = useFinance();

  const healthData: FinancialHealthAnalysis = useMemo(() => {
    return calculateFinancialHealthScore(metrics, categories, filteredTransactions, accounts);
  }, [metrics, categories, filteredTransactions, accounts]);

  const { overallScore, grade, gradeTitle, summaryVerdict, pillars, priorityActions, strengths, weaknesses } = healthData;

  // Grade color scheme
  const gradeStyles = {
    "A+": "from-emerald-500 to-teal-600 text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
    "A": "from-teal-500 to-emerald-600 text-teal-300 border-teal-500/40 bg-teal-500/10",
    "B": "from-indigo-500 to-blue-600 text-indigo-300 border-indigo-500/40 bg-indigo-500/10",
    "C": "from-amber-500 to-orange-600 text-amber-300 border-amber-500/40 bg-amber-500/10",
    "D": "from-rose-500 to-red-600 text-rose-300 border-rose-500/40 bg-rose-500/10",
  }[grade];

  return (
    <div className="space-y-6">
      {/* 1. Main Executive Advisor Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-[#070b14] text-white p-6 sm:p-8 shadow-2xl border border-indigo-800/40 relative overflow-hidden">
        {/* Glow Ambient Lights */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header Tag */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-indigo-900/50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30 shadow-inner">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-black text-indigo-400">
                    Senior Financial Advisor Diagnostic
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    CFP Matrix
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                  Skor & Diagnosa Kesehatan Finansial
                </h2>
              </div>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Peringkat Kesehatan</p>
                <p className="text-xs font-semibold text-slate-200">{gradeTitle}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black border ${gradeStyles}`}>
                {grade}
              </div>
            </div>
          </div>

          {/* Centerpiece: Score Meter + Consultant Verdict */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
            {/* Score Ring / Numerical Display (4 cols) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center backdrop-blur-md">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                Indeks Kesehatan Finansial
              </span>
              <div className="relative flex items-center justify-center my-2">
                <div className="text-5xl sm:text-6xl font-black tracking-tight text-white number-glow">
                  {overallScore}
                </div>
                <span className="text-lg font-bold text-slate-400 ml-1">/100</span>
              </div>

              {/* Score Bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden my-3 border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${overallScore}%` }}
                />
              </div>

              <p className="text-xs text-slate-300 font-medium">
                {overallScore >= 80
                  ? "Kondisi sangat prima & tangguh terhadap risiko"
                  : overallScore >= 60
                  ? "Stabil, namun memiliki ruang optimasi arus kas"
                  : "Memerlukan pembenahan & disiplin anggaran segera"}
              </p>
            </div>

            {/* Consultant Commentary Box (8 cols) */}
            <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-indigo-900/25 border border-indigo-500/20 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Catatan Diagnosa Konsultan Keuangan</span>
              </div>
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                &ldquo;{summaryVerdict}&rdquo;
              </p>

              {/* Strengths & Weaknesses Quick Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Kekuatan Utama
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {strengths.length > 0 ? (
                      strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{s}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400">Belum ada data kekuatan signifikan.</li>
                    )}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Titik Perhatian
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {weaknesses.length > 0 ? (
                      weaknesses.map((w, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{w}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400">Tidak ada titik kelemahan kritis terdeteksi.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Five Pillars Breakdown Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-500" />
            <span>Evaluasi 5 Pilar Kesehatan Finansial</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Tolok Ukur Standar Certified Financial Planner (CFP)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pillar 1: Savings Rate */}
          <PillarCard
            icon={<Award className="w-4 h-4 text-indigo-500" />}
            title={pillars.savings.name}
            score={pillars.savings.score}
            grade={pillars.savings.grade}
            statusText={pillars.savings.statusText}
            metricValue={pillars.savings.metricValue}
            advice={pillars.savings.advice}
          />

          {/* Pillar 2: Emergency Runway */}
          <PillarCard
            icon={<Clock className="w-4 h-4 text-teal-500" />}
            title={pillars.runway.name}
            score={pillars.runway.score}
            grade={pillars.runway.grade}
            statusText={pillars.runway.statusText}
            metricValue={pillars.runway.metricValue}
            advice={pillars.runway.advice}
          />

          {/* Pillar 3: Budget Discipline */}
          <PillarCard
            icon={<Target className="w-4 h-4 text-purple-500" />}
            title={pillars.budget.name}
            score={pillars.budget.score}
            grade={pillars.budget.grade}
            statusText={pillars.budget.statusText}
            metricValue={pillars.budget.metricValue}
            advice={pillars.budget.advice}
          />

          {/* Pillar 4: Cashflow Momentum */}
          <PillarCard
            icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
            title={pillars.growth.name}
            score={pillars.growth.score}
            grade={pillars.growth.grade}
            statusText={pillars.growth.statusText}
            metricValue={pillars.growth.metricValue}
            advice={pillars.growth.advice}
          />

          {/* Pillar 5: Expense Diversification */}
          <PillarCard
            icon={<PieChart className="w-4 h-4 text-amber-500" />}
            title={pillars.diversification.name}
            score={pillars.diversification.score}
            grade={pillars.diversification.grade}
            statusText={pillars.diversification.statusText}
            metricValue={pillars.diversification.metricValue}
            advice={pillars.diversification.advice}
          />

          {/* Quick Metrics Snapshot */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Burn Rate & Likuiditas</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Rata-rata Burn Harian:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatIDR(metrics.dailyBurnRate)}/hari
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Estimasi Belanja Bulanan:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatIDR(metrics.dailyBurnRate * 30)}/bulan
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Saldo Likuid:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatIDR(metrics.totalBalance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-400 font-medium">
              💡 Saldo kas memadai adalah kunci fleksibilitas mengambil peluang investasi.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Priority Action Steps from Senior Consultant */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>3 Rencana Aksi Prioritas Bulan Ini</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Langkah strategis yang dirumuskan khusus berdasarkan data finansial riil Anda
            </p>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
            Actionable Roadmap
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorityActions.map((action, idx) => (
            <div
              key={action.id}
              className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-850/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      action.impact === "Kritis"
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-200 dark:border-rose-800"
                        : action.impact === "Tinggi"
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 border-amber-200 dark:border-amber-800"
                        : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border-indigo-200 dark:border-indigo-800"
                    }`}
                  >
                    Prioritas {action.impact}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface PillarCardProps {
  icon: React.ReactNode;
  title: string;
  score: number;
  grade: "Sangat Baik" | "Baik" | "Perlu Perhatian" | "Kritis";
  statusText: string;
  metricValue: string;
  advice: string;
}

const PillarCard: React.FC<PillarCardProps> = ({
  icon,
  title,
  score,
  grade,
  statusText,
  metricValue,
  advice,
}) => {
  const badgeColor = {
    "Sangat Baik": "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800",
    "Baik": "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800",
    "Perlu Perhatian": "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800",
    "Kritis": "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800",
  }[grade];

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 text-xs font-bold">
            {icon}
            <span>{title}</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {grade}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-2 mb-1">
          <span className="text-xl font-black text-slate-900 dark:text-slate-100">
            {metricValue}
          </span>
          <span className="text-xs font-bold text-slate-400">{score}/100</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-indigo-500" : score >= 40 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {advice}
        </p>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-medium text-slate-400 flex items-center justify-between">
        <span>Status:</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">{statusText}</span>
      </div>
    </div>
  );
};
