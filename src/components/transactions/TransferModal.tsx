"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useFinance } from "@/context/FinanceContext";
import { formatIDR } from "@/lib/formatters";
import { ModalPortal } from "@/components/ui/ModalPortal";
import {
  X,
  ArrowRightLeft,
  Calendar,
  FileText,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { accounts, transferFunds } = useFinance();

  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [amountRaw, setAmountRaw] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [description, setDescription] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && accounts.length >= 2) {
      setFromAccountId(accounts[0].id);
      setToAccountId(accounts[1].id);
      setAmountRaw("");
      setDateStr(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      setDescription("");
    }
  }, [isOpen, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountRaw.replace(/[^0-9]/g, ""));
    if (!amount || amount <= 0) {
      toast.error("Silakan masukkan nominal transfer yang valid");
      return;
    }

    if (fromAccountId === toAccountId) {
      toast.error("Dompet asal dan tujuan transfer tidak boleh sama");
      return;
    }

    const sourceAcc = accounts.find((a) => a.id === fromAccountId);
    if (sourceAcc && sourceAcc.balance < amount) {
      toast.warning("Peringatan: Saldo dompet asal kurang dari nominal transfer!");
    }

    setSubmitting(true);
    try {
      await transferFunds(
        fromAccountId,
        toAccountId,
        amount,
        description.trim() || undefined,
        dateStr
      );
      toast.success("Transfer antar dompet berhasil dicatat!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal melakukan transfer");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-md max-h-[90vh] my-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-scale-in">
          {/* Header */}
          <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Transfer Antar Dompet
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pindahkan saldo antar rekening / e-wallet
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Source and Destination Accounts */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Dari Dompet Asal</span>
                </label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
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

              <div className="flex justify-center -my-1">
                <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ke Dompet Tujuan</span>
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                      {acc.name} ({formatIDR(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nominal Transfer (IDR) <span className="text-rose-500">*</span>
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
                  className="w-full pl-12 pr-4 py-2.5 text-base font-bold rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tanggal & Waktu Transfer</span>
              </label>
              <input
                type="datetime-local"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Catatan Transfer (Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Top up e-wallet, Pindah saldo tabungan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/80">
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
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                {submitting ? "Memproses..." : "Kirim Transfer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};
