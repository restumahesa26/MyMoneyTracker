"use client";

import React, { useState, useEffect } from "react";
import { Debt } from "@/types";
import { formatIDR } from "@/lib/formatters";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { X, CheckCircle, HandCoins, Calendar, FileText, Info } from "lucide-react";
import { toast } from "sonner";
import { useFinance } from "@/context/FinanceContext";

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

export const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({
  isOpen,
  onClose,
  debt,
}) => {
  const { recordDebtPayment } = useFinance();
  const [amountRaw, setAmountRaw] = useState("");
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && debt) {
      // Default amount to monthlyInstallment if exists, or remainingAmount
      const defaultAmt = debt.monthlyInstallment
        ? Math.min(debt.monthlyInstallment, debt.remainingAmount)
        : debt.remainingAmount;
      setAmountRaw(defaultAmt.toString());
      setDate(new Date().toISOString().substring(0, 10));
      setNotes("");
    }
  }, [isOpen, debt]);

  if (!isOpen || !debt) return null;

  const currentAmount = parseFloat(amountRaw.replace(/[^0-9]/g, "")) || 0;
  const newRemaining = Math.max(0, debt.remainingAmount - currentAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount <= 0) {
      toast.error("Nominal pembayaran harus lebih dari 0");
      return;
    }

    if (currentAmount > debt.remainingAmount) {
      const confirmOver = confirm(
        `Nominal bayar (${formatIDR(currentAmount)}) lebih besar dari sisa hutang (${formatIDR(debt.remainingAmount)}). Tetap lanjutkan?`
      );
      if (!confirmOver) return;
    }

    setSubmitting(true);
    try {
      await recordDebtPayment(debt.id, currentAmount, notes.trim(), date);
      toast.success("Pembayaran hutang berhasil dicatat!");
      onClose();
    } catch (err: any) {
      toast.error("Gagal mencatat pembayaran: " + (err?.message || "Kesalahan tidak diketahui"));
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

        {/* Modal Content */}
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-scale-in max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <HandCoins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Catat Pembayaran
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-[220px]">
                  {debt.title} ({debt.lenderName})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Info Box: Sisa Hutang Saat Ini */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Sisa Hutang Saat Ini:</span>
                <p className="text-base font-black text-rose-600 dark:text-rose-400">
                  {formatIDR(debt.remainingAmount)}
                </p>
              </div>
              {debt.monthlyInstallment ? (
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-medium">Cicilan / Bulan:</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {formatIDR(debt.monthlyInstallment)}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Input Nominal */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nominal Pembayaran (Rp) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={amountRaw ? Number(amountRaw).toLocaleString("id-ID") : ""}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, "");
                    setAmountRaw(clean);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Quick Pick Buttons */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                {debt.monthlyInstallment && debt.monthlyInstallment <= debt.remainingAmount && (
                  <button
                    type="button"
                    onClick={() => setAmountRaw(debt.monthlyInstallment!.toString())}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 shrink-0"
                  >
                    1x Cicilan ({formatIDR(debt.monthlyInstallment)})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAmountRaw(debt.remainingAmount.toString())}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 shrink-0"
                >
                  Lunasi Penuh ({formatIDR(debt.remainingAmount)})
                </button>
                {debt.remainingAmount > 100000 && (
                  <button
                    type="button"
                    onClick={() => setAmountRaw(Math.round(debt.remainingAmount / 2).toString())}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 shrink-0"
                  >
                    50% Sisa
                  </button>
                )}
              </div>
            </div>

            {/* Estimasi Sisa Setelah Pembayaran */}
            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Sisa setelah pembayaran:</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300">
                {newRemaining === 0 ? "Lunas 🎉" : formatIDR(newRemaining)}
              </span>
            </div>

            {/* Input Tanggal */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Pembayaran *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Catatan / Keterangan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Cicilan ke-4 via transfer BCA"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Disclaimer Information */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                Catatan: Pembayaran ini akan memperbarui status dan sisa hutang tanpa memotong saldo dompet Anda secara otomatis.
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || currentAmount <= 0}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Simpan Pembayaran"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};
