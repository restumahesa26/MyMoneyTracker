"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useFinance } from "@/context/FinanceContext";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { Scorecards } from "@/components/dashboard/Scorecards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { CashflowChart } from "@/components/analytics/CashflowChart";
import { CategoryBreakdownChart } from "@/components/analytics/CategoryBreakdownChart";
import { FinancialInsights } from "@/components/analytics/FinancialInsights";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { WalletModal } from "@/components/wallets/WalletModal";
import {
  LayoutDashboard,
  Plus,
  Wallet,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { accounts, transactions, dataSource } = useFinance();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const isRealDataEmpty = accounts.length === 0 && transactions.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Greeting & Global Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Dashboard & Ringkasan Keuangan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Halo {user?.displayName || "Pengguna"}, berikut ringkasan performa arus kas keuangan Anda
          </p>
        </div>

        {/* Global Date Filter */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <DateRangeFilter />
        </div>
      </div>

      {/* Real Data Empty Onboarding Banner */}
      {isRealDataEmpty && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-emerald-900/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-emerald-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Selamat Datang di Mode Data Real!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Database akun Anda masih bersih. Tambahkan dompet atau rekening pertama Anda untuk mulai mencatat keuangan pribadi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>+ Tambah Dompet</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Catat Cepat</span>
            </Link>
          </div>
        </div>
      )}

      {/* 5 Core Scorecards */}
      <Scorecards />

      {/* Charts Grid: Cashflow Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashflowChart />
        <CategoryBreakdownChart />
      </div>

      {/* Financial Health Insights */}
      <FinancialInsights />

      {/* Recent Transactions List */}
      <RecentTransactions limit={8} />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialType={modalType}
      />

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
}
