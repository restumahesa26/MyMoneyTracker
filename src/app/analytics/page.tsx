"use client";

import React from "react";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { CashflowChart } from "@/components/analytics/CashflowChart";
import { CategoryBreakdownChart } from "@/components/analytics/CategoryBreakdownChart";
import { DayOfWeekChart } from "@/components/analytics/DayOfWeekChart";
import { BudgetProgressList } from "@/components/analytics/BudgetProgressList";
import { FinancialInsights } from "@/components/analytics/FinancialInsights";
import { BarChart3, TrendingUp, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Analisis Keuangan Mendalam
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Eksplorasi tren arus kas, perilaku belanja, dan realisasi target anggaran
          </p>
        </div>

        <DateRangeFilter />
      </div>

      {/* Financial Health Insights */}
      <FinancialInsights />

      {/* Top Charts Grid: Cashflow + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashflowChart />
        <CategoryBreakdownChart />
      </div>

      {/* Bottom Charts Grid: Day of Week Pattern + Budget vs Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DayOfWeekChart />
        <BudgetProgressList />
      </div>
    </div>
  );
}
