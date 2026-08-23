"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFinance } from "@/context/FinanceContext";
import { Transaction } from "@/types";
import { formatIDR, formatDate } from "@/lib/formatters";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  MoreVertical,
  Edit2,
  Trash2,
  Receipt,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

export const RecentTransactions: React.FC<{ limit?: number }> = ({ limit = 8 }) => {
  const { filteredTransactions, deleteTransaction, categories } = useFinance();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  // Filter transactions
  const displayedTransactions = filteredTransactions
    .filter((tx) => {
      // Type filter
      if (selectedType !== "ALL" && tx.type !== selectedType) return false;
      // Category filter
      if (selectedCategory !== "ALL" && tx.categoryId !== selectedCategory) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchCat = (tx.categoryName || "").toLowerCase().includes(q);
        const matchAcc = (tx.accountName || "").toLowerCase().includes(q);
        const matchTag = (tx.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchDesc && !matchCat && !matchAcc && !matchTag) return false;
      }
      return true;
    })
    .slice(0, limit);

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      try {
        await deleteTransaction(id);
        toast.success("Transaksi berhasil dihapus");
      } catch (err) {
        toast.error("Gagal menghapus transaksi");
      }
    }
    setActiveActionMenu(null);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsEditModalOpen(true);
    setActiveActionMenu(null);
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-500" />
            <span>Daftar Transaksi Terbaru</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Menampilkan transaksi sesuai periode yang dipilih
          </p>
        </div>

        <Link
          href="/transactions"
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          Lihat Semua ({filteredTransactions.length}) &rarr;
        </Link>
      </div>

      {/* Instant Search & Type Filters */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi, kategori, atau tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedType("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedType === "ALL"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedType("EXPENSE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedType === "EXPENSE"
                ? "bg-rose-500 text-white shadow-sm shadow-rose-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            }`}
          >
            Pengeluaran
          </button>
          <button
            onClick={() => setSelectedType("INCOME")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedType === "INCOME"
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            }`}
          >
            Pemasukan
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {displayedTransactions.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada transaksi ditemukan
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              Coba sesuaikan filter rentang waktu atau buat pencatatan transaksi baru.
            </p>
          </div>
        ) : (
          displayedTransactions.map((tx) => {
            const isExpense = tx.type === "EXPENSE";
            const isIncome = tx.type === "INCOME";
            const isTransfer = tx.type === "TRANSFER";

            return (
              <div
                key={tx.id}
                className="p-4 sm:px-6 hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition-colors flex items-center justify-between gap-4 group"
              >
                {/* Left: Icon & Details */}
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

                {/* Right: Nominal & Action Menu */}
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

                  {/* Dropdown Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveActionMenu(activeActionMenu === tx.id ? null : tx.id)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeActionMenu === tx.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setActiveActionMenu(null)}
                        />
                        <div className="absolute right-0 mt-1 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-scale-in">
                          <button
                            onClick={() => handleEdit(tx)}
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
    </div>
  );
};
