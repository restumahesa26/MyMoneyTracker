"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Account } from "@/types";
import { formatIDR } from "@/lib/formatters";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { WalletModal } from "./WalletModal";
import {
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Wallet,
  Building2,
  CreditCard,
  Smartphone,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";

export const WalletCardList: React.FC = () => {
  const { accounts, deleteAccount } = useFinance();
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (accounts.length <= 1) {
      toast.error("Minimal harus memiliki 1 akun/dompet aktif");
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus dompet "${name}"?`)) {
      try {
        await deleteAccount(id);
        toast.success(`Dompet "${name}" berhasil dihapus`);
      } catch (err) {
        toast.error("Gagal menghapus dompet");
      }
    }
    setActiveMenuId(null);
  };

  const handleEdit = (acc: Account) => {
    setEditingAcc(acc);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleAddNew = () => {
    setEditingAcc(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Daftar Dompet & Rekening
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola saldo dan mutasi akun keuangan Anda
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Dompet</span>
        </button>
      </div>

      {/* Grid of Cards or Empty State */}
      {accounts.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Belum Ada Dompet atau Rekening
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Anda sedang menggunakan mode data real. Silakan tambahkan rekening bank, e-wallet, atau kas tunai pertama Anda untuk mulai mengelola saldo.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dompet Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
          return (
            <div
              key={acc.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Subtle top color strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: acc.color }}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: acc.color }}
                    >
                      <DynamicIcon name={acc.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {acc.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {acc.type === "BANK"
                          ? "Bank Transfer"
                          : acc.type === "E_WALLET"
                          ? "E-Wallet"
                          : acc.type === "CASH"
                          ? "Kas Tunai"
                          : acc.type === "CREDIT"
                          ? "Kartu Kredit"
                          : "Investasi"}
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenuId(activeMenuId === acc.id ? null : acc.id)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === acc.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setActiveMenuId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-scale-in">
                          <button
                            onClick={() => handleEdit(acc)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(acc.id, acc.name)}
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

                {acc.accountNumber && (
                  <p className="text-xs text-slate-400 tracking-wider font-mono mb-2">
                    No: {acc.accountNumber}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Saldo Saat Ini
                </span>
                <p className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                  {formatIDR(acc.balance)}
                </p>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Modal */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAcc(null);
        }}
        editAccount={editingAcc}
      />
    </div>
  );
};
