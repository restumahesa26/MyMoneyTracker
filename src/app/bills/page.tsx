"use client";

import React from "react";
import { useFinance } from "@/context/FinanceContext";
import { BillOverviewCards } from "@/components/bills/BillOverviewCards";
import { BillCardList } from "@/components/bills/BillCardList";
import { CalendarClock, ShieldCheck } from "lucide-react";

export default function BillsPage() {
  const { bills } = useFinance();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Tagihan Rutin & Bulanan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola kewajiban bulanan Anda seperti sewa kos, wifi rumah, pascabayar kartu halo, listrik, dan langganan lainnya.
          </p>
        </div>
      </div>

      {/* Top Overview Scorecard Metrics */}
      <BillOverviewCards bills={bills} />

      {/* Main List of Bills, Filters, and Month Selector */}
      <BillCardList />
    </div>
  );
}
