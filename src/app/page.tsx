"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { format, subDays, isToday, parseISO } from "date-fns";
import { useFinance } from "@/context/FinanceContext";
import { TransactionType } from "@/types";
import { formatIDR, formatCompactIDR, formatDate } from "@/lib/formatters";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { WalletModal } from "@/components/wallets/WalletModal";
import { CategoryModal } from "@/components/categories/CategoryModal";
import {
  PlusCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  Calendar,
  Layers,
  Wallet,
  FileText,
  Tag,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  ArrowRight,
  Receipt,
  RotateCcw,
  Plus,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function RecordTransactionPage() {
  const {
    accounts,
    categories,
    transactions,
    addTransaction,
    transferFunds,
    loadDefaultCategoriesToReal,
    dataSource,
  } = useFinance();

  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amountRaw, setAmountRaw] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [dateShortcut, setDateShortcut] = useState<"today" | "yesterday" | "custom">("today");
  const [categoryId, setCategoryId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Modals for adding wallet or category directly from here
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Set default category and account on initial load
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      const match = categories.find((c) => c.type === (type === "INCOME" ? "INCOME" : "EXPENSE"));
      if (match) setCategoryId(match.id);
    }
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
      if (accounts.length > 1) setToAccountId(accounts[1].id);
    }
  }, [categories, accounts, type, categoryId, accountId]);

  // Update selected category when switching type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType !== "TRANSFER") {
      const match = categories.find((c) => c.type === newType);
      if (match) setCategoryId(match.id);
    }
  };

  const handleDateShortcut = (shortcut: "today" | "yesterday") => {
    setDateShortcut(shortcut);
    const now = new Date();
    if (shortcut === "today") {
      setDateStr(format(now, "yyyy-MM-dd'T'HH:mm"));
    } else if (shortcut === "yesterday") {
      const y = subDays(now, 1);
      setDateStr(format(y, "yyyy-MM-dd'T'HH:mm"));
    }
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amountRaw.replace(/[^0-9]/g, "")) || 0;
    const updated = current + addValue;
    setAmountRaw(updated.toString());
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, "");
      if (clean && !tags.includes(`#${clean}`)) {
        setTags([...tags, `#${clean}`]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleResetForm = () => {
    setAmountRaw("");
    setDescription("");
    setTags([]);
    setTagInput("");
    setDateShortcut("today");
    setDateStr(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  };

  const relevantCategories = useMemo(() => {
    if (type === "TRANSFER") return [];
    return categories.filter((c) => c.type === type);
  }, [categories, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountRaw.replace(/[^0-9]/g, ""));

    if (!cleanAmount || cleanAmount <= 0) {
      toast.error("Masukkan nominal transaksi yang valid");
      return;
    }

    if (accounts.length === 0) {
      toast.error("Silakan tambahkan dompet terlebih dahulu!");
      setIsWalletModalOpen(true);
      return;
    }

    const fromAcc = accounts.find((a) => a.id === accountId) || accounts[0];
    if (!fromAcc) {
      toast.error("Pilih dompet/rekening sumber");
      return;
    }

    setSubmitting(true);

    try {
      if (type === "TRANSFER") {
        if (!toAccountId || toAccountId === fromAcc.id) {
          toast.error("Pilih dompet tujuan transfer yang berbeda");
          setSubmitting(false);
          return;
        }

        const toAcc = accounts.find((a) => a.id === toAccountId);
        if (!toAcc) {
          toast.error("Dompet tujuan tidak ditemukan");
          setSubmitting(false);
          return;
        }

        await transferFunds(
          fromAcc.id,
          toAcc.id,
          cleanAmount,
          description || `Transfer dari ${fromAcc.name} ke ${toAcc.name}`,
          dateStr
        );
        toast.success(`Transfer ${formatIDR(cleanAmount)} berhasil dicatat!`);
      } else {
        const cat = categories.find((c) => c.id === categoryId);
        const catName = cat?.name || (type === "INCOME" ? "Pemasukan Lainnya" : "Pengeluaran Lainnya");
        const catIcon = cat?.icon || "Receipt";
        const catColor = cat?.color || (type === "INCOME" ? "#10B981" : "#F43F5E");

        await addTransaction({
          type,
          amount: cleanAmount,
          date: dateStr,
          description: description.trim() || catName,
          categoryId: categoryId || "cat_general",
          categoryName: catName,
          categoryIcon: catIcon,
          categoryColor: catColor,
          accountId: fromAcc.id,
          accountName: fromAcc.name,
          accountIcon: fromAcc.icon,
          tags,
        });

        // Trigger confetti celebration on income or successful record
        if (type === "INCOME") {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10B981", "#34D399", "#6EE7B7"],
          });
        }

        toast.success(
          `${type === "INCOME" ? "Pemasukan" : "Pengeluaran"} ${formatIDR(cleanAmount)} berhasil dicatat!`
        );
      }

      handleResetForm();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan transaksi");
    } finally {
      setSubmitting(false);
    }
  };

  // Today's summary computation
  const todayTransactions = useMemo(() => {
    return transactions.filter((t) => {
      try {
        const d = parseISO(t.date);
        return isToday(d);
      } catch {
        return false;
      }
    });
  }, [transactions]);

  const todaySummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    todayTransactions.forEach((tx) => {
      if (tx.type === "INCOME") income += tx.amount;
      if (tx.type === "EXPENSE") expense += tx.amount;
    });
    return { income, expense, count: todayTransactions.length };
  }, [todayTransactions]);

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Catat Transaksi Cepat
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Formulir instan & ringan untuk mencatat pengeluaran, pemasukan, dan transfer
          </p>
        </div>

        {/* Shortcut to Full Dashboard */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all self-start sm:self-auto group"
        >
          <LayoutDashboard className="w-4 h-4 text-indigo-500" />
          <span>Lihat Dashboard Lengkap</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Main Grid: Left is Fast Form, Right is Today's Overview & Wallets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Instant Transaction Recording Console (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card p-5 sm:p-7 space-y-6">
          {/* Type Toggle Segment */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => handleTypeChange("EXPENSE")}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === "EXPENSE"
                  ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/50 dark:border-slate-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("INCOME")}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === "INCOME"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-slate-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("TRANSFER")}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === "TRANSFER"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transfer</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount Section */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nominal Transaksi (IDR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  autoFocus
                  placeholder="0"
                  value={
                    amountRaw
                      ? Number(amountRaw.replace(/[^0-9]/g, "")).toLocaleString("id-ID")
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setAmountRaw(val);
                  }}
                  className={`w-full pl-14 pr-4 py-3.5 text-2xl font-black rounded-2xl bg-slate-50 dark:bg-slate-850 border transition-all focus:outline-none focus:ring-2 ${
                    type === "INCOME"
                      ? "border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500/30"
                      : type === "EXPENSE"
                      ? "border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 focus:ring-rose-500/30"
                      : "border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500/30"
                  }`}
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {[10000, 20000, 50000, 100000, 500000, 1000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAddAmount(val)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors border border-slate-200/60 dark:border-slate-700/50"
                  >
                    +{formatCompactIDR(val).replace("Rp ", "")}
                  </button>
                ))}
                {amountRaw && (
                  <button
                    type="button"
                    onClick={() => setAmountRaw("")}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    Reset Nominal
                  </button>
                )}
              </div>
            </div>

            {/* Date Picker & Fast Shortcuts */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Tanggal & Waktu</span>
                <span className="text-[11px] text-indigo-500 font-medium">Bisa Catat Tanggal Lampau</span>
              </label>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleDateShortcut("today")}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    dateShortcut === "today"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => handleDateShortcut("yesterday")}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    dateShortcut === "yesterday"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Kemarin
                </button>
                <button
                  type="button"
                  onClick={() => setDateShortcut("custom")}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    dateShortcut === "custom"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Pilih Tanggal
                </button>
              </div>

              <input
                type="datetime-local"
                value={dateStr}
                onChange={(e) => {
                  setDateStr(e.target.value);
                  setDateShortcut("custom");
                }}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Category Grid (For Income and Expense) */}
            {type !== "TRANSFER" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Pilih Kategori</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                    >
                      + Tambah Kategori
                    </button>
                  </div>
                </label>

                {relevantCategories.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-center space-y-2.5">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Belum ada kategori {type === "INCOME" ? "pemasukan" : "pengeluaran"} terdaftar
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
                      >
                        + Buat Kategori Baru
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await loadDefaultCategoriesToReal();
                          toast.success("Kategori bawaan berhasil dimuat!");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300"
                      >
                        Muat Kategori Bawaan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    {relevantCategories.map((cat) => {
                      const isSelected = categoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoryId(cat.id)}
                          className={`p-2.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold border transition-all text-left ${
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm"
                              : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: cat.color }}
                          >
                            <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Wallet / Account Selection */}
            {type !== "TRANSFER" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Dompet / Rekening Sumber</span>
                  <button
                    type="button"
                    onClick={() => setIsWalletModalOpen(true)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    + Tambah Dompet
                  </button>
                </label>

                {accounts.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-center space-y-2">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Belum ada dompet atau rekening</span>
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Tambahkan dompet/rekening Anda terlebih dahulu untuk mencatat transaksi data real.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsWalletModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:bg-indigo-500"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Buat Dompet Pertama</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {accounts.map((acc) => {
                      const isSelected = accountId === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setAccountId(acc.id)}
                          className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm"
                              : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: acc.color }}
                            >
                              <DynamicIcon name={acc.icon} className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-xs font-bold truncate">{acc.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {formatIDR(acc.balance)}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Transfer From & To Accounts */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accounts.length < 2 ? (
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-center space-y-2">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Dibutuhkan minimal 2 dompet untuk melakukan transfer
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsWalletModalOpen(true)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                      + Tambah Dompet
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Dari Dompet Asal
                      </label>
                      <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({formatIDR(acc.balance)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Ke Dompet Tujuan
                      </label>
                      <select
                        value={toAccountId}
                        onChange={(e) => setToAccountId(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>
                            {acc.name} ({formatIDR(acc.balance)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Description & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Catatan / Keterangan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Makan siang, Beli kopi, Gaji bulanan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tags (Enter untuk menambah)
                </label>
                <input
                  type="text"
                  placeholder="Ketik tag, misal: makan, kantor..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500 ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Submit Action Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className={`px-8 py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl transition-all hover:scale-102 active:scale-98 disabled:opacity-50 flex items-center gap-2 ${
                  type === "INCOME"
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25"
                    : type === "EXPENSE"
                    ? "bg-rose-600 hover:bg-rose-500 shadow-rose-500/25"
                    : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {submitting
                    ? "Menyimpan..."
                    : `Simpan ${
                        type === "INCOME"
                          ? "Pemasukan"
                          : type === "EXPENSE"
                          ? "Pengeluaran"
                          : "Transfer"
                      }`}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Today's Summary & Live Account Balances (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Today's Activity Scorecard */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Aktivitas Hari Ini</span>
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {todaySummary.count} Catatan
              </span>
            </div>

            {/* Mini scorecard for today */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                  Masuk Hari Ini
                </span>
                <p className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                  +{formatIDR(todaySummary.income)}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                  Keluar Hari Ini
                </span>
                <p className="text-base font-black text-rose-700 dark:text-rose-300 mt-0.5">
                  -{formatIDR(todaySummary.expense)}
                </p>
              </div>
            </div>

            {/* List of today's transactions */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-64 overflow-y-auto">
              {todayTransactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada transaksi yang dicatat hari ini.
                </div>
              ) : (
                todayTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: tx.categoryColor || "#6366F1" }}
                      >
                        <DynamicIcon
                          name={tx.categoryIcon || "Receipt"}
                          className="w-3.5 h-3.5"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {tx.accountName} • {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`font-bold shrink-0 ${
                        tx.type === "INCOME"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : tx.type === "EXPENSE"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                      {formatIDR(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Wallet Balances Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-500" />
                <span>Saldo Dompet & Rekening</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsWalletModalOpen(true)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + Tambah &rarr;
              </button>
            </div>

            {accounts.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Belum ada dompet terdaftar
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tambahkan akun bank, e-wallet, atau kas pertama Anda.
                </p>
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
                >
                  + Tambah Dompet
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: acc.color }}
                      >
                        <DynamicIcon name={acc.icon} className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {acc.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {acc.type === "BANK"
                            ? "Bank Transfer"
                            : acc.type === "E_WALLET"
                            ? "E-Wallet"
                            : acc.type === "CASH"
                            ? "Cash Fisik"
                            : "Akun"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                      {formatIDR(acc.balance)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals for Adding Wallet and Category */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        initialType={type === "INCOME" ? "INCOME" : "EXPENSE"}
      />
    </div>
  );
}
