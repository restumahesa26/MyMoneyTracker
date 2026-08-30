"use client";

import React, { useState } from "react";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { FinancialHealthScorecard } from "@/components/analytics/FinancialHealthScorecard";
import { Rule503020Chart } from "@/components/analytics/Rule503020Chart";
import { LeakAndAnomalyDetector } from "@/components/analytics/LeakAndAnomalyDetector";
import { FinancialForecastSimulator } from "@/components/analytics/FinancialForecastSimulator";
import { ExecutiveAdvisoryReport } from "@/components/analytics/ExecutiveAdvisoryReport";
import { CashflowChart } from "@/components/analytics/CashflowChart";
import { CategoryBreakdownChart } from "@/components/analytics/CategoryBreakdownChart";
import { DayOfWeekChart } from "@/components/analytics/DayOfWeekChart";
import { BudgetProgressList } from "@/components/analytics/BudgetProgressList";
import { useFinance } from "@/context/FinanceContext";
import { formatIDR, formatCompactIDR } from "@/lib/formatters";
import {
  BarChart3,
  Award,
  Scale,
  Search,
  Sparkles,
  TrendingUp,
  FileText,
  ShieldCheck,
  Zap,
  DollarSign,
  PieChart,
} from "lucide-react";

type AnalyticsTab = "HEALTH_SCORE" | "RULE_503020" | "LEAKS_BUDGET" | "SIMULATOR" | "REPORT";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("HEALTH_SCORE");
  const { metrics, dateFilter } = useFinance();

  const tabs: Array<{ id: AnalyticsTab; label: string; icon: React.ReactNode; badge?: string }> = [
    {
      id: "HEALTH_SCORE",
      label: "Diagnosa & Skor Kesehatan",
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: "RULE_503020",
      label: "Rasio Emas 50 / 30 / 20",
      icon: <Scale className="w-4 h-4" />,
    },
    {
      id: "LEAKS_BUDGET",
      label: "Deteksi Kebocoran & Anggaran",
      icon: <Search className="w-4 h-4" />,
      badge: "Latte Factor",
    },
    {
      id: "SIMULATOR",
      label: "Proyeksi & Simulator Kekayaan",
      icon: <Sparkles className="w-4 h-4" />,
      badge: "What-If",
    },
    {
      id: "REPORT",
      label: "Laporan Resmi Konsultan",
      icon: <FileText className="w-4 h-4" />,
      badge: "Print/PDF",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header with Executive Advisor Tag & Date Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Wealth &amp; Cashflow Intelligence
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Senior Advisor Active
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                Konsultasi &amp; Analisis Keuangan Mendalam
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Laporan analitis profesional, evaluasi struktur belanja 50/30/20, pencegahan kebocoran halus, dan simulasi akumulasi kekayaan
          </p>
        </div>

        <div className="self-start lg:self-auto print:hidden">
          <DateRangeFilter />
        </div>
      </div>

      {/* 2. Quick Executive Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Pemasukan</span>
          <p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 truncate">
            {formatIDR(metrics.totalIncome)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Pengeluaran</span>
          <p className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 truncate">
            {formatIDR(metrics.totalExpense)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-[10px] uppercase font-bold text-slate-400">Surplus Bersih</span>
          <p className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 truncate">
            {formatIDR(metrics.netSavings)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-[10px] uppercase font-bold text-slate-400">Savings Rate</span>
          <p className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 truncate">
            {metrics.savingsRate.toFixed(1)}% <span className="text-xs font-normal text-slate-400">({metrics.savingsRate >= 20 ? "Ideal" : "Rendah"})</span>
          </p>
        </div>
      </div>

      {/* 3. Modern Interactive Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200/80 dark:border-slate-800 print:hidden">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content Area */}
      <div className="space-y-6">
        {/* TAB 1: Financial Health Score & Diagnosis */}
        {activeTab === "HEALTH_SCORE" && (
          <div className="space-y-6 animate-fade-in">
            <FinancialHealthScorecard />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CashflowChart />
              <CategoryBreakdownChart />
            </div>
          </div>
        )}

        {/* TAB 2: 50 / 30 / 20 Golden Ratio */}
        {activeTab === "RULE_503020" && (
          <div className="space-y-6 animate-fade-in">
            <Rule503020Chart />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CashflowChart />
              <CategoryBreakdownChart />
            </div>
          </div>
        )}

        {/* TAB 3: Leak Detection & Budget Discipline */}
        {activeTab === "LEAKS_BUDGET" && (
          <div className="space-y-6 animate-fade-in">
            <LeakAndAnomalyDetector />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DayOfWeekChart />
              <BudgetProgressList />
            </div>
          </div>
        )}

        {/* TAB 4: Future Forecast & Wealth Simulator */}
        {activeTab === "SIMULATOR" && (
          <div className="space-y-6 animate-fade-in">
            <FinancialForecastSimulator />
          </div>
        )}

        {/* TAB 5: Official Printable Consultant Report */}
        {activeTab === "REPORT" && (
          <div className="space-y-6 animate-fade-in">
            <ExecutiveAdvisoryReport />
          </div>
        )}
      </div>
    </div>
  );
}
