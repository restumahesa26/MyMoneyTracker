"use client";

import React, { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { useFinance } from "@/context/FinanceContext";
import { Transaction, TransactionType } from "@/types";
import { formatIDR } from "@/lib/formatters";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { ModalPortal } from "@/components/ui/ModalPortal";
import {
  X,
  Calendar as CalendarIcon,
  Tag,
  FileText,
  Wallet,
  Layers,
  Sparkles,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "INCOME" | "EXPENSE";
  editTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = "EXPENSE",
  editTransaction = null,
}) => {
  const { accounts, categories, addTransaction, updateTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountRaw, setAmountRaw] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [dateShortcut, setDateShortcut] = useState<"today" | "yesterday" | "custom">("today");
  const [categoryId, setCategoryId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Sync state with editTransaction or initialType when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        setType(editTransaction.type);
        setAmountRaw(editTransaction.amount.toString());
        // format date
        const d = editTransaction.date.includes("T")
          ? editTransaction.date.substring(0, 16)
          : format(new Date(editTransaction.date), "yyyy-MM-dd'T'HH:mm");
        setDateStr(d);
        setDateShortcut("custom");
        setCategoryId(editTransaction.categoryId);
        setAccountId(editTransaction.accountId);
        setDescription(editTransaction.description || "");
        setTags(editTransaction.tags || []);
      } else {
        setType(initialType);
        setAmountRaw("");
        setDateStr(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
        setDateShortcut("today");
        setDescription("");
        setTags([]);

        // Default category based on type
        const firstCat = categories.find((c) => c.type === initialType);
        if (firstCat) setCategoryId(firstCat.id);

        // Default account
        if (accounts.length > 0) setAccountId(accounts[0].id);
      }
    }
  }, [isOpen, editTransaction, initialType, categories, accounts]);

  // When type changes, update selected category to match type
  const handleTypeChange = (newType: "INCOME" | "EXPENSE") => {
    setType(newType);
    const matchingCat = categories.find((c) => c.type === newType);
    if (matchingCat) {
      setCategoryId(matchingCat.id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amountRaw.replace(/[^0-9]/g, ""));
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Silakan masukkan nominal transaksi yang valid");
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const selectedAccount = accounts.find((a) => a.id === accountId);

    if (!selectedAccount) {
      toast.error("Silakan pilih dompet / rekening");
      return;
    }

    setSubmitting(true);
    try {
      if (editTransaction) {
        await updateTransaction(editTransaction.id, {
          type,
          amount: numericAmount,
          date: dateStr,
          description: description.trim() || selectedCategory?.name || "Transaksi",
          categoryId: categoryId || "cat_other",
          categoryName: selectedCategory?.name || "Lainnya",
          categoryIcon: selectedCategory?.icon || "CircleEllipsis",
          categoryColor: selectedCategory?.color || "#64748B",
          accountId: selectedAccount.id,
          accountName: selectedAccount.name,
          accountIcon: selectedAccount.icon,
          tags,
        });
        toast.success("Transaksi berhasil diperbarui!");
      } else {
        await addTransaction({
          type,
          amount: numericAmount,
          date: dateStr,
          description: description.trim() || selectedCategory?.name || "Transaksi",
          categoryId: categoryId || "cat_other",
          categoryName: selectedCategory?.name || "Lainnya",
          categoryIcon: selectedCategory?.icon || "CircleEllipsis",
          categoryColor: selectedCategory?.color || "#64748B",
          accountId: selectedAccount.id,
          accountName: selectedAccount.name,
          accountIcon: selectedAccount.icon,
          tags,
        });

        // Trigger confetti on income
        if (type === "INCOME") {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
        }
        toast.success(
          type === "INCOME" ? "Pemasukan berhasil dicatat!" : "Pengeluaran berhasil dicatat!"
        );
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan transaksi");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const relevantCategories = categories.filter((c) => c.type === type);
  const formattedDisplayAmount = amountRaw
    ? formatIDR(parseFloat(amountRaw.replace(/[^0-9]/g, "")) || 0)
    : "Rp 0";

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-lg max-h-[90vh] my-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-scale-in">
          {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                type === "INCOME"
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
              }`}
            >
              {type === "INCOME" ? (
                <ArrowDownCircle className="w-5 h-5" />
              ) : (
                <ArrowUpCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {editTransaction ? "Edit Transaksi" : "Catat Transaksi Baru"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Isi rincian transaksi Anda secara akurat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Type Toggle Tabs */}
          {!editTransaction && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => handleTypeChange("EXPENSE")}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  type === "EXPENSE"
                    ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/50 dark:border-slate-800"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" />
                Pengeluaran (Expense)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("INCOME")}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  type === "INCOME"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-slate-800"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" />
                Pemasukan (Income)
              </button>
            </div>
          )}

          {/* Amount Input with Auto-formatting Display */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nominal Transaksi (IDR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
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
                className={`w-full pl-12 pr-4 py-3 text-lg font-bold rounded-2xl bg-slate-50 dark:bg-slate-850 border transition-all focus:outline-none focus:ring-2 ${
                  type === "INCOME"
                    ? "border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500/30"
                    : "border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 focus:ring-rose-500/30"
                }`}
              />
            </div>
            {amountRaw && (
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Terbaca: <span className="font-semibold text-slate-700 dark:text-slate-200">{formattedDisplayAmount}</span>
              </p>
            )}
          </div>

          {/* Date Picker & Fast Shortcuts (Backdating Support) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Tanggal & Waktu Transaksi</span>
              <span className="text-[11px] text-indigo-500 font-medium">Mendukung Backdate</span>
            </label>

            {/* Quick date buttons */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                type="button"
                onClick={() => handleDateShortcut("today")}
                className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
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
                className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
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
                className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                  dateShortcut === "custom"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
              >
                Pilih Tanggal
              </button>
            </div>

            <div className="relative">
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
          </div>

          {/* Category & Wallet / Account Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Kategori</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {relevantCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Wallet / Account */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dompet / Akun</span>
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
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Keterangan / Catatan (Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Makan siang dengan rekan kerja, Belanja mingguan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tags (Tekan Enter atau Koma untuk menambah)</span>
            </label>
            <input
              type="text"
              placeholder="Ketik tag, misal: kuliner, kantor, liburan..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 mb-2"
            />
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
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:scale-102 active:scale-98 disabled:opacity-50 ${
                type === "INCOME"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25"
                  : "bg-rose-600 hover:bg-rose-500 shadow-rose-500/25"
              }`}
            >
              {submitting
                ? "Menyimpan..."
                : editTransaction
                ? "Simpan Perubahan"
                : type === "INCOME"
                ? "Simpan Pemasukan"
                : "Simpan Pengeluaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
};
