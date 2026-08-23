"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Transaction } from "@/types";
import { formatIDR, formatDate } from "@/lib/formatters";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import {
  Receipt,
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  MoreVertical,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";
import { toast } from "sonner";

export default function TransactionsPage() {
  const {
    filteredTransactions,
    accounts,
    categories,
    deleteTransaction,
    exportDataCSV,
    exportDataJSON,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("ALL");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filtered transactions based on all combined controls
  const finalTransactions = useMemo(() => {
    return filteredTransactions.filter((tx) => {
      if (selectedType !== "ALL" && tx.type !== selectedType) return false;
      if (selectedCategoryId !== "ALL" && tx.categoryId !== selectedCategoryId) return false;
      if (
        selectedAccountId !== "ALL" &&
        tx.accountId !== selectedAccountId &&
        tx.toAccountId !== selectedAccountId
      )
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchCat = (tx.categoryName || "").toLowerCase().includes(q);
        const matchAcc = (tx.accountName || "").toLowerCase().includes(q);
        const matchToAcc = (tx.toAccountName || "").toLowerCase().includes(q);
        const matchTag = (tx.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchDesc && !matchCat && !matchAcc && !matchToAcc && !matchTag) return false;
      }
      return true;
    });
  }, [filteredTransactions, selectedType, selectedCategoryId, selectedAccountId, searchQuery]);

  // Totals for filtered view
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    finalTransactions.forEach((tx) => {
      if (tx.type === "INCOME") income += tx.amount;
      if (tx.type === "EXPENSE") expense += tx.amount;
    });
    return { income, expense, net: income - expense };
  }, [finalTransactions]);

  const handleDownloadCSV = () => {
    const csv = exportDataCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transaksi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File CSV berhasil diunduh!");
  };

  const handleDownloadJSON = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `backup_keuangan_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File JSON backup berhasil diunduh!");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      try {
        await deleteTransaction(id);
        toast.success("Transaksi berhasil dihapus");
      } catch (err) {
        toast.error("Gagal menghapus transaksi");
      }
    }
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Riwayat Transaksi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Semua catatan arus kas keluar, masuk, dan transfer
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <DateRangeFilter />

          {/* Export Dropdown / Buttons */}
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
            title="Export ke format Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Catatan</span>
          </button>
        </div>
      </div>

      {/* Summary Banner for filtered transactions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Transaksi
          </span>
          <p className="text-lg font-black text-slate-800 dark:text-slate-100">
            {finalTransactions.length} Transaksi
          </p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
            Pemasukan (Tersaring)
          </span>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            +{formatIDR(summary.income)}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
            Pengeluaran (Tersaring)
          </span>
          <p className="text-lg font-black text-rose-600 dark:text-rose-400">
            -{formatIDR(summary.expense)}
          </p>
        </div>
      </div>

      {/* Multi-criteria Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari deskripsi, tag, akun..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Semua Tipe Transaksi</option>
            <option value="EXPENSE">Pengeluaran (Expense)</option>
            <option value="INCOME">Pemasukan (Income)</option>
            <option value="TRANSFER">Transfer Antar Dompet</option>
          </select>

          {/* Category */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type === "INCOME" ? "Pemasukan" : "Pengeluaran"})
              </option>
            ))}
          </select>

          {/* Account */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Semua Dompet / Akun</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
        {finalTransactions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada data transaksi yang cocok
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Silakan reset filter pencarian atau buat transaksi baru.
            </p>
          </div>
        ) : (
          finalTransactions.map((tx) => {
            const isExpense = tx.type === "EXPENSE";
            const isIncome = tx.type === "INCOME";
            const isTransfer = tx.type === "TRANSFER";

            return (
              <div
                key={tx.id}
                className="p-4 sm:px-6 hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition-colors flex items-center justify-between gap-4 group"
              >
                {/* Left */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{
                      backgroundColor: `${tx.categoryColor || (isIncome ? "#10B981" : isExpense ? "#F43F5E" : "#6366F1")}18`,
                      color: tx.categoryColor || (isIncome ? "#10B981" : isExpense ? "#F43F5E" : "#6366F1"),
                    }}
                  >
                    <DynamicIcon
                      name={tx.categoryIcon || (isIncome ? "ArrowDownLeft" : isExpense ? "ArrowUpRight" : "ArrowRightLeft")}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {tx.description}
                      </p>
                      {isTransfer && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                          Transfer
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        {tx.categoryName}
                      </span>
                      <span>•</span>
                      <span>
                        {isTransfer
                          ? `${tx.accountName} ➔ ${tx.toAccountName}`
                          : tx.accountName}
                      </span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>

                    {tx.tags && tx.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {tx.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-medium text-slate-400 dark:text-slate-500"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-xs sm:text-sm font-bold tracking-tight ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isExpense
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {isIncome ? "+" : isExpense ? "-" : ""}
                      {formatIDR(tx.amount)}
                    </span>
                  </div>

                  {/* Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenuId(activeMenuId === tx.id ? null : tx.id)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === tx.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setActiveMenuId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-scale-in">
                          <button
                            onClick={() => {
                              setEditingTx(tx);
                              setIsEditModalOpen(true);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <TransactionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTx(null);
          }}
          editTransaction={editingTx}
        />
      )}

      {/* Create Modal */}
      <TransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialType="EXPENSE"
      />
    </div>
  );
}
