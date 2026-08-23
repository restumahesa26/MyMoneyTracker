"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { useFinance } from "@/context/FinanceContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { DataSourceMode } from "@/types";
import {
  Settings,
  Moon,
  Sun,
  Laptop,
  Database,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  Cloud,
  FileCode2,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, isDemo, logout } = useAuth();
  const {
    dataSource,
    setDataSource,
    resetToDefaultJSON,
    resetToDemoData,
    exportDataJSON,
    exportDataCSV,
    importDataJSON,
  } = useFinance();

  const [importJsonText, setImportJsonText] = useState("");
  const [showImportBox, setShowImportBox] = useState(false);

  const handleDownloadJSON = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `money_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File backup JSON berhasil diunduh!");
  };

  const handleDownloadCSV = () => {
    const csv = exportDataCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transaksi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File CSV berhasil diexport!");
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) {
      toast.error("Silakan tempel teks JSON cadangan");
      return;
    }
    const success = importDataJSON(importJsonText.trim());
    if (success) {
      toast.success("Data berhasil dipulihkan dari backup JSON!");
      setShowImportBox(false);
      setImportJsonText("");
    } else {
      toast.error("Format JSON tidak valid!");
    }
  };

  const handleResetDummyFromJSON = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin memulihkan data dummy ke versi default file src/data/dummyData.json?"
      )
    ) {
      resetToDefaultJSON();
      toast.success("Data dummy berhasil di-reset ke file dummyData.json!");
    }
  };

  const isConnectedToFirebase = isFirebaseConfigured();

  const handleSwitchDataSource = (mode: DataSourceMode) => {
    if (mode === "FIREBASE" && !isConnectedToFirebase) {
      toast.warning(
        "Kredensial Firebase di .env.local belum terisi lengkap, aplikasi akan otomatis menggunakan fallback aman."
      );
    }
    setDataSource(mode);
    toast.success(
      mode === "FIREBASE"
        ? "Sumber data beralih ke Real Cloud Firebase!"
        : "Sumber data beralih ke Dummy Data (JSON)!"
    );
  };

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            Pengaturan & Preferensi
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Atur sumber data (Firebase vs Dummy JSON), tema tampilan, dan cadangan data keuangan
        </p>
      </div>

      {/* 1. DATA SOURCE SELECTION (NEW FEATURE) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Pilihan Sumber Data (Data Source Mode)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih apakah aplikasi membaca data real dari Cloud Firebase atau data simulasi dummy dari JSON
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
              dataSource === "FIREBASE"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            Aktif: {dataSource === "FIREBASE" ? "Firebase Cloud" : "Dummy Data (JSON)"}
          </span>
        </div>

        {/* 2 Big Selectable Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Option A: Firebase Real Data */}
          <div
            onClick={() => handleSwitchDataSource("FIREBASE")}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              dataSource === "FIREBASE"
                ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-md"
                : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                      Data Real (Firebase Firestore)
                    </h4>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      Cloud Database Real-time
                    </span>
                  </div>
                </div>
                {dataSource === "FIREBASE" && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Menyimpan dan menyinkronkan seluruh transaksi, dompet, dan kategori secara live ke Google Cloud Firestore di bawah akun terautentikasi Anda.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                Status Firebase:{" "}
                <strong className={isConnectedToFirebase ? "text-emerald-500" : "text-amber-500"}>
                  {isConnectedToFirebase ? "Terkonfigurasi" : "Belum di .env"}
                </strong>
              </span>
              <button
                type="button"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {dataSource === "FIREBASE" ? "Sedang Digunakan" : "Pilih Mode Ini"}
              </button>
            </div>
          </div>

          {/* Option B: Dummy / Mock Data from JSON */}
          <div
            onClick={() => handleSwitchDataSource("LOCAL_DUMMY")}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              dataSource === "LOCAL_DUMMY"
                ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 shadow-md"
                : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                      Dummy Data (File JSON & Lokal)
                    </h4>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      src/data/dummyData.json
                    </span>
                  </div>
                </div>
                {dataSource === "LOCAL_DUMMY" && (
                  <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Menggunakan contoh data simulasi lengkap (Gaji, side project, makan, tagihan) yang tersimpan di file lokal <code className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">dummyData.json</code> tanpa membutuhkan internet/Firebase.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetDummyFromJSON();
                }}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset ke default JSON</span>
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {dataSource === "LOCAL_DUMMY" ? "Sedang Digunakan" : "Pilih Mode Ini"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Theme Preferences */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Tema Tampilan (Theme)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Pilih mode warna tampilan yang nyaman untuk mata Anda
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          <button
            onClick={() => setTheme("light")}
            className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
              theme === "light"
                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span>Terang (Light)</span>
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
              theme === "dark"
                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span>Gelap (Dark)</span>
          </button>

          <button
            onClick={() => setTheme("system")}
            className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
              theme === "system"
                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Laptop className="w-5 h-5 text-slate-400" />
            <span>Sistem</span>
          </button>
        </div>
      </div>

      {/* 3. Backup & Restore Data */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-500" />
          <span>Cadangkan & Ekspor Data (Backup)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Unduh data Anda dalam format CSV untuk spreadsheet atau JSON untuk backup lengkap
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Ekspor Semua Transaksi (.CSV)</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
          >
            <FileJson className="w-4 h-4 text-indigo-500" />
            <span>Backup Lengkap (.JSON)</span>
          </button>

          <button
            onClick={() => setShowImportBox(!showImportBox)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
          >
            <Upload className="w-4 h-4 text-amber-500" />
            <span>Pulihkan Data dari JSON</span>
          </button>
        </div>

        {showImportBox && (
          <form onSubmit={handleImport} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-3 animate-scale-in">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Tempel Kode JSON Cadangan
            </label>
            <textarea
              rows={4}
              required
              placeholder='{"accounts": [...], "transactions": [...]}'
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportBox(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
              >
                Restore Data
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4. Reset Demo Data */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-rose-500" />
          <span>Muat Ulang Data Simulasi Default</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Mengisi ulang data lokal dengan data contoh realistis dari file <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">src/data/dummyData.json</code>.
        </p>

        <button
          onClick={handleResetDummyFromJSON}
          className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 transition-colors"
        >
          Reset ke Data JSON Awal
        </button>
      </div>
    </div>
  );
}
