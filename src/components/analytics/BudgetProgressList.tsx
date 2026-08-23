"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useFinance } from "@/context/FinanceContext";
import { formatIDR, formatCompactIDR } from "@/lib/formatters";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Target, AlertTriangle, CheckCircle2, AlertOctagon } from "lucide-react";

export const BudgetProgressList: React.FC = () => {
  const { categories, filteredTransactions } = useFinance();

  const budgetStats = useMemo(() => {
    // Only expense categories with a budgetLimit
    const budgetedCategories = categories.filter(
      (c) => c.type === "EXPENSE" && c.budgetLimit && c.budgetLimit > 0
    );

    // Calculate actual spending per category in current filtered period
    const spentMap: Record<string, number> = {};
    filteredTransactions
      .filter((tx) => tx.type === "EXPENSE")
      .forEach((tx) => {
        spentMap[tx.categoryId] = (spentMap[tx.categoryId] || 0) + tx.amount;
      });

    return budgetedCategories.map((cat) => {
      const budget = cat.budgetLimit || 0;
      const spent = spentMap[cat.id] || 0;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
      const remaining = budget - spent;

      let status: "SAFE" | "WARNING" | "DANGER" = "SAFE";
      if (percentage > 100) status = "DANGER";
      else if (percentage >= 80) status = "WARNING";

      return {
        ...cat,
        spent,
        budget,
        percentage,
        remaining,
        status,
      };
    });
  }, [categories, filteredTransactions]);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            <span>Realisasi Anggaran (Budget vs Actual)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitoring batas pengeluaran per kategori
          </p>
        </div>
        <Link
          href="/categories"
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Kelola Budget &rarr;
        </Link>
      </div>

      {budgetStats.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Belum ada batas budget yang diatur. Silakan atur budget di menu Kategori.
        </div>
      ) : (
        <div className="space-y-4">
          {budgetStats.map((item) => {
            const isDanger = item.status === "DANGER";
            const isWarning = item.status === "WARNING";

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${item.color}20`,
                        color: item.color,
                      }}
                    >
                      <DynamicIcon name={item.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Budget: {formatIDR(item.budget)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 font-bold">
                      {isDanger ? (
                        <span className="text-rose-500 flex items-center gap-1 text-[11px]">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          Overbudget (+{formatCompactIDR(Math.abs(item.remaining))})
                        </span>
                      ) : isWarning ? (
                        <span className="text-amber-500 flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Waspada (Sisa {formatCompactIDR(item.remaining)})
                        </span>
                      ) : (
                        <span className="text-emerald-500 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aman (Sisa {formatCompactIDR(item.remaining)})
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Terpakai: <span className="font-semibold">{formatIDR(item.spent)}</span> ({item.percentage.toFixed(0)}%)
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDanger
                        ? "bg-rose-500"
                        : isWarning
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
