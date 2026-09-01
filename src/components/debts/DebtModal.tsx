"use client";

import React, { useState, useEffect } from "react";
import { Debt, DebtType } from "@/types";
import { formatIDR } from "@/lib/formatters";
import { ModalPortal } from "@/components/ui/ModalPortal";
import {
  X,
  CreditCard,
  Building2,
  Users,
  Smartphone,
  Calendar,
  DollarSign,
  FileText,
  Bookmark,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useFinance } from "@/context/FinanceContext";

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  editDebt?: Debt | null;
}

const DEBT_CATEGORIES = [
  { name: "Paylater & Fintech", icon: Smartphone },
  { name: "Pinjaman Bank / KTA", icon: Building2 },
  { name: "Kartu Kredit", icon: CreditCard },
  { name: "Keluarga & Teman", icon: Users },
  { name: "Cicilan Gadget & Kendaraan", icon: Bookmark },
  { name: "Lainnya", icon: FileText },
];

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  editDebt = null,
}) => {
  const { addDebt, updateDebt } = useFinance();

  const [type, setType] = useState<DebtType>("DEBT");
  const [title, setTitle] = useState("");
  const [lenderName, setLenderName] = useState("");
  const [category, setCategory] = useState(DEBT_CATEGORIES[0].name);
  const [originalAmountRaw, setOriginalAmountRaw] = useState("");
  const [remainingAmountRaw, setRemainingAmountRaw] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [monthlyInstallmentRaw, setMonthlyInstallmentRaw] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editDebt) {
        setType(editDebt.type);
        setTitle(editDebt.title);
        setLenderName(editDebt.lenderName);
        setCategory(editDebt.category || DEBT_CATEGORIES[0].name);
        setOriginalAmountRaw(editDebt.originalAmount.toString());
        setRemainingAmountRaw(editDebt.remainingAmount.toString());
        setDueDate(editDebt.dueDate || "");
        setMonthlyInstallmentRaw(
          editDebt.monthlyInstallment ? editDebt.monthlyInstallment.toString() : ""
        );
        setReferenceNumber(editDebt.referenceNumber || "");
        setNotes(editDebt.notes || "");
      } else {
        setType("DEBT");
        setTitle("");
        setLenderName("");
        setCategory(DEBT_CATEGORIES[0].name);
        setOriginalAmountRaw("");
        setRemainingAmountRaw("");
        // Default due date to end of current month
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setDueDate(nextMonth.toISOString().substring(0, 10));
        setMonthlyInstallmentRaw("");
        setReferenceNumber("");
        setNotes("");
      }
    }
  }, [isOpen, editDebt]);

  // When original amount changes in "New" mode, auto-fill remaining amount if empty
  const handleOriginalAmountChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setOriginalAmountRaw(clean);
    if (!editDebt && (!remainingAmountRaw || remainingAmountRaw === originalAmountRaw)) {
      setRemainingAmountRaw(clean);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Nama / Judul hutang tidak boleh kosong");
      return;
    }

    if (!lenderName.trim()) {
      toast.error(
        type === "DEBT"
          ? "Nama pihak pemberi pinjaman (bayar ke siapa) harus diisi"
          : "Nama peminjam harus diisi"
      );
      return;
    }

    const originalAmount = parseFloat(originalAmountRaw.replace(/[^0-9]/g, "")) || 0;
    if (originalAmount <= 0) {
      toast.error("Total pokok hutang harus lebih dari 0");
      return;
    }

    const remainingAmount =
      remainingAmountRaw !== ""
        ? parseFloat(remainingAmountRaw.replace(/[^0-9]/g, "")) || 0
        : originalAmount;

    if (remainingAmount > originalAmount) {
      toast.error("Sisa hutang tidak boleh lebih besar dari total pokok hutang");
      return;
    }

    if (!dueDate) {
      toast.error("Tanggal jatuh tempo harus ditentukan");
      return;
    }

    const monthlyInstallment = monthlyInstallmentRaw
      ? parseFloat(monthlyInstallmentRaw.replace(/[^0-9]/g, "")) || undefined
      : undefined;

    setSubmitting(true);

    try {
      if (editDebt) {
        await updateDebt(editDebt.id, {
          title: title.trim(),
          type,
          lenderName: lenderName.trim(),
          category,
          originalAmount,
          remainingAmount,
          dueDate,
          monthlyInstallment,
          referenceNumber: referenceNumber.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        toast.success("Catatan hutang berhasil diperbarui");
      } else {
        const paid = Math.max(0, originalAmount - remainingAmount);
        await addDebt({
          title: title.trim(),
          type,
          lenderName: lenderName.trim(),
          category,
          originalAmount,
          remainingAmount,
          paidAmount: paid,
          dueDate,
          monthlyInstallment,
          referenceNumber: referenceNumber.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        toast.success("Catatan hutang baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err: any) {
      toast.error("Gagal menyimpan data: " + (err?.message || "Kesalahan tidak terduga"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-scale-in max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {editDebt ? "Edit Catatan Hutang" : "Tambah Catatan Hutang Baru"}
              </h3>
              <p className="text-xs text-slate-500">
                Catat informasi hutang, bayar ke siapa, dan tanggal jatuh tempo
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Tipe: Hutang Saya vs Piutang */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setType("DEBT")}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  type === "DEBT"
                    ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Hutang Saya (Wajib Bayar)</span>
              </button>
              <button
                type="button"
                onClick={() => setType("RECEIVABLE")}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  type === "RECEIVABLE"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Piutang (Orang Pinjam)</span>
              </button>
            </div>

            {/* Judul Hutang */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama / Judul Hutang *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Cicilan Laptop ASUS ROG, Pinjaman Teman, Shopee Paylater"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Pihak Pemberi Hutang (Bayar Ke Siapa / Dari Siapa) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {type === "DEBT" ? "Bayar Ke Siapa / Pihak Pemberi Pinjaman *" : "Nama Peminjam / Dari Siapa *"}
              </label>
              <input
                type="text"
                required
                placeholder={type === "DEBT" ? "Contoh: Bank BCA, Budi Santoso, Shopee Paylater" : "Contoh: Rian Pratama"}
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Kategori Hutang */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Kategori Hutang
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {DEBT_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Pokok Pinjaman & Sisa Hutang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Pokok Pinjaman (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="0"
                    value={originalAmountRaw ? Number(originalAmountRaw).toLocaleString("id-ID") : ""}
                    onChange={(e) => handleOriginalAmountChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sisa Hutang Saat Ini (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="0"
                    value={remainingAmountRaw ? Number(remainingAmountRaw).toLocaleString("id-ID") : ""}
                    onChange={(e) => setRemainingAmountRaw(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Tanggal Jatuh Tempo & Cicilan Bulanan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Tanggal Jatuh Tempo *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Cicilan / Bulan (Opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    placeholder="0"
                    value={
                      monthlyInstallmentRaw
                        ? Number(monthlyInstallmentRaw).toLocaleString("id-ID")
                        : ""
                    }
                    onChange={(e) =>
                      setMonthlyInstallmentRaw(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Nomor Referensi / Virtual Account / No. Kontrak */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No. Rekening / No. Kontrak / Virtual Account (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: No. Kontrak: KTA-9821 / VA BCA: 88081290312"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Catatan / Perjanjian */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Tenor 6 bulan, sisa 2 bulan lagi. Autodebet tiap tanggal 15."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : editDebt ? "Perbarui Hutang" : "Simpan Hutang"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};
