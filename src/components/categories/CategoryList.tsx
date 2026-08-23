"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Category } from "@/types";
import { formatIDR } from "@/lib/formatters";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { CategoryModal } from "./CategoryModal";
import {
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { toast } from "sonner";

export const CategoryList: React.FC = () => {
  const { categories, deleteCategory, loadDefaultCategoriesToReal } = useFinance();
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const displayedCategories = categories.filter((c) => c.type === activeTab);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
      try {
        await deleteCategory(id);
        toast.success(`Kategori "${name}" berhasil dihapus`);
      } catch (err) {
        toast.error("Gagal menghapus kategori");
      }
    }
    setActiveMenuId(null);
  };

  const handleEdit = (cat: Category) => {
    setEditingCat(cat);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleAddNew = () => {
    setEditingCat(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header, Tab Filter & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Manajemen Kategori & Budget
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola kategori pemasukan & pengeluaran serta batas anggaran bulanan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50">
            <button
              onClick={() => setActiveTab("EXPENSE")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "EXPENSE"
                  ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Pengeluaran ({categories.filter((c) => c.type === "EXPENSE").length})
            </button>
            <button
              onClick={() => setActiveTab("INCOME")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "INCOME"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Pemasukan ({categories.filter((c) => c.type === "INCOME").length})
            </button>
          </div>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Grid of Category Cards or Empty State */}
      {displayedCategories.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Belum Ada Kategori {activeTab === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Buat kategori kustom Anda atau gunakan template kategori standar bawaan aplikasi.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kategori Baru</span>
            </button>
            <button
              onClick={async () => {
                await loadDefaultCategoriesToReal();
                toast.success("Kategori standar berhasil dimuat!");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
            >
              <span>Muat Kategori Bawaan</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all flex items-center justify-between gap-3 group relative"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: cat.color }}
                >
                  <DynamicIcon name={cat.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {cat.name}
                  </h4>
                  {cat.budgetLimit && cat.budgetLimit > 0 ? (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Budget: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatIDR(cat.budgetLimit)}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400">Tanpa batas budget</p>
                  )}
                </div>
              </div>

              {/* Menu */}
              <div className="relative shrink-0">
                <button
                  onClick={() =>
                    setActiveMenuId(activeMenuId === cat.id ? null : cat.id)
                  }
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenuId === cat.id && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setActiveMenuId(null)}
                    />
                    <div className="absolute right-0 mt-1 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-scale-in">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
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
          ))}
        </div>
      )}

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCat(null);
        }}
        editCategory={editingCat}
        initialType={activeTab}
      />
    </div>
  );
};
