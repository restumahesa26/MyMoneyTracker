"use client";

import React, { useState, useMemo } from "react";
import { Debt } from "@/types";
import { formatIDR, formatDate } from "@/lib/formatters";
import { DebtModal } from "./DebtModal";
import { DebtPaymentModal } from "./DebtPaymentModal";
import { useFinance } from "@/context/FinanceContext";
import {
  Search,
  Plus,
  TrendingDown,
  TrendingUp,
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Trash2,
  HandCoins,
  History,
  ChevronDown,
  ChevronUp,
  Building2,
  CreditCard,
  Smartphone,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { parseISO, differenceInCalendarDays, startOfDay, format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

type FilterTab = "ALL" | "DEBT" | "RECEIVABLE" | "DUE_SOON" | "PAID";

export const DebtCardList: React.FC = () => {
  const { debts, deleteDebt } = useFinance();

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);

  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const today = startOfDay(new Date());

  // Category counts
  const categories = useMemo(() => {
    const set = new Set<string>();
    debts.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [debts]);

  // Filtered debts
  const filteredDebts = useMemo(() => {
    return debts.filter((d) => {
      const isPaid = d.status === "PAID" || d.remainingAmount <= 0;

      // Tab filter
      if (activeTab === "DEBT" && d.type !== "DEBT") return false;
      if (activeTab === "RECEIVABLE" && d.type !== "RECEIVABLE") return false;
      if (activeTab === "PAID" && !isPaid) return false;
      if (activeTab === "DUE_SOON") {
        if (isPaid || !d.dueDate) return false;
        try {
          const due = startOfDay(parseISO(d.dueDate));
          const diff = differenceInCalendarDays(due, today);
          if (diff > 7) return false;
        } catch {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "ALL" && d.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = d.title.toLowerCase().includes(query);
        const matchLender = d.lenderName.toLowerCase().includes(query);
        const matchNotes = d.notes?.toLowerCase().includes(query) || false;
        const matchRef = d.referenceNumber?.toLowerCase().includes(query) || false;
        return matchTitle || matchLender || matchNotes || matchRef;
      }

      return true;
    });
  }, [debts, activeTab, selectedCategory, searchQuery, today]);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus catatan hutang "${title}"?`)) {
      try {
        await deleteDebt(id);
        toast.success(`Catatan "${title}" berhasil dihapus`);
      } catch (err) {
        toast.error("Gagal menghapus catatan hutang");
      }
    }
    setOpenMenuId(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Disalin ke papan klip!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddNew = () => {
    setEditingDebt(null);
    setIsModalOpen(true);
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleOpenPayment = (debt: Debt) => {
    setPaymentDebt(debt);
    setIsPaymentModalOpen(true);
  };

  const getDueDateStatus = (debt: Debt) => {
    const isPaid = debt.status === "PAID" || debt.remainingAmount <= 0;
    if (isPaid) {
      return {
        label: "Lunas",
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50",
        icon: CheckCircle2,
      };
    }

    if (!debt.dueDate) {
      return {
        label: "Tanpa Tenggat",
        color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
        icon: CalendarClock,
      };
    }

    try {
      const due = startOfDay(parseISO(debt.dueDate));
      const diff = differenceInCalendarDays(due, today);
      const formattedDate = format(due, "d MMM yyyy", { locale: localeId });

      if (diff < 0) {
        return {
          label: `Terlewat ${Math.abs(diff)} hari (${formattedDate})`,
          color: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-700/60 font-bold animate-pulse",
          icon: AlertTriangle,
        };
      }
      if (diff === 0) {
        return {
          label: `Jatuh Tempo Hari Ini! (${formattedDate})`,
          color: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-700/60 font-bold",
          icon: AlertTriangle,
        };
      }
      if (diff <= 7) {
        return {
          label: `Jatuh Tempo ${diff} hari lagi (${formattedDate})`,
          color: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-semibold",
          icon: CalendarClock,
        };
      }
      return {
        label: `Jatuh Tempo: ${formattedDate}`,
        color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
        icon: CalendarClock,
      };
    } catch {
      return {
        label: `Tenggat: ${debt.dueDate}`,
        color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
        icon: CalendarClock,
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Daftar Catatan Hutang & Pinjaman
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau sisa pinjaman, pihak pemberi hutang, dan tanggal jatuh tempo dengan tertata
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Catatan Hutang</span>
        </button>
      </div>

      {/* Tabs & Search Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-850 rounded-2xl overflow-x-auto">
          {[
            { id: "ALL", label: "Semua", count: debts.length },
            {
              id: "DEBT",
              label: "Hutang Saya",
              count: debts.filter((d) => d.type === "DEBT").length,
            },
            {
              id: "RECEIVABLE",
              label: "Piutang",
              count: debts.filter((d) => d.type === "RECEIVABLE").length,
            },
            {
              id: "DUE_SOON",
              label: "Jatuh Tempo",
              count: debts.filter((d) => {
                if (d.status === "PAID" || !d.dueDate) return false;
                try {
                  const diff = differenceInCalendarDays(startOfDay(parseISO(d.dueDate)), today);
                  return diff <= 7;
                } catch {
                  return false;
                }
              }).length,
            },
            {
              id: "PAID",
              label: "Lunas",
              count: debts.filter((d) => d.status === "PAID" || d.remainingAmount <= 0).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari hutang / bayar ke siapa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Grid of Debt Cards */}
      {filteredDebts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <HandCoins className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Tidak Ada Catatan Hutang Ditemukan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {searchQuery || activeTab !== "ALL" || selectedCategory !== "ALL"
                ? "Tidak ada data yang cocok dengan kriteria filter saat ini. Coba reset filter atau kata kunci pencarian Anda."
                : "Mulai kelola hutang Anda agar tidak terlewat jatuh tempo dan ketahui dengan jelas kemana dan berapa harus bayar."}
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Catatan Hutang Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDebts.map((debt) => {
            const isPaid = debt.status === "PAID" || debt.remainingAmount <= 0;
            const paid = debt.paidAmount || (debt.originalAmount - debt.remainingAmount);
            const progress =
              debt.originalAmount > 0
                ? Math.min(100, Math.round((paid / debt.originalAmount) * 100))
                : 100;
            const dueStatus = getDueDateStatus(debt);
            const DueIcon = dueStatus.icon;
            const isHistoryExpanded = expandedHistoryId === debt.id;

            return (
              <div
                key={debt.id}
                className={`rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 p-5 flex flex-col justify-between relative group shadow-sm hover:shadow-md ${
                  isPaid
                    ? "border-emerald-200/80 dark:border-emerald-900/40"
                    : dueStatus.label.includes("Terlewat") || dueStatus.label.includes("Hari Ini")
                    ? "border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-400/20"
                    : "border-slate-200/90 dark:border-slate-800/90"
                }`}
              >
                <div>
                  {/* Top Bar: Badges & Menu */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Type Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          debt.type === "DEBT"
                            ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                            : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                        }`}
                      >
                        {debt.type === "DEBT" ? (
                          <>
                            <TrendingDown className="w-3 h-3" />
                            <span>Hutang Saya</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-3 h-3" />
                            <span>Piutang</span>
                          </>
                        )}
                      </span>

                      {/* Category Badge */}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {debt.category}
                      </span>
                    </div>

                    {/* Actions dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === debt.id ? null : debt.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === debt.id && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-850 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-30 animate-scale-in">
                            <button
                              onClick={() => handleEdit(debt)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit Data</span>
                            </button>
                            <button
                              onClick={() => handleDelete(debt.id, debt.title)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title & Creditor info */}
                  <div className="space-y-1 mb-4">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                      {debt.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span className="font-medium">
                        {debt.type === "DEBT" ? "Bayar ke:" : "Peminjam:"}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {debt.lenderName}
                      </span>
                    </p>
                  </div>

                  {/* Financial Metrics: Sisa & Pokok */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2 mb-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Sisa Hutang:
                      </span>
                      <span
                        className={`text-lg font-black tracking-tight ${
                          isPaid
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatIDR(debt.remainingAmount)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>Pokok: {formatIDR(debt.originalAmount)}</span>
                        <span>{progress}% terbayar</span>
                      </div>
                    </div>
                  </div>

                  {/* Due Date Badge */}
                  <div className="mb-3">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs border ${dueStatus.color}`}
                    >
                      <DueIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{dueStatus.label}</span>
                    </div>
                  </div>

                  {/* Monthly Installment info (if present) */}
                  {debt.monthlyInstallment ? (
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Cicilan per bulan:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatIDR(debt.monthlyInstallment)}
                      </span>
                    </div>
                  ) : null}

                  {/* Reference Number / VA (if present) */}
                  {debt.referenceNumber && (
                    <div className="mb-2.5 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 truncate max-w-[170px]">
                        Ref: {debt.referenceNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(debt.referenceNumber!, debt.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Salin nomor referensi"
                      >
                        {copiedId === debt.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Notes (if present) */}
                  {debt.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 mb-3 bg-slate-50 dark:bg-slate-850/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      "{debt.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions & Payment History Accordion */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    {!isPaid ? (
                      <button
                        onClick={() => handleOpenPayment(debt)}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <HandCoins className="w-3.5 h-3.5" />
                        <span>Catat Pembayaran</span>
                      </button>
                    ) : (
                      <div className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Hutang Sudah Lunas</span>
                      </div>
                    )}

                    {/* Expand payment history button */}
                    {debt.payments && debt.payments.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedHistoryId(isHistoryExpanded ? null : debt.id)
                        }
                        title="Lihat riwayat pembayaran"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span className="text-[11px]">{debt.payments.length}</span>
                        {isHistoryExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Payment History List (Expanded) */}
                  {isHistoryExpanded && debt.payments && (
                    <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800 animate-fade-in max-h-40 overflow-y-auto pr-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Riwayat Pembayaran:
                      </p>
                      {debt.payments.map((p) => (
                        <div
                          key={p.id}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">
                              {formatIDR(p.amount)}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {formatDate(p.date)} {p.notes ? `• ${p.notes}` : ""}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0">
                            Berhasil
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Debt Modal (Create / Edit) */}
      <DebtModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editDebt={editingDebt}
      />

      {/* Debt Payment Modal */}
      <DebtPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        debt={paymentDebt}
      />
    </div>
  );
};
