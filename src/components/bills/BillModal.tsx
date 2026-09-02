"use client";

import React, { useState, useEffect } from "react";
import { RecurringBill } from "@/types";
import { formatIDR } from "@/lib/formatters";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { useFinance } from "@/context/FinanceContext";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { AVAILABLE_ICONS, COLOR_PALETTE } from "@/lib/constants";
import {
  X,
  Plus,
  Receipt,
  Calendar,
  Wallet,
  FileText,
  Bell,
  Sparkles,
  Tag,
  Palette,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  editBill?: RecurringBill | null;
}

const PRESET_TEMPLATES = [
  {
    label: "Bayar Kos",
    name: "Sewa Kos Bulanan",
    category: "Tempat Tinggal / Kos",
    icon: "Home",
    color: "#6366F1",
    dueDay: 5,
    amount: 1500000,
    notes: "Transfer ke rekening ibu kos: ",
  },
  {
    label: "Wifi Internet",
    name: "Wifi Biznet / Indihome",
    category: "Internet & Wifi",
    icon: "Wifi",
    color: "#0284C7",
    dueDay: 15,
    amount: 375000,
    notes: "ID Pelanggan: ",
  },
  {
    label: "Kartu Halo",
    name: "Pascabayar Kartu Halo",
    category: "Telekomunikasi",
    icon: "Smartphone",
    color: "#E11D48",
    dueDay: 20,
    amount: 150000,
    notes: "No Telkomsel Halo: 0811-",
  },
  {
    label: "Listrik PLN",
    name: "Listrik PLN Token/Tagihan",
    category: "Tagihan & Utilitas",
    icon: "Zap",
    color: "#F59E0B",
    dueDay: 10,
    amount: 350000,
    notes: "No Meter PLN: ",
  },
  {
    label: "Netflix / Spotify",
    name: "Netflix Premium 4K",
    category: "Hiburan & Streaming",
    icon: "Tv",
    color: "#EC4899",
    dueDay: 28,
    amount: 186000,
    notes: "Paket 4 Layar Bersama",
  },
  {
    label: "BPJS Kesehatan",
    name: "Iuran BPJS Kesehatan",
    category: "Kesehatan & Medis",
    icon: "HeartPulse",
    color: "#10B981",
    dueDay: 10,
    amount: 100000,
    notes: "No VA BPJS: ",
  },
  {
    label: "Air PDAM",
    name: "Air PDAM",
    category: "Tagihan & Utilitas",
    icon: "Receipt",
    color: "#06B6D4",
    dueDay: 15,
    amount: 120000,
    notes: "No Sambungan PDAM: ",
  },
];

const BILL_CATEGORIES = [
  "Tempat Tinggal / Kos",
  "Internet & Wifi",
  "Telekomunikasi",
  "Tagihan & Utilitas",
  "Hiburan & Streaming",
  "Kesehatan & Medis",
  "Cicilan & Pinjaman",
  "Pendidikan",
  "Lainnya",
];

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  editBill = null,
}) => {
  const { accounts, addBill, updateBill } = useFinance();

  const [name, setName] = useState("");
  const [amountRaw, setAmountRaw] = useState("");
  const [dueDay, setDueDay] = useState(1);
  const [category, setCategory] = useState(BILL_CATEGORIES[0]);
  const [defaultAccountId, setDefaultAccountId] = useState("");
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [notes, setNotes] = useState("");
  const [icon, setIcon] = useState("Receipt");
  const [color, setColor] = useState("#6366F1");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editBill) {
        setName(editBill.name);
        setAmountRaw(editBill.amount ? editBill.amount.toString() : "");
        setDueDay(editBill.dueDay || 1);
        setCategory(editBill.category || BILL_CATEGORIES[0]);
        setDefaultAccountId(editBill.defaultAccountId || "");
        setReminderDaysBefore(editBill.reminderDaysBefore || 3);
        setNotes(editBill.notes || "");
        setIcon(editBill.icon || "Receipt");
        setColor(editBill.color || "#6366F1");
      } else {
        setName("");
        setAmountRaw("");
        setDueDay(5);
        setCategory(BILL_CATEGORIES[0]);
        setDefaultAccountId(accounts[0]?.id || "");
        setReminderDaysBefore(3);
        setNotes("");
        setIcon("Home");
        setColor("#6366F1");
      }
      setShowIconPicker(false);
    }
  }, [isOpen, editBill, accounts]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setIcon(preset.icon);
    setColor(preset.color);
    setDueDay(preset.dueDay);
    if (!amountRaw) {
      setAmountRaw(preset.amount.toString());
    }
    if (!notes) {
      setNotes(preset.notes);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9]/g, "");
    setAmountRaw(clean);
  };

  const setPresetAmount = (val: number) => {
    setAmountRaw(val.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama tagihan tidak boleh kosong");
      return;
    }

    const amount = parseFloat(amountRaw.replace(/[^0-9]/g, "")) || 0;
    if (amount <= 0) {
      toast.error("Nominal tagihan harus lebih dari 0");
      return;
    }

    if (dueDay < 1 || dueDay > 31) {
      toast.error("Tanggal jatuh tempo harus antara 1 sampai 31");
      return;
    }

    setSubmitting(true);
    try {
      if (editBill) {
        await updateBill(editBill.id, {
          name: name.trim(),
          amount,
          dueDay,
          category,
          defaultAccountId: defaultAccountId || undefined,
          reminderDaysBefore,
          notes: notes.trim() || undefined,
          icon,
          color,
        });
        toast.success("Tagihan berhasil diperbarui!");
      } else {
        await addBill({
          name: name.trim(),
          amount,
          dueDay,
          frequency: "MONTHLY",
          category,
          defaultAccountId: defaultAccountId || undefined,
          reminderDaysBefore,
          notes: notes.trim() || undefined,
          icon,
          color,
        });
        toast.success("Tagihan bulanan baru berhasil ditambahkan!");
      }
      onClose();
    } catch (err: any) {
      toast.error("Gagal menyimpan tagihan: " + (err?.message || ""));
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
        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-scale-in max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: color }}
              >
                <DynamicIcon name={icon} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {editBill ? "Edit Tagihan Rutin" : "Tambah Tagihan Bulanan"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {editBill
                    ? "Perbarui rincian pengeluaran rutin Anda"
                    : "Kelola kewajiban bulanan agar tidak terlewat"}
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

          {/* Quick Preset Buttons (Shown when adding new) */}
          {!editBill && (
            <div className="pt-3 pb-1">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Template Cepat 1-Klik:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                {PRESET_TEMPLATES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Nama Tagihan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Tagihan / Pengeluaran *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Sewa Kos Bulanan, Wifi Biznet, Kartu Halo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              />
            </div>

            {/* Nominal */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nominal Pembayaran *
                </label>
                {amountRaw && (
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {formatIDR(parseFloat(amountRaw) || 0)}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={amountRaw ? parseInt(amountRaw, 10).toLocaleString("id-ID") : ""}
                  onChange={handleAmountChange}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              {/* Quick Nominal Presets */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1 scrollbar-none">
                {[50000, 100000, 350000, 500000, 1000000, 1500000, 2500000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPresetAmount(val)}
                    className="shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    {val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                  </button>
                ))}
              </div>
            </div>

            {/* Tanggal Jatuh Tempo & Pengingat */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Jatuh Tempo (Tgl) *</span>
                </label>
                <div className="relative">
                  <select
                    value={dueDay}
                    onChange={(e) => setDueDay(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        Tanggal {day} setiap bulan
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pengingat Sebelum</span>
                </label>
                <select
                  value={reminderDaysBefore}
                  onChange={(e) => setReminderDaysBefore(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  <option value={1}>H-1 Hari</option>
                  <option value={2}>H-2 Hari</option>
                  <option value={3}>H-3 Hari</option>
                  <option value={5}>H-5 Hari</option>
                  <option value={7}>H-7 Hari (1 Minggu)</option>
                </select>
              </div>
            </div>

            {/* Kategori & Dompet Default */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kategori Tagihan</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  {BILL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dompet Pembayar (Default)</span>
                </label>
                <select
                  value={defaultAccountId}
                  onChange={(e) => setDefaultAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  <option value="">-- Bebas / Pilih Nanti --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catatan / No Pelanggan / Rekening */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Catatan / No Pelanggan / Rekening Tujuan</span>
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: No Pelanggan 1029384756, transfer ke rekening BCA Ibu Kos 8830129841"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
              />
            </div>

            {/* Custom Icon & Color Accordion */}
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-full py-1.5 flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Kustomisasi Ikon & Warna Tampilan</span>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {showIconPicker ? "Tutup" : "Ubah"}
                </span>
              </button>

              {showIconPicker && (
                <div className="p-3 mt-2 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3 animate-scale-in">
                  {/* Colors */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                      Pilihan Warna:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                          style={{
                            backgroundColor: c,
                            borderColor: color === c ? "#ffffff" : "transparent",
                          }}
                        >
                          {color === c && <Check className="w-3 h-3 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Icons */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                      Pilihan Ikon:
                    </span>
                    <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1">
                      {AVAILABLE_ICONS.map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setIcon(ic)}
                          className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                            icon === ic
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          <DynamicIcon name={ic} className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit buttons */}
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-98 transition-all disabled:opacity-50"
              >
                <span>{submitting ? "Menyimpan..." : editBill ? "Simpan Perubahan" : "Tambah Tagihan"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};
