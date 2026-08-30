"use client";

import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useFinance } from "@/context/FinanceContext";
import { formatIDR, formatCompactIDR } from "@/lib/formatters";
import { parseISO, getDay } from "date-fns";
import { CalendarDays, Sparkles } from "lucide-react";

export const DayOfWeekChart: React.FC = () => {
  const { filteredTransactions } = useFinance();

  const { dayData, peakDayName, peakDayAmount } = useMemo(() => {
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysName = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const totals = [0, 0, 0, 0, 0, 0, 0];

    filteredTransactions
      .filter((tx) => tx.type === "EXPENSE")
      .forEach((tx) => {
        try {
          const d = parseISO(tx.date.substring(0, 10));
          const dayIdx = getDay(d);
          totals[dayIdx] += tx.amount;
        } catch {}
      });

    // Reorder to start Monday to Sunday: [1, 2, 3, 4, 5, 6, 0]
    const orderedIndices = [1, 2, 3, 4, 5, 6, 0];
    const maxVal = Math.max(...totals, 0);
    const maxIdx = totals.indexOf(maxVal);

    const list = orderedIndices.map((idx) => ({
      day: daysName[idx],
      amount: totals[idx],
      isHighest: totals[idx] === maxVal && totals[idx] > 0,
    }));

    return {
      dayData: list,
      peakDayName: maxVal > 0 ? daysName[maxIdx] : "-",
      peakDayAmount: maxVal,
    };
  }, [filteredTransactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-100">Hari {label}</p>
          <p className="text-rose-600 dark:text-rose-400 font-bold">
            {formatIDR(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <span>Pola Pengeluaran Mingguan</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aktivitas belanja berdasarkan hari dalam seminggu
          </p>
        </div>

        {peakDayAmount > 0 && (
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 self-start sm:self-auto flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Puncak: Hari {peakDayName} ({formatCompactIDR(peakDayAmount)})
          </span>
        )}
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
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
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {dayData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isHighest ? "#F43F5E" : "#6366F1"}
                  fillOpacity={entry.isHighest ? 1 : 0.75}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
