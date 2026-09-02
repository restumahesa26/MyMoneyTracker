"use client";

import React, { useState, useEffect } from "react";
import { RecurringBill } from "@/types";
import { formatIDR } from "@/lib/formatters";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { useFinance } from "@/context/FinanceContext";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import {
  X,
  CheckCircle2,
  Calendar,
  Wallet,
  FileText,
  CreditCard,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

interface BillPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: RecurringBill | null;
  period: string; // e.g. "2026-09"
}

export const BillPaymentModal: React.FC<BillPaymentModalProps> = ({
  isOpen,
  onClose,
  bill,
  period,
}) => {
  const { accounts, payBill, isBalanceHidden } = useFinance();

  const [paymentDate, setPaymentDate] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [createTransaction, setCreateTransaction] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && bill) {
      setPaymentDate(format(new Date(), "yyyy-MM-dd"));
      // Default to bill's default account, or first available account
      const defaultAcc = bill.defaultAccountId
        ? accounts.find((a) => a.id === bill.defaultAccountId)
        : accounts[0];
      setSelectedAccountId(defaultAcc ? defaultAcc.id : "");
      setCreateTransaction(true);
      setNotes(`Bayar ${bill.name} periode ${period}`);
    }
  }, [isOpen, bill, period, accounts]);

  if (!isOpen || !bill) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill) return;

    if (createTransaction && !selectedAccountId) {
      toast.error("Silakan pilih dompet / rekening sumber pembayaran");
      return;
    }

    setSubmitting(true);
    try {
      await payBill(bill.id, {
        amount: bill.amount,
        period,
        paidDate: paymentDate || format(new Date(), "yyyy-MM-dd"),
        accountId: createTransaction ? selectedAccountId : undefined,
        createTransaction,
        notes: notes.trim() || undefined,
      });

      toast.success(`Tagihan "${bill.name}" berhasil ditandai lunas!`, {
        description: createTransaction
          ? "Pengeluaran otomatis dipotong dari dompet terpilih."
          : "Status tagihan telah diperbarui.",
      });
      onClose();
    } catch (err: any) {
      toast.error("Gagal memproses pembayaran: " + (err?.message || ""));
    } finally {
      setSubmitting(false);
    }
  };

  const periodLabel = (() => {
    try {
      const [year, month] = period.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return format(date, "MMMM yyyy", { locale: localeId });
    } catch {
      return period;
    }
  })();

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Konfirmasi Bayar Tagihan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Periode {periodLabel}
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

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Bill Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: bill.color || "#6366F1" }}
                >
                  <DynamicIcon name={bill.icon || "Receipt"} className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {bill.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Jatuh tempo tgl {bill.dueDay} setiap bulan
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Nominal</span>
                <span className="text-base font-black text-rose-600 dark:text-rose-400">
                  {formatIDR(bill.amount, isBalanceHidden)}
                </span>
              </div>
            </div>

            {/* Tanggal Bayar */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal Pembayaran</span>
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              />
            </div>

            {/* Toggle Potong Saldo Otomatis */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createTransaction}
                  onChange={(e) => setCreateTransaction(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Potong Saldo Dompet & Catat Pengeluaran
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                    Secara otomatis mengurangi saldo akun dompet dan mencatat transaksi pengeluaran di buku kas.
                  </span>
                </div>
              </label>

              {createTransaction && (
                <div className="pt-2 border-t border-indigo-100/80 dark:border-indigo-900/40 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block">
                    Pilih Dompet Sumber Pembayaran:
                  </span>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    <option value="" disabled>
                      -- Pilih Dompet --
                    </option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (Saldo: {formatIDR(acc.balance, isBalanceHidden)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Catatan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Catatan Tambahan (Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Transfer via BCA, No Ref: 881923"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? "Menyimpan..." : "Tandai Lunas Sekarang"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};
