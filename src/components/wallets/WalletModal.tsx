"use client";

import React, { useState, useEffect } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Account, AccountType } from "@/types";
import { formatIDR } from "@/lib/formatters";
import { COLOR_PALETTE, AVAILABLE_ICONS } from "@/lib/constants";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { X, Wallet, CreditCard, Landmark, Smartphone, PiggyBank } from "lucide-react";
import { toast } from "sonner";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAccount?: Account | null;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  editAccount = null,
}) => {
  const { addAccount, updateAccount } = useFinance();

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("BANK");
  const [balanceRaw, setBalanceRaw] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [color, setColor] = useState("#2563EB");
  const [icon, setIcon] = useState("Landmark");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editAccount) {
        setName(editAccount.name);
        setType(editAccount.type);
        setBalanceRaw(editAccount.balance.toString());
        setAccountNumber(editAccount.accountNumber || "");
        setColor(editAccount.color);
        setIcon(editAccount.icon);
      } else {
        setName("");
        setType("BANK");
        setBalanceRaw("");
        setAccountNumber("");
        setColor(COLOR_PALETTE[0]);
        setIcon("Landmark");
      }
    }
  }, [isOpen, editAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama dompet / akun tidak boleh kosong");
      return;
    }

    const balance = parseFloat(balanceRaw.replace(/[^0-9]/g, "")) || 0;
    setSubmitting(true);

    try {
      if (editAccount) {
        await updateAccount(editAccount.id, {
          name: name.trim(),
          type,
          balance,
          accountNumber: accountNumber.trim() || undefined,
          color,
          icon,
        });
        toast.success("Dompet / Akun berhasil diperbarui");
      } else {
        await addAccount({
          name: name.trim(),
          type,
          balance,
          accountNumber: accountNumber.trim() || undefined,
          color,
          icon,
        });
        toast.success("Dompet / Akun baru berhasil ditambahkan");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan akun");
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
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: color }}
              >
                <DynamicIcon name={icon} className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {editAccount ? "Edit Dompet / Rekening" : "Tambah Dompet Baru"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Atur akun bank, e-wallet, atau kas tunai Anda
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

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Dompet / Rekening <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Contoh: Bank BCA, Gopay Utama, Uang Saku..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tipe Akun
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="BANK">Bank Transfer (BCA, Mandiri, BRI, dll)</option>
                <option value="E_WALLET">E-Wallet (GoPay, OVO, Dana, ShopeePay)</option>
                <option value="CASH">Uang Tunai / Cash Fisik</option>
                <option value="CREDIT">Kartu Kredit / Paylater</option>
                <option value="INVESTMENT">Investasi (Bibit, Stockbit, dll)</option>
              </select>
            </div>

            {/* Balance */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Saldo Awal (IDR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={
                    balanceRaw
                      ? Number(balanceRaw.replace(/[^0-9]/g, "")).toLocaleString("id-ID")
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setBalanceRaw(val);
                  }}
                  className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor Rekening / Catatan Nomor (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: 8830129841"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih Warna Tema
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-xl transition-transform ${
                      color === c ? "scale-125 ring-2 ring-indigo-500 ring-offset-2" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih Ikon
              </label>
              <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1">
                {[
                  "Landmark",
                  "Building2",
                  "Smartphone",
                  "Zap",
                  "Wallet",
                  "CreditCard",
                  "PiggyBank",
                  "DollarSign",
                  "Store",
                  "Briefcase",
                  "Shield",
                  "Sparkles",
                ].map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-2 rounded-xl flex items-center justify-center border transition-all ${
                      icon === iconName
                        ? "bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                    }`}
                  >
                    <DynamicIcon name={iconName} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
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
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : editAccount ? "Simpan Perubahan" : "Tambah Dompet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};
