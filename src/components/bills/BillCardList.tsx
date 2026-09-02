"use client";

import React, { useState, useMemo } from "react";
import { RecurringBill } from "@/types";
import { formatIDR, formatDateOnly } from "@/lib/formatters";
import { useFinance } from "@/context/FinanceContext";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { BillModal } from "./BillModal";
import { BillPaymentModal } from "./BillPaymentModal";
import {
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Check,
  History,
  ChevronDown,
  ChevronUp,
  Receipt,
  Wallet,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { format, parse, addMonths, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

type FilterTab = "ALL" | "UNPAID" | "PAID" | "DUE_SOON";

export const BillCardList: React.FC = () => {
  const { bills, deleteBill, unpayBill, accounts, isBalanceHidden } = useFinance();

  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const activePeriod = format(activeDate, "yyyy-MM"); // e.g. "2026-09"
  const todayDay = new Date().getDate();
  const isCurrentRealMonth = format(new Date(), "yyyy-MM") === activePeriod;

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingBill, setPayingBill] = useState<RecurringBill | null>(null);

  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Month switcher helpers
  const handlePrevMonth = () => setActiveDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setActiveDate((prev) => addMonths(prev, 1));
  const handleResetMonth = () => setActiveDate(new Date());

  const periodLabel = format(activeDate, "MMMM yyyy", { locale: localeId });

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    bills.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [bills]);

  // Tab counts
  const tabCounts = useMemo(() => {
    let unpaid = 0;
    let paid = 0;
    let dueSoon = 0;

    bills.forEach((b) => {
      const isPaid = b.lastPaidPeriod === activePeriod;
      if (isPaid) {
        paid++;
      } else {
        unpaid++;
        const diff = b.dueDay - todayDay;
        if (diff < 0 || diff <= (b.reminderDaysBefore || 3)) {
          dueSoon++;
        }
      }
    });

    return { all: bills.length, unpaid, paid, dueSoon };
  }, [bills, activePeriod, todayDay]);

  // Filtered bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const isPaid = b.lastPaidPeriod === activePeriod;

      // Tab filter
      if (activeTab === "UNPAID" && isPaid) return false;
      if (activeTab === "PAID" && !isPaid) return false;
      if (activeTab === "DUE_SOON") {
        if (isPaid) return false;
        const diff = b.dueDay - todayDay;
        if (diff > (b.reminderDaysBefore || 3) && diff >= 0) return false;
      }

      // Category filter
      if (selectedCategory !== "ALL" && b.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.name.toLowerCase().includes(q);
        const matchCat = b.category?.toLowerCase().includes(q) || false;
        const matchNotes = b.notes?.toLowerCase().includes(q) || false;
        return matchName || matchCat || matchNotes;
      }

      return true;
    });
  }, [bills, activeTab, selectedCategory, searchQuery, activePeriod, todayDay]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Catatan / no rekening berhasil disalin!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUnpay = async (bill: RecurringBill) => {
    if (confirm(`Batalkan status lunas untuk "${bill.name}" periode ${periodLabel}?`)) {
      try {
        await unpayBill(bill.id, activePeriod);
        toast.info(`Status lunas "${bill.name}" telah dibatalkan.`);
      } catch (err: any) {
        toast.error("Gagal membatalkan status lunas: " + err?.message);
      }
    }
  };

  const handleDelete = async (bill: RecurringBill) => {
    if (confirm(`Yakin ingin menghapus tagihan "${bill.name}"? Riwayat pembayaran juga akan dihapus.`)) {
      try {
        await deleteBill(bill.id);
        toast.success(`Tagihan "${bill.name}" berhasil dihapus.`);
      } catch (err: any) {
        toast.error("Gagal menghapus tagihan: " + err?.message);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation & Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 min-w-[120px] text-center">
                  {periodLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {!isCurrentRealMonth && (
              <button
                type="button"
                onClick={handleResetMonth}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 transition-colors"
              >
                Kembali ke Bulan Ini
              </button>
            )}
          </div>

          {/* "+ Tambah Tagihan" CTA */}
          <button
            type="button"
            onClick={() => {
              setEditingBill(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-98 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Tagihan</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "ALL"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>Semua</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeTab === "ALL"
                  ? "bg-white/20 dark:bg-slate-800 text-white dark:text-slate-100"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {tabCounts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("UNPAID")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "UNPAID"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>Belum Bayar</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeTab === "UNPAID"
                  ? "bg-white/20 text-white"
                  : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400"
              }`}
            >
              {tabCounts.unpaid}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("PAID")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "PAID"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>Sudah Lunas</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeTab === "PAID"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {tabCounts.paid}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("DUE_SOON")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "DUE_SOON"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>Jatuh Tempo Dekat / Terlewat</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeTab === "DUE_SOON"
                  ? "bg-white/20 text-white"
                  : "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400"
              }`}
            >
              {tabCounts.dueSoon}
            </span>
          </button>
        </div>

        {/* Search & Category Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari tagihan (kos, wifi, halo, pln, no pelanggan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bill Cards Grid */}
      {filteredBills.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {bills.length === 0
              ? "Belum Ada Catatan Tagihan Rutin"
              : "Tidak Ada Tagihan yang Cocok"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {bills.length === 0
              ? "Tambahkan kewajiban bulanan Anda seperti kos, wifi, kartu halo, dan listrik untuk memantau jatuh tempo secara otomatis."
              : "Coba ubah kata kunci pencarian atau ganti filter tab di atas."}
          </p>
          {bills.length === 0 && (
            <button
              onClick={() => {
                setEditingBill(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Tagihan Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBills.map((bill) => {
            const isPaid = bill.lastPaidPeriod === activePeriod;
            const diffDays = bill.dueDay - todayDay;
            const isOverdue = !isPaid && diffDays < 0;
            const isDueSoon = !isPaid && diffDays >= 0 && diffDays <= (bill.reminderDaysBefore || 3);
            const isHistoryExpanded = expandedHistoryId === bill.id;
            const defaultAcc = accounts.find((a) => a.id === bill.defaultAccountId);

            return (
              <div
                key={bill.id}
                className={`rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
                  isPaid
                    ? "border-emerald-200/80 dark:border-emerald-900/50"
                    : isOverdue
                    ? "border-rose-200 dark:border-rose-900/60"
                    : isDueSoon
                    ? "border-amber-200 dark:border-amber-900/60"
                    : "border-slate-200/80 dark:border-slate-800"
                }`}
              >
                {/* Card Top / Body */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left Icon & Info */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: bill.color || "#6366F1" }}
                      >
                        <DynamicIcon name={bill.icon || "Receipt"} className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                            {bill.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {bill.category}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            Tgl {bill.dueDay} / bln
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Three dots menu */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(openMenuId === bill.id ? null : bill.id)
                        }
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === bill.id && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-8 z-30 w-36 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 animate-scale-in text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setEditingBill(bill);
                                setIsModalOpen(true);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Edit Tagihan</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDelete(bill);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Tagihan</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount & Status Banner */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Nominal Tagihan
                      </span>
                      <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                        {formatIDR(bill.amount, isBalanceHidden)}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lunas</span>
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 animate-pulse shadow-sm">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Terlewat {Math.abs(diffDays)} Hari</span>
                        </span>
                      ) : isDueSoon ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 shadow-sm">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{diffDays === 0 ? "Hari Ini" : `${diffDays} Hari Lagi`}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tgl {bill.dueDay}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes / Rekening Snippet (With 1-click Copy) */}
                  {bill.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 truncate pr-2 text-[11px]">
                        {bill.notes}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(bill.notes!, bill.id)}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0"
                        title="Salin Catatan"
                      >
                        {copiedId === bill.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Default wallet info */}
                  {defaultAcc && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <Wallet className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Akun Default: {defaultAcc.name}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-slate-50/70 dark:bg-slate-850/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  {/* History Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedHistoryId(
                        isHistoryExpanded ? null : bill.id
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Riwayat ({bill.paymentHistory?.length || 0})</span>
                    {isHistoryExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {/* Action: Bayar Sekarang or Batalkan Lunas */}
                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <button
                        type="button"
                        onClick={() => handleUnpay(bill)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                        title="Batalkan status lunas bulan ini"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Batalkan</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPayingBill(bill);
                          setIsPayModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 active:scale-98 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Bayar Sekarang</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Payment History Log */}
                {isHistoryExpanded && (
                  <div className="p-3 bg-slate-100/70 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 space-y-2 animate-scale-in text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                      Jejak Pembayaran Sebelumnya:
                    </span>
                    {bill.paymentHistory && bill.paymentHistory.length > 0 ? (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {bill.paymentHistory.map((hist) => (
                          <div
                            key={hist.id}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-[11px]"
                          >
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-100 block">
                                Periode {hist.period} • {formatDateOnly(hist.paidDate)}
                              </span>
                              {hist.accountName && (
                                <span className="text-slate-500 text-[10px]">
                                  via {hist.accountName}
                                </span>
                              )}
                              {hist.notes && (
                                <span className="text-slate-400 text-[10px] block">
                                  {hist.notes}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {formatIDR(hist.amount, isBalanceHidden)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic py-1">
                        Belum ada riwayat pembayaran tercatat untuk tagihan ini.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Bill Modal */}
      <BillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editBill={editingBill}
      />

      {/* Pay Confirmation Modal */}
      <BillPaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        bill={payingBill}
        period={activePeriod}
      />
    </div>
  );
};
