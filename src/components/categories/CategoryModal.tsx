"use client";

import React, { useState, useEffect } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Category } from "@/types";
import { COLOR_PALETTE, AVAILABLE_ICONS } from "@/lib/constants";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { X, Layers, Target } from "lucide-react";
import { toast } from "sonner";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCategory?: Category | null;
  initialType?: "EXPENSE" | "INCOME";
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  editCategory = null,
  initialType = "EXPENSE",
}) => {
  const { addCategory, updateCategory } = useFinance();

  const [name, setName] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">(initialType);
  const [budgetLimitRaw, setBudgetLimitRaw] = useState("");
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [icon, setIcon] = useState("Utensils");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editCategory) {
        setName(editCategory.name);
        setType(editCategory.type);
        setBudgetLimitRaw(editCategory.budgetLimit ? editCategory.budgetLimit.toString() : "");
        setColor(editCategory.color);
        setIcon(editCategory.icon);
      } else {
        setName("");
        setType(initialType);
        setBudgetLimitRaw("");
        setColor(initialType === "INCOME" ? "#10B981" : "#F43F5E");
        setIcon(initialType === "INCOME" ? "Briefcase" : "Utensils");
      }
    }
  }, [isOpen, editCategory, initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama kategori tidak boleh kosong");
      return;
    }

    const budgetLimit = budgetLimitRaw
      ? parseFloat(budgetLimitRaw.replace(/[^0-9]/g, ""))
      : null;

    setSubmitting(true);

    try {
      if (editCategory) {
        await updateCategory(editCategory.id, {
          name: name.trim(),
          type,
          budgetLimit: type === "EXPENSE" ? budgetLimit : null,
          color,
          icon,
        });
        toast.success("Kategori berhasil diperbarui");
      } else {
        await addCategory({
          name: name.trim(),
          type,
          budgetLimit: type === "EXPENSE" ? budgetLimit : null,
          color,
          icon,
        });
        toast.success("Kategori baru berhasil ditambahkan");
      }
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan kategori");
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
                  {editCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sesuaikan ikon, warna, dan budget bulanan
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
            {/* Type Toggle */}
            {!editCategory && (
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setType("EXPENSE")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    type === "EXPENSE"
                      ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setType("INCOME")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    type === "INCOME"
                      ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Pemasukan
                </button>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Kategori <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Contoh: Makanan, Belanja, Investasi..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Budget Limit (Only for Expense) */}
            {type === "EXPENSE" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Batas Budget Bulanan (IDR)</span>
                  <span className="text-[11px] text-slate-400">Opsional</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0 (Tanpa batas)"
                    value={
                      budgetLimitRaw
                        ? Number(budgetLimitRaw.replace(/[^0-9]/g, "")).toLocaleString("id-ID")
                        : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setBudgetLimitRaw(val);
                    }}
                    className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
            )}

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih Warna
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
              <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-2xl">
                {AVAILABLE_ICONS.map((iconName) => (
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
                {submitting ? "Menyimpan..." : editCategory ? "Simpan Perubahan" : "Tambah Kategori"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};
