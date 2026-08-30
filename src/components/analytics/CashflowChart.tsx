"use client";

import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useFinance } from "@/context/FinanceContext";
import { formatIDR, formatCompactIDR } from "@/lib/formatters";
import { parseISO, format, eachDayOfInterval, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { TrendingUp, Layers, BarChart2 } from "lucide-react";

export const CashflowChart: React.FC = () => {
  const { filteredTransactions, dateFilter, metrics } = useFinance();
  const [viewMode, setViewMode] = useState<"DAILY" | "CUMULATIVE">("DAILY");

  const chartData = useMemo(() => {
    try {
      const start = startOfDay(parseISO(dateFilter.startDate));
      const end = endOfDay(parseISO(dateFilter.endDate));

      // Generate all dates in range
      const days = eachDayOfInterval({ start, end });

      const dailyMap: Record<
        string,
        { date: string; displayDate: string; income: number; expense: number; net: number }
      > = {};

      days.forEach((day) => {
        const key = format(day, "yyyy-MM-dd");
        dailyMap[key] = {
          date: key,
          displayDate: format(day, "d MMM", { locale: id }),
          income: 0,
          expense: 0,
          net: 0,
        };
      });

      // Populate data
      filteredTransactions.forEach((tx) => {
        const txKey = tx.date.substring(0, 10);
        if (dailyMap[txKey]) {
          if (tx.type === "INCOME") {
            dailyMap[txKey].income += tx.amount;
          } else if (tx.type === "EXPENSE") {
            dailyMap[txKey].expense += tx.amount;
          }
          dailyMap[txKey].net = dailyMap[txKey].income - dailyMap[txKey].expense;
        }
      });

      const list = Object.values(dailyMap);

      if (viewMode === "CUMULATIVE") {
        let cumIncome = 0;
        let cumExpense = 0;
        return list.map((item) => {
          cumIncome += item.income;
          cumExpense += item.expense;
          return {
            ...item,
            income: cumIncome,
            expense: cumExpense,
            net: cumIncome - cumExpense,
          };
        });
      }

      return list;
    } catch {
      return [];
    }
  }, [filteredTransactions, dateFilter, viewMode]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const income = payload.find((p: any) => p.dataKey === "income")?.value || 0;
      const expense = payload.find((p: any) => p.dataKey === "expense")?.value || 0;
      const net = income - expense;

      return (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-700 dark:text-slate-200 mb-1.5">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-between gap-4">
              <span>{viewMode === "CUMULATIVE" ? "Kumulatif Pemasukan:" : "Pemasukan:"}</span>
              <span>{formatIDR(income)}</span>
            </p>
            <p className="text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-between gap-4">
              <span>{viewMode === "CUMULATIVE" ? "Kumulatif Pengeluaran:" : "Pengeluaran:"}</span>
              <span>{formatIDR(expense)}</span>
            </p>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Surplus Bersih:</span>
              <span>{formatIDR(net)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Tren Arus Kas (Cashflow Momentum)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Perbandingan visual pemasukan vs pengeluaran per hari
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("DAILY")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === "DAILY"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setViewMode("CUMULATIVE")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === "CUMULATIVE"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Kumulatif
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Tidak ada data transaksi untuk rentang tanggal ini
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis
                dataKey="displayDate"
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
                dataKey="income"
                name="Pemasukan"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Pengeluaran"
                stroke="#F43F5E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
