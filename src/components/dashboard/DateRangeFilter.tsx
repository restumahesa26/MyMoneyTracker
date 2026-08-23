"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { DateRangePreset } from "@/types";
import { getDateFilterRange } from "@/lib/formatters";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Filter,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const DateRangeFilter: React.FC = () => {
  const { dateFilter, setDateFilter } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStart, setCustomStart] = useState(dateFilter.startDate);
  const [customEnd, setCustomEnd] = useState(dateFilter.endDate);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const presets: { id: DateRangePreset; label: string }[] = [
    { id: "today", label: "Hari Ini" },
    { id: "yesterday", label: "Kemarin" },
    { id: "last7days", label: "7 Hari Terakhir" },
    { id: "thisMonth", label: "Bulan Ini" },
    { id: "lastMonth", label: "Bulan Lalu" },
    { id: "thisYear", label: "Tahun Ini" },
    { id: "all", label: "Semua Waktu" },
  ];

  const handleSelectPreset = (preset: DateRangePreset) => {
    setShowCustomRange(false);
    setDateFilter(getDateFilterRange(preset));
    setIsOpen(false);
  };

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      setDateFilter(getDateFilterRange("customRange", customStart, customEnd));
      setShowCustomRange(false);
      setIsOpen(false);
    }
  };

  const handleApplyCustomMonth = () => {
    setDateFilter(
      getDateFilterRange("customMonth", undefined, undefined, selectedMonth, selectedYear)
    );
    setShowCustomRange(false);
    setIsOpen(false);
  };

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const years = [2024, 2025, 2026, 2027];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
        <span>{dateFilter.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-scale-in">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Filter Rentang Waktu
              </span>
              <button
                onClick={() => setShowCustomRange(!showCustomRange)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {showCustomRange ? "Pilihan Cepat" : "Kustom..."}
              </button>
            </div>

            {!showCustomRange ? (
              <div className="space-y-1">
                {presets.map((p) => {
                  const isSelected = dateFilter.preset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span>{p.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}

                {/* Custom Month Picker Accordion */}
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">
                    Pilih Bulan Spesifik
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    >
                      {months.map((m, idx) => (
                        <option key={m} value={idx}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustomMonth}
                    className="w-full mt-2 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
                  >
                    Terapkan Bulan
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplyCustomRange} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomRange(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm"
                  >
                    Terapkan Rentang
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};
