"use client";

import React, { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { useAuth } from "@/context/AuthContext";
import { calculateFinancialHealthScore, analyze503020Rule, detectFinancialLeaksAndSpikes } from "@/lib/financialAdvisor";
import { formatIDR, formatCompactIDR } from "@/lib/formatters";
import {
  Printer,
  FileText,
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const ExecutiveAdvisoryReport: React.FC = () => {
  const { metrics, categories, filteredTransactions, accounts, dateFilter } = useFinance();
  const { user } = useAuth();

  const healthData = useMemo(() => {
    return calculateFinancialHealthScore(metrics, categories, filteredTransactions, accounts);
  }, [metrics, categories, filteredTransactions, accounts]);

  const ruleData = useMemo(() => {
    return analyze503020Rule(metrics, categories, filteredTransactions);
  }, [metrics, categories, filteredTransactions]);

  const leakData = useMemo(() => {
    return detectFinancialLeaksAndSpikes(filteredTransactions, categories, metrics);
  }, [filteredTransactions, categories, metrics]);

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Laporan Resmi Konsultasi Keuangan Pribadi</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dokumen analisis komprehensif yang siap dicetak atau disimpan sebagai PDF
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      {/* Official Printable Report Document Container */}
      <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl print:border-none print:shadow-none print:p-0 print:m-0 space-y-8">
        {/* Document Letterhead */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
                M
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  MY MONEY TRACKER
                </h1>
                <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Senior Wealth & Personal Finance Advisory
                </p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Dokumen: Executive Financial Advisory Report
            </p>
            <p className="text-slate-500">Tanggal Rilis: {currentDateFormatted}</p>
            <p className="text-slate-500">Periode Evaluasi: <span className="font-semibold text-slate-700 dark:text-slate-300">{dateFilter.label}</span></p>
          </div>
        </div>

        {/* Client Profile & Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Profil Klien & Likuiditas
            </h4>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama / Akun:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{user?.displayName || "Klien Utama"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{user?.email || "demo@mymoneytracker.app"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Saldo Kas Likuid:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{formatIDR(metrics.totalBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Dompet Aktif:</span>
                <span className="font-bold">{accounts.length} Akun</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Diagnosis Kesehatan Finansial
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-black text-indigo-950 dark:text-indigo-200">
                  {healthData.overallScore}
                  <span className="text-sm font-bold text-slate-400">/100</span>
                </span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Grade: {healthData.grade} ({healthData.gradeTitle})
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {healthData.grade}
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic">
              &ldquo;{healthData.summaryVerdict}&rdquo;
            </p>
          </div>
        </div>

        {/* Section 1: Financial Snapshot Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            1. Ringkasan Arus Kas (Cashflow Snapshot)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900">
                  <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Indikator</th>
                  <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Nilai Periode Ini</th>
                  <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Standar Acuan</th>
                  <th className="p-3 border border-slate-200 dark:border-slate-800 font-bold">Status Evaluasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold">Total Pemasukan (Inflow)</td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(metrics.totalIncome)}</td>
                  <td className="p-3 text-slate-500">-</td>
                  <td className="p-3 text-emerald-600 font-semibold">Aktif</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Total Pengeluaran (Outflow)</td>
                  <td className="p-3 font-bold text-rose-600 dark:text-rose-400">{formatIDR(metrics.totalExpense)}</td>
                  <td className="p-3 text-slate-500">&lt; 80% Pemasukan</td>
                  <td className="p-3 font-semibold">
                    {metrics.totalIncome > metrics.totalExpense ? "Surplus Terkendali" : "Defisit"}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Surplus Bersih (Net Savings)</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{formatIDR(metrics.netSavings)}</td>
                  <td className="p-3 text-slate-500">&gt; 20% Pemasukan</td>
                  <td className="p-3 font-semibold">
                    {metrics.savingsRate >= 20 ? "Sangat Sehat (≥20%)" : "Perlu Ditingkatkan"}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Rasio Tabungan (Savings Rate)</td>
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{metrics.savingsRate.toFixed(1)}%</td>
                  <td className="p-3 text-slate-500">Min. 20.0%</td>
                  <td className="p-3 font-semibold">
                    {metrics.savingsRate >= 20 ? "Memenuhi Target" : "Di Bawah Ambang"}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Ketahanan Dana Darurat (Runway)</td>
                  <td className="p-3 font-bold">
                    {healthData.pillars.runway.metricValue}
                  </td>
                  <td className="p-3 text-slate-500">3 – 6 Bulan</td>
                  <td className="p-3 font-semibold">
                    {healthData.pillars.runway.statusText}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: 50 / 30 / 20 Evaluation */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            2. Evaluasi Proporsi Rasio Emas 50 / 30 / 20
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 text-xs space-y-1">
              <span className="font-bold text-sky-800 dark:text-sky-300">Kebutuhan (Needs)</span>
              <p className="text-base font-black">{formatIDR(ruleData.buckets.needs.actualAmount)}</p>
              <p className="text-[11px] text-slate-500">
                Aktual: <b>{ruleData.buckets.needs.actualPercent.toFixed(1)}%</b> (Ideal &le; 50%)
              </p>
            </div>

            <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 text-xs space-y-1">
              <span className="font-bold text-purple-800 dark:text-purple-300">Keinginan (Wants)</span>
              <p className="text-base font-black">{formatIDR(ruleData.buckets.wants.actualAmount)}</p>
              <p className="text-[11px] text-slate-500">
                Aktual: <b>{ruleData.buckets.wants.actualPercent.toFixed(1)}%</b> (Ideal &le; 30%)
              </p>
            </div>

            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">Tabungan (Savings)</span>
              <p className="text-base font-black">{formatIDR(ruleData.buckets.savings.actualAmount)}</p>
              <p className="text-[11px] text-slate-500">
                Aktual: <b>{ruleData.buckets.savings.actualPercent.toFixed(1)}%</b> (Ideal &ge; 20%)
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Senior Consultant 5 Action Directives */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            3. Rekomendasi Strategis Konsultan Keuangan (Strategic Directives)
          </h3>
          <div className="space-y-2.5">
            {healthData.priorityActions.map((act, idx) => (
              <div
                key={act.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs"
              >
                <div className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{act.title}</p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Signature Footer */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              My Money Tracker Financial Intelligence Engine
            </p>
            <p>Dianalisis secara otomatis berdasarkan standar Chartered Financial Analyst (CFA) &amp; CFP.</p>
          </div>

          <div className="text-center sm:text-right">
            <div className="w-36 border-b border-slate-400 mb-1 mx-auto sm:ml-auto" />
            <p className="font-bold text-slate-800 dark:text-slate-200">Senior Financial Consultant</p>
            <p className="text-[10px] text-slate-400">Verified Advisory Document</p>
          </div>
        </div>
      </div>
    </div>
  );
};
