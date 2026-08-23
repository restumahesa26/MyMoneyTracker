"use client";

import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useFinance } from "@/context/FinanceContext";
import { formatIDR, formatCompactIDR } from "@/lib/formatters";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { PieChart as PieIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const DEFAULT_COLORS = [
  "#F43F5E",
  "#F97316",
  "#EAB308",
  "#10B981",
  "#06B6D4",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#64748B",
];

export const CategoryBreakdownChart: React.FC = () => {
  const { filteredTransactions } = useFinance();
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  const breakdownData = useMemo(() => {
    const categoryTotals: Record<
      string,
      { name: string; icon: string; color: string; total: number }
    > = {};

    let totalSum = 0;

    filteredTransactions
      .filter((tx) => tx.type === activeTab)
      .forEach((tx) => {
        const catKey = tx.categoryId || "other";
        const catName = tx.categoryName || "Lainnya";
        const catIcon = tx.categoryIcon || "CircleEllipsis";
        const catColor = tx.categoryColor || "#64748B";

        if (!categoryTotals[catKey]) {
          categoryTotals[catKey] = {
            name: catName,
            icon: catIcon,
            color: catColor,
            total: 0,
          };
        }
        categoryTotals[catKey].total += tx.amount;
        totalSum += tx.amount;
      });

    const list = Object.values(categoryTotals).map((item, idx) => ({
      name: item.name,
      icon: item.icon,
      value: item.total,
      percentage: totalSum > 0 ? (item.total / totalSum) * 100 : 0,
      color: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    }));

    // Sort descending by value
    list.sort((a, b) => b.value - a.value);

    return { list, totalSum };
  }, [filteredTransactions, activeTab]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-xl text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{data.name}</p>
          <p className="text-slate-600 dark:text-slate-300 font-semibold">{formatIDR(data.value)}</p>
          <p className="text-slate-400 text-[11px]">{data.percentage.toFixed(1)}% dari total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card flex flex-col justify-between">
      <div>
        {/* Header & Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-500" />
              <span>Distribusi Kategori</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Porsi alokasi dana per kategori
            </p>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("EXPENSE")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "EXPENSE"
                  ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Pengeluaran
            </button>
            <button
              onClick={() => setActiveTab("INCOME")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "INCOME"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Pemasukan
            </button>
          </div>
        </div>

        {/* Content: Donut Chart + Top List */}
        {breakdownData.list.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Belum ada data {activeTab === "EXPENSE" ? "pengeluaran" : "pemasukan"} pada periode ini
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Donut Chart with Center Total */}
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData.list}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {breakdownData.list.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {formatCompactIDR(breakdownData.totalSum)}
                </span>
              </div>
            </div>

            {/* Top Categories Ranking List */}
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Top Peringkat Kategori
              </p>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {breakdownData.list.slice(0, 5).map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 shrink-0">
                        <span>{formatCompactIDR(item.value)}</span>
                        <span className="text-[11px] text-slate-400 w-10 text-right">
                          {item.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
